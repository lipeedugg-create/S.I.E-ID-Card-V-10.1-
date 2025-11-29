import { UserRole, FinancialRecord, Notice, Incident, UnitData, Poll, Reservation, User, SystemInfo, Permission, IdCardTemplate, Alert, Survey, Bill, AgendaEvent, Visitor, MaintenanceRecord } from './types';
import { LayoutDashboard, Wallet, Users, Map, Bell, ShieldAlert, CalendarClock, Settings, ClipboardList } from 'lucide-react';

export const MOCK_SYSTEM_INFO: SystemInfo = {
  name: 'ASSOCIAÇÃO DE MORADORES DE CACARIA',
  cnpj: '05.648.299/0001-63',
  address: 'RUA VITORINO TAVARES | CACARIA, LT 15 - PIRAÍ/RJ',
  email: 'contato@viverbem.org.br',
  phone: '(11) 3333-4444',
  website: 'www.viverbem.org.br',
  primaryColor: '#4f46e5',
  registrationMode: 'APPROVAL'
};

export const MOCK_USER: User = {
  id: '1',
  name: 'CARLOS MENDES DA SILVA',
  username: 'presidente',
  password: '123',
  unit: 'Bloco A - 102',
  role: UserRole.PRESIDENT,
  avatarUrl: 'https://picsum.photos/seed/carlos/200/200',
  email: 'carlos.mendes@condominio.com',
  phone: '(11) 99999-8888',
  cpfCnpj: '123.456.789-00',
  address: 'Rua das Flores, 123, Bloco A, Apt 102',
  admissionDate: '2022-11-26',
  active: true,
  notes: 'Presidente da Associação eleito em 2022.',
  qrCodeData: 'user-1-access-token',
  financialSettings: {
    monthlyFee: 0, // Isento
    dueDay: 10,
    isDonor: true,
    donationAmount: 50.00,
    autoGenerateCharge: true
  },
  financialStatus: 'OK',
  profileCompletion: 100
};

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['ALL'] },
  { id: 'users', label: 'Cadastros', icon: Users, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.SINDIC, UserRole.CONCIERGE] },
  { id: 'finance', label: 'Financeiro', icon: Wallet, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VICE_PRESIDENT, UserRole.SINDIC, UserRole.RESIDENT] },
  { id: 'social', label: 'Comunicação', icon: Bell, roles: ['ALL'] },
  { id: 'map', label: 'Mapa Inteligente', icon: Map, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.SINDIC, UserRole.CONCIERGE] },
  { id: 'operations', label: 'Operacional', icon: ShieldAlert, roles: [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.SINDIC, UserRole.CONCIERGE] },
  { id: 'surveys', label: 'Pesquisas & Censo', icon: ClipboardList, roles: ['ALL'] },
  { id: 'timeline', label: 'Agenda & Timeline', icon: CalendarClock, roles: ['ALL'] },
  { id: 'settings', label: 'Configurações', icon: Settings, roles: [UserRole.ADMIN, UserRole.PRESIDENT] },
];

export const AVAILABLE_ROLES = [
  'Administrador', 'Presidente', 'Vice-Presidente', 'Diretor Financeiro', 'Síndico', 'Morador', 'Porteiro', 'Conselheiro', 'Zelador', 'Comerciante', 'Visitante Frequente'
];

export const SYSTEM_PERMISSIONS: Permission[] = [
  { id: 'view_dashboard', label: 'Visualizar Dashboard', module: 'Geral' },
  { id: 'manage_users', label: 'Gerenciar Cadastros', module: 'Cadastros' },
  { id: 'financial_view', label: 'Visualizar Financeiro', module: 'Financeiro' },
  { id: 'financial_edit', label: 'Editar Financeiro', module: 'Financeiro' },
  { id: 'send_notices', label: 'Enviar Comunicados', module: 'Comunicação' },
  { id: 'manage_settings', label: 'Acessar Configurações', module: 'Sistema' },
];

export const MOCK_USERS_LIST: User[] = [
  {
    id: '0',
    name: 'ADMINISTRADOR DO SISTEMA',
    username: 'admin',
    password: '123',
    role: UserRole.ADMIN,
    active: true,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff',
    email: 'admin@sistema.com',
    profileCompletion: 100
  },
  MOCK_USER,
  {
    id: '2',
    name: 'ANA SILVA OLIVEIRA',
    username: 'ana.silva',
    password: '123',
    unit: 'Bloco B - 304',
    role: 'Morador',
    avatarUrl: 'https://picsum.photos/seed/ana/200/200',
    email: 'ana.silva@email.com',
    phone: '(11) 98888-7777',
    cpfCnpj: '222.333.444-55',
    active: true,
    admissionDate: '2023-05-10',
    financialSettings: {
        monthlyFee: 450.00,
        dueDay: 10,
        isDonor: false,
        autoGenerateCharge: true
    },
    financialStatus: 'OK',
    profileCompletion: 90
  },
  {
    id: '3',
    name: 'ROBERTO SANTOS',
    username: 'porteiro',
    password: '123',
    unit: 'Portaria Principal',
    role: 'Porteiro',
    avatarUrl: 'https://picsum.photos/seed/beto/200/200',
    email: 'roberto.portaria@sie.com',
    active: true,
    admissionDate: '2021-03-20',
    financialSettings: {
        monthlyFee: 0,
        dueDay: 1,
        isDonor: false,
        autoGenerateCharge: false
    },
    financialStatus: 'OK',
    profileCompletion: 80
  },
  {
    id: '4',
    name: 'MERCADINHO EXPRESS',
    username: 'loja01',
    password: '123',
    unit: 'Loja 01',
    role: 'Comerciante',
    avatarUrl: 'https://picsum.photos/seed/shop/200/200',
    cpfCnpj: '12.345.678/0001-99',
    email: 'contato@mercadinho.com',
    active: true,
    admissionDate: '2020-01-05',
    notes: 'Acesso liberado para fornecedores das 08h às 18h',
    financialSettings: {
        monthlyFee: 800.00,
        dueDay: 5,
        isDonor: false,
        autoGenerateCharge: true
    },
    financialStatus: 'OVERDUE',
    profileCompletion: 100
  }
];

export const MOCK_FINANCIALS: FinancialRecord[] = [
  { id: '1', description: 'Mensalidade - Unid 101', amount: 850.00, type: 'INCOME', status: 'PAID', date: '2023-10-05', category: 'Mensalidade', dueDate: '2023-10-10' },
  { id: '2', description: 'Manutenção Elevador', amount: 4500.00, type: 'EXPENSE', status: 'PAID', date: '2023-10-10', category: 'Manutenção', dueDate: '2023-10-10' },
  { id: '3', description: 'Jardinagem Mensal', amount: 1200.00, type: 'EXPENSE', status: 'PENDING', date: '2023-10-15', category: 'Serviços', dueDate: '2023-10-20' },
  { id: '4', description: 'Mensalidade - Unid 304', amount: 850.00, type: 'INCOME', status: 'OVERDUE', date: '2023-10-05', category: 'Mensalidade', dueDate: '2023-10-10' },
  { id: '5', description: 'Reserva Salão de Festas', amount: 150.00, type: 'INCOME', status: 'PAID', date: '2023-10-12', category: 'Reservas', dueDate: '2023-10-12' },
  { id: '6', description: 'Compra de Material Limpeza', amount: 350.00, type: 'EXPENSE', status: 'PAID', date: '2023-10-01', category: 'Material', dueDate: '2023-10-01' },
  { id: '7', description: 'Conta de Energia (Área Comum)', amount: 1250.00, type: 'EXPENSE', status: 'PENDING', date: '2023-10-25', category: 'Utilidades', dueDate: '2023-11-05' },
];

export const MOCK_BILLS: Bill[] = [
    { id: 'b1', userId: '2', userName: 'Ana Silva Oliveira', unit: 'Bloco B - 304', amount: 450.00, dueDate: '2023-11-10', status: 'PENDING', barcode: '83620000000-1 45000000000-2', month: '11/2023' },
    { id: 'b2', userId: '4', userName: 'Mercadinho Express', unit: 'Loja 01', amount: 800.00, dueDate: '2023-10-05', status: 'OVERDUE', barcode: '83620000000-3 80000000000-4', month: '10/2023' },
    { id: 'b3', userId: '1', userName: 'Carlos Mendes', unit: 'Bloco A - 102', amount: 50.00, dueDate: '2023-11-10', status: 'PAID', barcode: '83620000000-5 5000000000-6', month: '11/2023' },
];

export const MOCK_NOTICES: Notice[] = [
  { id: '1', title: 'Manutenção na Rede Elétrica', content: 'Haverá desligamento programado na próxima terça-feira das 09h às 12h para reparos.', urgency: 'HIGH', date: '2023-10-25', author: 'Administração' },
  { id: '2', title: 'Assembleia Geral Ordinária', content: 'Convocação para aprovação das contas do exercício anterior.', urgency: 'MEDIUM', date: '2023-10-28', author: 'Síndico' },
  { id: '3', title: 'Feira Orgânica no Condomínio', content: 'Todos os sábados pela manhã teremos feira orgânica na praça central.', urgency: 'LOW', date: '2023-10-20', author: 'Comitê Social' },
];

export const MOCK_ALERTS: Alert[] = [
  { id: 'a1', title: 'Portão Principal Travado', message: 'Técnico já foi acionado. Previsão de reparo: 14:00.', type: 'WARNING', target: 'ALL', channels: ['APP', 'WHATSAPP'], date: '2023-11-01T10:30:00', sentBy: 'Portaria' },
  { id: 'a2', title: 'Entrega de Encomendas', message: 'Correios na portaria para entregas do Bloco A.', type: 'INFO', target: 'BLOCK_A', channels: ['APP'], date: '2023-11-01T11:15:00', sentBy: 'Zelador' },
  { id: 'a3', title: 'Festa Junina Confirmada!', message: 'Agradecemos a todos que confirmaram presença.', type: 'SUCCESS', target: 'ALL', channels: ['EMAIL', 'APP'], date: '2023-10-30T09:00:00', sentBy: 'Comitê Social' }
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: '1', title: 'Lâmpada queimada no Hall', location: 'Bloco A - Térreo', status: 'OPEN', reportedBy: 'Maria Silva', date: '2023-10-26', priority: 'LOW' },
  { id: '2', title: 'Portão da garagem travando', location: 'Portaria Principal', status: 'IN_PROGRESS', reportedBy: 'Porteiro João', date: '2023-10-25', priority: 'HIGH' },
];

export const MOCK_UNITS: UnitData[] = Array.from({ length: 24 }).map((_, i) => {
  const block = i < 12 ? 'A' : 'B';
  const floor = Math.floor((i % 12) / 4) + 1;
  const num = (i % 4) + 1;
  const unitNum = `${floor}0${num}`;
  
  const rand = Math.random();
  let status: UnitData['status'] = 'OK';
  if (rand > 0.8) status = 'DEBT';
  else if (rand > 0.6) status = 'WARNING';

  return {
    id: `unit-${i}`,
    block,
    number: unitNum,
    status,
    residentName: `Morador ${block}-${unitNum}`
  };
});

export const MOCK_POLLS: Poll[] = [
  {
    id: '1',
    question: 'Aprovação da cor para pintura da fachada',
    status: 'ACTIVE',
    endDate: '2023-11-01',
    totalVotes: 45,
    externalLink: 'https://viverbem.org.br/v/fachada-2023',
    options: [
      { id: 'opt1', text: 'Azul Clássico', votes: 20 },
      { id: 'opt2', text: 'Cinza Concreto', votes: 15 },
      { id: 'opt3', text: 'Manter atual', votes: 10 },
    ]
  }
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: '1', area: 'Salão de Festas', date: '2023-11-04', startTime: '18:00', endTime: '23:00', resident: 'Apt 102 - Bloco A', status: 'CONFIRMED' },
  { id: '2', area: 'Churrasqueira 1', date: '2023-11-05', startTime: '12:00', endTime: '16:00', resident: 'Apt 301 - Bloco B', status: 'PENDING' },
];

export const MOCK_VISITORS: Visitor[] = [
    { id: 'v1', name: 'João Entregador', document: '12.345.678-9', type: 'DELIVERY', destinationUnit: 'Bloco A - 202', entryTime: '2023-11-01T14:30:00', exitTime: '2023-11-01T14:45:00', registeredBy: 'Portaria' },
    { id: 'v2', name: 'Maria Visita', document: '98.765.432-1', type: 'VISITOR', destinationUnit: 'Bloco B - 101', entryTime: '2023-11-01T15:00:00', registeredBy: 'Portaria' },
];

export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
    { id: 'm1', title: 'Troca de Óleo Gerador', type: 'PREVENTIVE', status: 'COMPLETED', date: '2023-10-15', cost: 850.00, assignedTo: 'Empresa XYZ' },
    { id: 'm2', title: 'Reparo Vazamento Piscina', type: 'CORRECTIVE', status: 'SCHEDULED', date: '2023-11-10', assignedTo: 'Hidráulica Silva' },
];

export const MOCK_AGENDA: AgendaEvent[] = [
    {
        id: 'ev1',
        title: 'Assembleia Geral Ordinária',
        description: 'Votação do orçamento 2024 e eleição do conselho.',
        date: '2023-11-15T19:00:00',
        type: 'MEETING',
        location: 'Salão de Festas',
        status: 'UPCOMING',
        createdBy: 'Síndico'
    },
    {
        id: 'ev2',
        title: 'Manutenção de Bombas',
        description: 'Limpeza e manutenção preventiva das bombas d\'água.',
        date: '2023-11-10T08:00:00',
        type: 'MAINTENANCE',
        location: 'Casa de Máquinas',
        status: 'UPCOMING',
        createdBy: 'Zelador'
    },
    {
        id: 'ev3',
        title: 'Vencimento Boleto Mensal',
        description: 'Prazo final para pagamento com desconto.',
        date: '2023-11-10T23:59:59',
        type: 'DEADLINE',
        status: 'UPCOMING',
        createdBy: 'Sistema'
    },
    {
        id: 'ev4',
        title: 'Festa de Fim de Ano',
        description: 'Confraternização dos moradores.',
        date: '2023-12-16T14:00:00',
        type: 'EVENT',
        location: 'Área de Lazer',
        status: 'UPCOMING',
        createdBy: 'Comitê Social'
    }
];

export const MOCK_SURVEYS: Survey[] = [
    {
        id: 's1',
        title: 'Censo Demográfico 2023',
        description: 'Atualização obrigatória dos dados de todos os residentes para o novo sistema de segurança.',
        type: 'CENSUS',
        status: 'ACTIVE',
        startDate: '2023-10-01',
        endDate: '2023-12-31',
        externalAccess: true,
        externalLink: 'https://viverbem.org.br/censo/2023',
        responseCount: 142,
        questions: [
            { id: 'q1', text: 'Quantas pessoas residem na unidade?', type: 'choice', options: ['1', '2', '3', '4', '5+'] },
            { id: 'q2', text: 'Possui animais de estimação?', type: 'choice', options: ['Sim', 'Não'] },
            { id: 'q3', text: 'Veículos cadastrados (Placas)', type: 'text' }
        ]
    },
    {
        id: 's2',
        title: 'Pesquisa de Satisfação - Áreas Comuns',
        description: 'Queremos saber sua opinião sobre a limpeza e manutenção das áreas de lazer.',
        type: 'SATISFACTION',
        status: 'ACTIVE',
        startDate: '2023-11-01',
        endDate: '2023-11-15',
        externalAccess: false,
        responseCount: 38,
        questions: [
            { id: 'sq1', text: 'Como você avalia a limpeza da piscina?', type: 'rating' },
            { id: 'sq2', text: 'Como você avalia a academia?', type: 'rating' }
        ]
    }
];

// --- MOCK TEMPLATES ---
export const MOCK_TEMPLATES: IdCardTemplate[] = [
  {
    id: 'tpl_official_green',
    name: 'Modelo Oficial (Verde/Amarelo)',
    width: 340,
    height: 215,
    orientation: 'landscape',
    frontBackground: '#ffffff',
    backBackground: '#ffffff',
    elements: [
      // HEADER (Green Bar)
      { id: 'bg_header', type: 'shape', label: 'Barra Verde', x: 0, y: 0, width: 340, height: 45, style: { backgroundColor: '#15803d', borderRadius: '8px 8px 0 0' }, layer: 'front' },
      
      // LOGO (Top Left inside header)
      { id: 'e1', type: 'image', label: 'Logo Header', field: 'system.logo', x: 4, y: 3, width: 32, height: 32, style: { borderRadius: '50%', backgroundColor: 'white', padding: '2px' }, layer: 'front' },
      
      // ASSOC NAME (Top Right)
      { id: 'e2', type: 'text-dynamic', label: 'Nome Assoc.', field: 'system.name', x: 18, y: 5, width: 80, style: { color: 'white', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right', width: '270px' }, layer: 'front' },
       { id: 'e2b', type: 'text-static', label: 'Cidade', content: 'PIRAÍ - RJ', x: 18, y: 14, width: 80, style: { color: '#86efac', fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right', width: '270px' }, layer: 'front' },

      // WATERMARK (Center)
      { id: 'e_watermark', type: 'image', label: 'Marca D\'água', field: 'system.logo', x: 35, y: 25, width: 120, height: 120, style: { opacity: 0.1, filter: 'grayscale(100%)' }, layer: 'front' },

      // PHOTO (Left)
      { id: 'e3', type: 'image', label: 'Foto', field: 'avatarUrl', x: 5, y: 26, width: 75, height: 85, style: { borderRadius: '6px', border: '2px solid #15803d', backgroundColor: '#f3f4f6' }, layer: 'front' },

      // FIELDS (Right)
      // Name
      { id: 'lbl_name', type: 'text-static', label: 'Label Nome', content: 'NOME COMPLETO', x: 30, y: 26, style: { color: '#6b7280', fontSize: '6px', fontWeight: 'bold' }, layer: 'front' },
      { id: 'e4', type: 'text-dynamic', label: 'Nome', field: 'name', x: 30, y: 29, style: { color: '#64748b', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', width: '220px', whiteSpace: 'nowrap', overflow: 'hidden' }, layer: 'front' },
      
      // RG / CPF Grid
      { id: 'lbl_rg', type: 'text-static', label: 'Label RG', content: 'RG', x: 30, y: 40, style: { color: '#6b7280', fontSize: '6px', fontWeight: 'bold' }, layer: 'front' },
      { id: 'val_rg', type: 'text-static', label: 'RG Val', content: '00.000.000-0', x: 30, y: 43, style: { color: '#64748b', fontSize: '10px' }, layer: 'front' },
      
      { id: 'lbl_born', type: 'text-static', label: 'Label Nasc', content: 'NASCIMENTO', x: 65, y: 40, style: { color: '#6b7280', fontSize: '6px', fontWeight: 'bold' }, layer: 'front' },
      { id: 'val_born', type: 'text-dynamic', label: 'Nascimento', field: 'admissionDate', x: 65, y: 43, style: { color: '#64748b', fontSize: '10px' }, layer: 'front' },

      { id: 'lbl_cpf', type: 'text-static', label: 'Label CPF', content: 'CPF', x: 30, y: 52, style: { color: '#6b7280', fontSize: '6px', fontWeight: 'bold' }, layer: 'front' },
      { id: 'e7', type: 'text-dynamic', label: 'CPF', field: 'cpfCnpj', x: 30, y: 55, style: { color: '#64748b', fontSize: '10px', fontWeight: 'bold' }, layer: 'front' },

      // BADGE (Role)
      { id: 'bg_badge', type: 'shape', label: 'Fundo Cargo', x: 5, y: 68, width: 75, height: 18, style: { backgroundColor: '#15803d', borderRadius: '12px' }, layer: 'front' },
      { id: 'e5', type: 'text-dynamic', label: 'Cargo', field: 'role', x: 5, y: 70, style: { color: 'white', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', width: '75px', textAlign: 'center' }, layer: 'front' },
      
      // MEMBER INFO
      { id: 'lbl_member', type: 'text-static', label: 'Membro desde', content: 'Membro desde 26/11/2025', x: 70, y: 75, style: { color: '#9ca3af', fontSize: '7px', fontStyle: 'italic', textAlign: 'right', width: '90px' }, layer: 'front' },
      { id: 'lbl_mandate', type: 'text-static', label: 'Mandato', content: 'MANDATO: NOV DE 2025 A ...', x: 60, y: 79, style: { color: '#15803d', fontSize: '8px', fontWeight: 'bold', textAlign: 'right', width: '125px' }, layer: 'front' },

      // FOOTER (Yellow Bar)
      { id: 'bg_footer', type: 'shape', label: 'Barra Amarela', x: 0, y: 88, width: 340, height: 26, style: { backgroundColor: '#facc15', borderRadius: '0 0 8px 8px' }, layer: 'front' },
      { id: 'txt_footer', type: 'text-dynamic', label: 'Endereço', field: 'system.address', x: 5, y: 91, width: 330, style: { color: '#000', fontSize: '6px', fontWeight: 'bold', textAlign: 'center' }, layer: 'front' },
      { id: 'txt_cnpj', type: 'text-dynamic', label: 'CNPJ', field: 'system.cnpj', x: 5, y: 94, width: 330, style: { color: '#000', fontSize: '6px', fontWeight: 'bold', textAlign: 'center' }, layer: 'front' },

      // BACK SIDE
      { id: 'e8', type: 'qrcode', label: 'QR', field: 'qrCodeData', x: 40, y: 25, width: 70, height: 70, style: {}, layer: 'back' },
      { id: 'e9', type: 'text-static', label: 'Instrução', content: 'Escaneie para validar o acesso', x: 20, y: 65, width: 60, style: { color: '#000', fontSize: '10px', textAlign: 'center' }, layer: 'back' },
    ]
  },
  {
    id: 'tpl_modern',
    name: 'Executivo Vertical',
    width: 215,
    height: 340,
    orientation: 'portrait',
    frontBackground: 'linear-gradient(to bottom, #111827, #374151)',
    backBackground: '#f3f4f6',
    elements: [
       { id: 'm1', type: 'image', label: 'Foto', field: 'avatarUrl', x: 25, y: 15, width: 100, height: 100, style: { borderRadius: '50%', border: '4px solid #4f46e5' }, layer: 'front' },
       { id: 'm2', type: 'text-dynamic', label: 'Nome', field: 'name', x: 10, y: 50, style: { color: 'white', fontSize: '18px', fontWeight: 'bold', width: '100%', textAlign: 'center' }, layer: 'front' },
       { id: 'm3', type: 'text-dynamic', label: 'Cargo', field: 'role', x: 10, y: 58, style: { color: '#818cf8', fontSize: '14px', width: '100%', textAlign: 'center', textTransform: 'uppercase' }, layer: 'front' },
       { id: 'm4', type: 'image', label: 'Logo', field: 'system.logo', x: 40, y: 85, width: 40, height: 40, style: {}, layer: 'front' }
    ]
  }
];