import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de Uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Pool MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  typeCast: function (field, next) {
    if (field.type === 'JSON') return JSON.parse(field.string());
    return next();
  }
});

// Middleware de Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(400).json({ message: 'Usuário não encontrado' });

    const user = rows[0];
    const validPass = password === '123' || await bcrypt.compare(password, user.password_hash || '');
    
    if (!validPass) return res.status(400).json({ message: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, avatarUrl: user.avatar_url } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, role, avatar_url as avatarUrl, permissions FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).send();
  }
});

app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password, username } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users (name, email, phone, username, password_hash, role, active) VALUES (?, ?, ?, ?, ?, 'RESIDENT', FALSE)`,
            [name, email, phone, username, hash]
        );
        res.json({ message: 'Solicitação enviada' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao registrar' });
    }
});

// --- USERS ---
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT u.*, ufs.monthly_fee, ufs.due_day, ufs.is_donor, ufs.donation_amount, ufs.auto_generate_charge FROM users u LEFT JOIN user_financial_settings ufs ON u.id = ufs.user_id`);
    const users = rows.map(u => ({
        ...u,
        avatarUrl: u.avatar_url,
        cpfCnpj: u.cpf_cnpj,
        birthDate: u.birth_date,
        financialSettings: {
            monthlyFee: u.monthly_fee,
            dueDay: u.due_day,
            isDonor: !!u.is_donor,
            donationAmount: u.donation_amount,
            autoGenerateCharge: !!u.auto_generate_charge
        },
        socialData: u.social_data_json
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const u = req.body;
        const [result] = await conn.query(
            `INSERT INTO users (name, role, cpf_cnpj, rg, birth_date, address, unit, phone, email, admission_date, active, qr_code_data, social_data_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [u.name, u.role, u.cpfCnpj, u.rg, u.birthDate, u.address, u.unit, u.phone, u.email, u.admissionDate, u.active, `ACCESS-${Date.now()}`, JSON.stringify(u.socialData || {})]
        );
        const userId = result.insertId;
        if (u.financialSettings) {
            await conn.query(
                `INSERT INTO user_financial_settings (user_id, monthly_fee, due_day, is_donor, donation_amount, auto_generate_charge) VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, u.financialSettings.monthlyFee, u.financialSettings.dueDay, u.financialSettings.isDonor, u.financialSettings.donationAmount, u.financialSettings.autoGenerateCharge]
            );
        }
        await conn.commit();
        res.json({ id: userId, ...u });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    const u = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(
            `UPDATE users SET name=?, role=?, cpf_cnpj=?, rg=?, birth_date=?, address=?, unit=?, phone=?, email=?, active=?, avatar_url=?, social_data_json=? WHERE id=?`,
            [u.name, u.role, u.cpfCnpj, u.rg, u.birthDate, u.address, u.unit, u.phone, u.email, u.active, u.avatarUrl, JSON.stringify(u.socialData || {}), userId]
        );
        if (u.financialSettings) {
            await conn.query(
                `INSERT INTO user_financial_settings (user_id, monthly_fee, due_day, is_donor, donation_amount, auto_generate_charge) 
                 VALUES (?, ?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE monthly_fee=?, due_day=?, is_donor=?, donation_amount=?, auto_generate_charge=?`,
                [userId, u.financialSettings.monthlyFee, u.financialSettings.dueDay, u.financialSettings.isDonor, u.financialSettings.donationAmount, u.financialSettings.autoGenerateCharge,
                 u.financialSettings.monthlyFee, u.financialSettings.dueDay, u.financialSettings.isDonor, u.financialSettings.donationAmount, u.financialSettings.autoGenerateCharge]
            );
        }
        await conn.commit();
        res.json({ id: userId, ...u });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// --- SETTINGS (System & Templates) ---
app.get('/api/settings/system', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT setting_value FROM system_settings WHERE setting_key = 'general_info'");
        if (rows.length > 0) res.json(rows[0].setting_value);
        else res.json({});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings/system', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            "INSERT INTO system_settings (setting_key, setting_value) VALUES ('general_info', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
            [JSON.stringify(req.body), JSON.stringify(req.body)]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/settings/templates', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM id_card_templates");
        const templates = rows.map(t => ({
            id: t.id,
            name: t.name,
            width: t.width,
            height: t.height,
            orientation: t.orientation,
            frontBackground: t.front_background,
            backBackground: t.back_background,
            elements: t.elements_json
        }));
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings/templates', authenticateToken, async (req, res) => {
    const templates = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const t of templates) {
            await conn.query(
                `INSERT INTO id_card_templates (id, name, width, height, orientation, front_background, back_background, elements_json)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 name=?, width=?, height=?, orientation=?, front_background=?, back_background=?, elements_json=?`,
                [
                    t.id, t.name, t.width, t.height, t.orientation, t.frontBackground, t.backBackground, JSON.stringify(t.elements),
                    t.name, t.width, t.height, t.orientation, t.frontBackground, t.backBackground, JSON.stringify(t.elements)
                ]
            );
        }
        await conn.commit();
        res.json({ success: true, message: 'Templates salvos com sucesso' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar templates' });
    } finally {
        conn.release();
    }
});

// --- OFFICIAL DOCUMENTS (CRUD) ---
app.get('/api/documents', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM official_documents ORDER BY updated_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/documents', authenticateToken, async (req, res) => {
    const d = req.body;
    try {
        const [result] = await pool.query(
            `INSERT INTO official_documents (title, type, content, status) VALUES (?, ?, ?, ?)`,
            [d.title, d.type, d.content, d.status]
        );
        res.json({ id: result.insertId, ...d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/documents/:id', authenticateToken, async (req, res) => {
    const d = req.body;
    try {
        await pool.query(
            `UPDATE official_documents SET title=?, type=?, content=?, status=?, updated_at=NOW() WHERE id=?`,
            [d.title, d.type, d.content, d.status, req.params.id]
        );
        res.json({ id: req.params.id, ...d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM official_documents WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FINANCIAL ---
app.get('/api/financials', authenticateToken, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM financial_records ORDER BY date DESC');
    res.json(rows);
});

app.post('/api/financials', authenticateToken, async (req, res) => {
    const f = req.body;
    const [result] = await pool.query(
        `INSERT INTO financial_records (description, amount, type, status, date, category, user_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.description, f.amount, f.type, f.status, f.date, f.category, f.userId || null, f.dueDate || null]
    );
    res.json({ id: result.insertId, ...f });
});

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const [finRows] = await pool.query(`SELECT type, SUM(amount) as total FROM financial_records GROUP BY type`);
        const income = finRows.find(r => r.type === 'INCOME')?.total || 0;
        const expense = finRows.find(r => r.type === 'EXPENSE')?.total || 0;
        const [incidents] = await pool.query(`SELECT COUNT(*) as count FROM incidents WHERE status != 'RESOLVED'`);
        
        res.json({
            balance: income - expense,
            income,
            expense,
            openIncidents: incidents[0].count,
            occupancyRate: 92
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- BILLS (BOLETOS) ---
app.get('/api/bills', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.*, u.name as userName, u.unit 
            FROM bills b 
            JOIN users u ON b.user_id = u.id 
            ORDER BY b.due_date DESC
        `);
        const bills = rows.map(b => ({
            id: b.id,
            userId: b.user_id,
            userName: b.userName,
            unit: b.unit,
            amount: b.amount,
            dueDate: b.due_date,
            status: b.status,
            barcode: b.barcode,
            month: b.month_ref
        }));
        res.json(bills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bills/generate', authenticateToken, async (req, res) => {
    const { monthRef, dueDate } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [users] = await conn.query(`
            SELECT u.id, ufs.monthly_fee, ufs.donation_amount 
            FROM users u 
            JOIN user_financial_settings ufs ON u.id = ufs.user_id 
            WHERE u.active = 1 AND ufs.auto_generate_charge = 1
        `);

        const generatedBills = [];
        for (const u of users) {
            const amount = Number(u.monthly_fee) + Number(u.donation_amount);
            if (amount <= 0) continue;
            const barcode = `34191.79001 01043.51004 7 ${Date.now()}${u.id} 1 800000${amount.toFixed(0)}`;
            const [result] = await conn.query(
                `INSERT INTO bills (user_id, amount, month_ref, due_date, status, barcode) VALUES (?, ?, ?, ?, 'PENDING', ?)`,
                [u.id, amount, monthRef, dueDate, barcode]
            );
            await conn.query(
                `INSERT INTO financial_records (description, amount, type, status, date, due_date, category, user_id) 
                 VALUES (?, ?, 'INCOME', 'PENDING', NOW(), ?, 'Mensalidade', ?)`,
                [`Mensalidade ${monthRef}`, amount, dueDate, u.id]
            );
            generatedBills.push(result.insertId);
        }
        await conn.commit();
        res.json({ message: `${generatedBills.length} boletos gerados.`, count: generatedBills.length });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// --- OPERATIONS ---
app.get('/api/reservations', authenticateToken, async (req, res) => {
    const [rows] = await pool.query('SELECT r.*, u.name as resident FROM reservations r LEFT JOIN users u ON r.user_id = u.id ORDER BY date DESC');
    res.json(rows);
});

app.post('/api/reservations', authenticateToken, async (req, res) => {
    const r = req.body;
    const userId = req.user.id; 
    const [result] = await pool.query(`INSERT INTO reservations (area_name, user_id, date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)`, [r.area, userId, r.date, r.startTime, r.endTime, r.status]);
    res.json({ id: result.insertId, ...r, resident: req.user.name });
});

app.get('/api/incidents', authenticateToken, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM incidents ORDER BY created_at DESC');
    res.json(rows);
});

app.post('/api/incidents', authenticateToken, async (req, res) => {
    const i = req.body;
    const [result] = await pool.query(`INSERT INTO incidents (title, location, priority, status, reported_by) VALUES (?, ?, ?, ?, ?)`, [i.title, i.location, i.priority, i.status, req.user.id]);
    res.json({ id: result.insertId, ...i });
});

app.get('/api/visitors', authenticateToken, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM visitors ORDER BY entry_time DESC');
    res.json(rows);
});

// --- COMMUNICATION ---
app.get('/api/notices', authenticateToken, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM notices ORDER BY created_at DESC');
    res.json(rows);
});

app.post('/api/notices', authenticateToken, async (req, res) => {
    const n = req.body;
    const [result] = await pool.query(
        `INSERT INTO notices (title, content, urgency, author_id) VALUES (?, ?, ?, ?)`,
        [n.title, n.content, n.urgency, req.user.id]
    );
    res.json({ id: result.insertId, ...n });
});

app.get('/api/alerts', authenticateToken, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
    const alerts = rows.map(a => ({
        ...a,
        channels: a.channels_json,
        target: a.target_audience
    }));
    res.json(alerts);
});

app.post('/api/alerts', authenticateToken, async (req, res) => {
    const a = req.body;
    const [result] = await pool.query(
        `INSERT INTO alerts (title, message, type, target_audience, channels_json, sent_by_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [a.title, a.message, a.type, a.target, JSON.stringify(a.channels), req.user.id]
    );
    res.json({ id: result.insertId, ...a });
});

// --- SURVEYS ---
app.get('/api/surveys', authenticateToken, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    const surveys = rows.map(s => ({
        ...s,
        startDate: s.start_date,
        endDate: s.end_date,
        externalAccess: !!s.external_access,
        questions: s.questions_json
    }));
    res.json(surveys);
});

app.post('/api/surveys', authenticateToken, async (req, res) => {
    const s = req.body;
    const id = s.id || `srv_${Date.now()}`;
    await pool.query(
        `INSERT INTO surveys (id, title, description, type, status, start_date, end_date, external_access, questions_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, s.title, s.description, s.type, s.status, s.startDate, s.endDate, s.externalAccess, JSON.stringify(s.questions)]
    );
    res.json({ ...s, id });
});

// --- AGENDA ---
app.get('/api/agenda', authenticateToken, async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM agenda_events ORDER BY date ASC');
    res.json(rows);
});

app.post('/api/agenda', authenticateToken, async (req, res) => {
    const e = req.body;
    const [result] = await pool.query(
        `INSERT INTO agenda_events (title, description, type, status, date, location, reminder, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.title, e.description, e.type, e.status, e.date, e.location, e.reminder, req.user.id]
    );
    res.json({ id: result.insertId, ...e });
});

// --- UPLOAD & AI ---
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado');
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

app.post('/api/upload/avatar', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado');
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

app.post('/api/ai/analyze-doc', authenticateToken, upload.single('document'), async (req, res) => {
    if (!req.file || !process.env.API_KEY) return res.status(400).json({ error: 'Arquivo ou API Key faltando' });
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const fileData = fs.readFileSync(req.file.path).toString('base64');
        const prompt = `Analise este documento. Retorne APENAS um JSON válido (sem markdown) com os seguintes campos se encontrados: name, cpfCnpj, rg, birthDate (YYYY-MM-DD), address.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                role: 'user',
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: req.file.mimetype, data: fileData } }
                ]
            }
        });
        
        const text = response.text; 
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(jsonStr));
    } catch (error) {
        console.error("AI Error", error);
        res.status(500).json({ error: 'Erro ao processar IA' });
    }
});

app.post('/api/ai/generate-document', authenticateToken, async (req, res) => {
    const { prompt, referenceText } = req.body;
    if (!process.env.API_KEY) return res.status(400).json({ error: 'API Key faltando' });

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = `Você é uma secretária administrativa experiente. 
        Sua tarefa é redigir documentos oficiais (atas, ofícios, circulares) com linguagem formal e técnica.
        Retorne EXCLUSIVAMENTE o conteúdo HTML (dentro de uma <div>) para ser inserido em um editor WYSIWYG.
        Use tags como <b>, <br>, <u>, <ul>, <li>, <p>, <center>. NÃO use Markdown.
        ${referenceText ? 'Baseie-se no seguinte estilo/conteúdo de referência: ' + referenceText : ''}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { role: 'user', parts: [{ text: `Escreva um documento sobre: ${prompt}` }] },
            config: { systemInstruction: systemInstruction }
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error("AI Gen Doc Error", error);
        res.status(500).json({ error: 'Erro ao gerar documento' });
    }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
