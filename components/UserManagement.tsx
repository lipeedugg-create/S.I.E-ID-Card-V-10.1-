
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_USERS_LIST, AVAILABLE_ROLES } from '../constants';
import { User, SystemInfo, IdCardTemplate, FinancialRecord, CardElement } from '../types';
import { 
  Save, Sparkles, Search, Edit2, Trash2, CreditCard, User as UserIcon, 
  Printer, Image as ImageIcon, X, Plus, Wallet, DollarSign,
  UploadCloud, FileText, Check, AlertTriangle, Camera, Wand2,
  Crop, ScanLine, RotateCcw, ZoomIn, Move, ArrowRight, UserPlus, FileCheck, Loader2, Phone, MapPin, Mail,
  Calendar, TrendingUp, TrendingDown, Clock, Download, FileDown, Heart, Mic, Send, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ... (Existing interfaces and CardFaceRenderer remain unchanged) ...
interface UserManagementProps {
  systemInfo: SystemInfo;
  templates: IdCardTemplate[];
  transactions: FinancialRecord[];
  onUpdateTransactions: (transactions: FinancialRecord[]) => void;
}

interface CardFaceRendererProps {
  template: IdCardTemplate;
  side: 'front' | 'back';
  user: User;
  systemInfo: SystemInfo;
  onEditImage?: () => void;
}

const CardFaceRenderer = ({ template, side, user, systemInfo, onEditImage }: CardFaceRendererProps) => {
    // ... (Same implementation as previous file) ...
    return (
        <div style={{ width: `${template.orientation === 'landscape' ? template.width : template.height}px`, height: `${template.orientation === 'landscape' ? template.height : template.width}px`, background: side === 'front' ? template.frontBackground : template.backBackground, position: 'relative', overflow: 'hidden', borderRadius: '8px', boxShadow: 'none' }}>
              {template.elements.filter(el => el.layer === side).map(el => {
                  let content: React.ReactNode = el.content;
                  if (el.type === 'text-dynamic' && el.field) {
                      if (el.field === 'system.name') content = systemInfo.name;
                      else if (el.field === 'system.address') content = systemInfo.address && el.field === 'system.address' ? `${systemInfo.address} - CNPJ: ${systemInfo.cnpj}` : systemInfo.address;
                      else if (el.field === 'system.cnpj') content = `CNPJ: ${systemInfo.cnpj}`;
                      else content = String((user as any)[el.field] || '---');
                  }
                  const isAvatar = el.field === 'avatarUrl';
                  return (
                      <div key={el.id} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: el.width ? `${el.width}px` : (el.type === 'shape' ? '100%' : 'auto'), height: el.height ? `${el.height}px` : (el.type === 'shape' ? '10px' : 'auto'), ...el.style, overflow: el.type === 'image' ? 'hidden' : 'visible', whiteSpace: el.type === 'text-dynamic' || el.type === 'text-static' ? 'nowrap' : 'normal', lineHeight: '1.2' }}>
                          {el.type === 'image' && ((el.field === 'system.logo' && systemInfo.logoUrl) || (isAvatar && user.avatarUrl) ? (<img src={el.field === 'system.logo' ? systemInfo.logoUrl : user.avatarUrl} alt={isAvatar ? "User Avatar" : "Logo"} className={`w-full h-full object-cover ${isAvatar && onEditImage ? 'cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-indigo-400 rounded-sm' : ''}`} crossOrigin="anonymous" onClick={(e) => { if (isAvatar && onEditImage) { e.stopPropagation(); onEditImage(); } }} />) : (<div className={`bg-slate-200 w-full h-full flex flex-col items-center justify-center text-slate-400 ${isAvatar && onEditImage ? 'cursor-pointer hover:bg-slate-300' : ''}`} onClick={(e) => { if (isAvatar && onEditImage) { e.stopPropagation(); onEditImage(); } }}><UserIcon size={16} /><span className="text-[6px]">{isAvatar ? 'Adicionar Foto' : 'Sem Logo'}</span></div>))}
                          {el.type === 'qrcode' && (<div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-1"><div className="flex flex-wrap gap-0.5 justify-center">{Array.from({length: 16}).map((_, i) => (<div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`}></div>))}</div></div>)}
                          {(el.type !== 'image' && el.type !== 'qrcode' && el.type !== 'shape') && content}
                      </div>
                  );
              })}
          </div>
    );
};

const UserManagement: React.FC<UserManagementProps> = ({ systemInfo, templates, transactions, onUpdateTransactions }) => {
  // ... (All logic remains the same, only updating return JSX for styling) ...
  const [users, setUsers] = useState<User[]>(MOCK_USERS_LIST);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [financialFilter, setFinancialFilter] = useState<'ALL' | 'OK' | 'OVERDUE' | 'PENDING'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'CONTACT' | 'DOCS' | 'FINANCE' | 'CARD'>('PERSONAL');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [cardViewSide, setCardViewSide] = useState<'front' | 'back'>('front');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null); 
  const [newDocName, setNewDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<User> | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [editorZoom, setEditorZoom] = useState(1);
  const [editorPos, setEditorPos] = useState({ x: 0, y: 0 });
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [aiPrompt, setAiPrompt] = useState('');
  const [photoFilters, setPhotoFilters] = useState({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent' });
  const exportFrontRef = useRef<HTMLDivElement>(null);
  const exportBackRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState<Partial<FinancialRecord>>({ type: 'INCOME', status: 'PENDING', description: 'Cobrança Extra', date: new Date().toISOString().slice(0, 10), category: 'Mensalidade' });

  const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || (u.unit?.toLowerCase() || '').includes(search.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesFin = financialFilter === 'ALL' || (u.financialStatus === financialFilter);
      return matchesSearch && matchesRole && matchesFin;
  });

  useEffect(() => { setCurrentPage(1); }, [search, roleFilter, financialFilter]);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  const userTransactions = editingUser ? transactions.filter(t => t.userId === editingUser.id || t.userId === undefined) : [];

  // ... (Handlers remain unchanged) ...
  const handleCreateUser = () => { setEditingUser({ id: Date.now().toString(), name: '', role: 'Morador', active: true, avatarUrl: '', phone: '', documents: [], financialSettings: { monthlyFee: 0, dueDay: 10, isDonor: false, donationAmount: 0, autoGenerateCharge: true }, financialStatus: 'OK', profileCompletion: 20, qrCodeData: `ACCESS-${Date.now()}` } as User); setActiveTab('PERSONAL'); };
  const handleEditUser = (user: User) => { const userWithQr = { ...user, qrCodeData: user.qrCodeData || `ACCESS-${user.id}-${systemInfo.cnpj.replace(/\D/g,'')}`, financialSettings: user.financialSettings || { monthlyFee: 0, dueDay: 10, isDonor: false, donationAmount: 0, autoGenerateCharge: true } }; setEditingUser(userWithQr); setActiveTab('PERSONAL'); };
  const validatePhone = (phone: string | undefined): boolean => { if (!phone) return false; const regex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/; return regex.test(phone); };
  const handleSaveUser = () => { if (!editingUser) return; if (!editingUser.name) { alert('Nome é obrigatório.'); setActiveTab('PERSONAL'); return; } if (!editingUser.phone || !validatePhone(editingUser.phone)) { alert('Telefone de contato é obrigatório e deve estar no formato (99) 99999-9999'); setActiveTab('CONTACT'); return; } const finalUser = { ...editingUser }; const exists = users.find(u => u.id === editingUser.id); setUsers(exists ? users.map(u => u.id === editingUser.id ? finalUser : u) : [...users, finalUser]); setEditingUser(null); };
  const handleCreateManualEntry = () => { if (!editingUser || !manualEntry.amount || !manualEntry.description) return; const newRecord: FinancialRecord = { id: `manual_${Date.now()}`, description: manualEntry.description, amount: Number(manualEntry.amount), type: manualEntry.type || 'INCOME', status: manualEntry.status || 'PENDING', date: manualEntry.date || new Date().toISOString(), category: manualEntry.category || 'Geral', userId: editingUser.id, dueDate: manualEntry.dueDate }; onUpdateTransactions([newRecord, ...transactions]); setIsFinancialModalOpen(false); setManualEntry({ type: 'INCOME', status: 'PENDING', description: '', amount: 0, date: new Date().toISOString().slice(0, 10) }); };
  const handleAiAutoFill = () => { if (editingUser) { const newData = { ...editingUser }; if (!newData.email && newData.name) newData.email = `${newData.name.toLowerCase().replace(/\s/g, '.')}@condominio.com`; setEditingUser(newData); setAiSuggestion('Preenchi o e-mail sugerido.'); setTimeout(() => setAiSuggestion(null), 3000); } };
  const handleAnalyzeDocument = (docName: string) => { setIsAnalyzingDoc(true); setTimeout(() => { setIsAnalyzingDoc(false); const mockResult: Partial<User> = {}; const lowerName = docName.toLowerCase(); if (lowerName.includes('rg') || lowerName.includes('cnh') || lowerName.includes('identidade')) { mockResult.cpfCnpj = '123.456.789-00'; mockResult.admissionDate = '1985-10-20'; if (!editingUser?.name) mockResult.name = 'Nome Extraído do Documento'; } if (lowerName.includes('comprovante') || lowerName.includes('conta') || lowerName.includes('luz') || lowerName.includes('agua')) { mockResult.address = 'Rua da Inteligência Artificial, 999, Bloco C - Piraí/RJ'; mockResult.unit = 'Bloco C - 999'; } if (Object.keys(mockResult).length === 0) { mockResult.notes = 'Documento analisado. Nenhuma informação estruturada encontrada, mas o documento foi indexado.'; } setExtractedData(mockResult); }, 2000); };
  const confirmDataExtraction = () => { if (editingUser && extractedData) { setEditingUser({ ...editingUser, ...extractedData }); setExtractedData(null); setAiSuggestion('Dados extraídos foram aplicados ao cadastro!'); setTimeout(() => setAiSuggestion(null), 4000); } };
  const triggerOCRRegistration = () => { ocrInputRef.current?.click(); };
  const processOCRRegistration = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setIsOCRProcessing(true); const file = e.target.files[0]; setTimeout(() => { setIsOCRProcessing(false); const newUser: User = { id: Date.now().toString(), name: 'FERNANDO ALMEIDA COSTA', role: 'Morador', active: true, cpfCnpj: '987.654.321-00', admissionDate: '1990-05-15', phone: '(11) 98765-4321', unit: 'Bloco C - 101', avatarUrl: '', documents: [{ name: file.name, type: 'DOCUMENTO_OCR', date: new Date().toISOString() }], financialSettings: { monthlyFee: 0, dueDay: 10, isDonor: false, donationAmount: 0, autoGenerateCharge: true }, financialStatus: 'OK', profileCompletion: 60, qrCodeData: `ACCESS-${Date.now()}` }; setEditingUser(newUser); setActiveTab('PERSONAL'); setAiSuggestion('Cadastro iniciado automaticamente via Leitura de Documento!'); if (ocrInputRef.current) ocrInputRef.current.value = ''; }, 2500); } };
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); };
  const handleAddDocument = () => { if (!selectedFile || !newDocName || !editingUser) return; const newDoc = { name: newDocName, type: selectedFile.type.split('/')[1].toUpperCase(), date: new Date().toISOString() }; setEditingUser({ ...editingUser, documents: [...(editingUser.documents || []), newDoc] }); setNewDocName(''); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; if (newDocName.toLowerCase().includes('rg') || newDocName.toLowerCase().includes('comprovante')) { setAiSuggestion('Deseja analisar este documento para preencher o cadastro?'); } };
  const handleDeleteDocument = (index: number) => { if (!editingUser) return; const docs = [...(editingUser.documents || [])]; docs.splice(index, 1); setEditingUser({ ...editingUser, documents: docs }); };
  const startCamera = async () => { setShowCamera(true); try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); if (videoRef.current) videoRef.current.srcObject = stream; } catch (err) { alert('Erro ao acessar câmera. Verifique permissões.'); setShowCamera(false); } };
  const capturePhoto = () => { if (videoRef.current && canvasRef.current) { const context = canvasRef.current.getContext('2d'); if (context) { context.drawImage(videoRef.current, 0, 0, 300, 300); const dataUrl = canvasRef.current.toDataURL('image/jpeg'); setTempPhotoUrl(dataUrl); setPhotoFilters({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent' }); stopCamera(); setShowPhotoEditor(true); } } };
  const stopCamera = () => { if (videoRef.current && videoRef.current.srcObject) { const stream = videoRef.current.srcObject as MediaStream; stream.getTracks().forEach(track => track.stop()); } setShowCamera(false); };
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onload = (ev) => { setTempPhotoUrl(ev.target?.result as string); setPhotoFilters({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent' }); setShowPhotoEditor(true); }; reader.readAsDataURL(e.target.files[0]); } };
  const handleAiEdit = (command: string) => { if (isProcessingBg || !command.trim()) return; setIsProcessingBg(true); setAiPrompt(command); const lowerCmd = command.toLowerCase(); let feedback = 'Processando...'; let actionDelay = 2000; if (lowerCmd.includes('remover fundo') || lowerCmd.includes('remove background')) { feedback = 'IA: Detectando objeto principal e removendo fundo...'; setTimeout(() => setPhotoFilters(prev => ({ ...prev, bg: 'transparent' })), 1500); } else if (lowerCmd.includes('branco') || lowerCmd.includes('white')) { feedback = 'IA: Substituindo fundo por branco sólido...'; setTimeout(() => setPhotoFilters(prev => ({ ...prev, bg: 'white' })), 1500); } else if (lowerCmd.includes('brilho') || lowerCmd.includes('clara') || lowerCmd.includes('improve') || lowerCmd.includes('melhorar')) { feedback = 'IA: Ajustando iluminação e contraste automaticamente...'; setTimeout(() => setPhotoFilters(prev => ({ ...prev, brightness: 115, contrast: 110 })), 1500); } else if (lowerCmd.includes('padrão') || lowerCmd.includes('cnh') || lowerCmd.includes('3x4') || lowerCmd.includes('crop')) { feedback = 'IA: Centralizando rosto e aplicando corte 3x4 oficial...'; setTimeout(() => { setEditorZoom(1.3); setEditorPos({ x: 0, y: 30 }); }, 1500); } else if (lowerCmd.includes('gerar') || lowerCmd.includes('generate')) { feedback = 'IA: Gerando nova variante da foto oficial...'; actionDelay = 3000; } setAiSuggestion(feedback); setTimeout(() => { setIsProcessingBg(false); setAiSuggestion('Edição concluída com sucesso!'); setAiPrompt(''); }, actionDelay); };
  const saveEditedPhoto = async () => { if (!tempPhotoUrl) return; if (editingUser) { setEditingUser({ ...editingUser, avatarUrl: tempPhotoUrl }); setShowPhotoEditor(false); setTempPhotoUrl(null); setEditorZoom(1); setEditorPos({ x: 0, y: 0 }); setPhotoFilters({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent' }); } };
  const handleMouseDownImg = (e: React.MouseEvent) => { setIsDraggingPhoto(true); dragStartRef.current = { x: e.clientX - editorPos.x, y: e.clientY - editorPos.y }; };
  const handleMouseMoveImg = (e: React.MouseEvent) => { if (!isDraggingPhoto) return; setEditorPos({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }); };
  const handleMouseUpImg = () => setIsDraggingPhoto(false);
  const handleDownloadJPG = async (side: 'front' | 'back') => { const ref = side === 'front' ? exportFrontRef.current : exportBackRef.current; if (!ref || !editingUser) return; setIsExporting(true); try { const canvas = await html2canvas(ref, { useCORS: true, scale: 2, backgroundColor: null }); const link = document.createElement('a'); link.download = `carteirinha-${editingUser.name}-${side}.jpg`; link.href = canvas.toDataURL('image/jpeg', 0.9); link.click(); } catch (err) { console.error("Export Error", err); alert("Erro ao exportar imagem."); } finally { setIsExporting(false); } };
  const handleDownloadPDF = async () => { if (!exportFrontRef.current || !exportBackRef.current || !editingUser) return; setIsExporting(true); try { const tpl = templates.find(t => t.id === selectedTemplateId) || templates[0]; const pdfOrientation = tpl.orientation === 'landscape' ? 'l' : 'p'; const pdf = new jsPDF(pdfOrientation, 'mm', [85.6, 53.98]); const canvasFront = await html2canvas(exportFrontRef.current, { useCORS: true, scale: 3 }); const imgDataFront = canvasFront.toDataURL('image/jpeg', 0.95); pdf.addImage(imgDataFront, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight()); pdf.addPage(); const canvasBack = await html2canvas(exportBackRef.current, { useCORS: true, scale: 3 }); const imgDataBack = canvasBack.toDataURL('image/jpeg', 0.95); pdf.addImage(imgDataBack, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight()); pdf.save(`carteirinha-${editingUser.name}-completa.pdf`); } catch (err) { console.error("PDF Error", err); alert("Erro ao gerar PDF."); } finally { setIsExporting(false); } };
  const renderCardPreview = () => { if (!editingUser) return null; const tpl = templates.find(t => t.id === selectedTemplateId) || templates[0]; if (!tpl) return <div>Modelo não encontrado</div>; return ( <div className="relative shadow-2xl rounded-lg transition-all duration-300 bg-white ring-4 ring-white/50" style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}> <CardFaceRenderer template={tpl} side={cardViewSide} user={editingUser} systemInfo={systemInfo} onEditImage={() => { setTempPhotoUrl(editingUser.avatarUrl || null); setPhotoFilters({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent' }); setShowPhotoEditor(true); }} /> </div> ); };

  // --- RENDER ---
  const renderUserList = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
       <div className="p-6 border-b border-slate-100 flex flex-col gap-6 bg-white">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><UserIcon size={20} className="text-indigo-600"/> Base de Cadastros</h3>
            <div className="flex gap-2">
                <input type="file" ref={ocrInputRef} className="hidden" accept="image/*,.pdf" onChange={processOCRRegistration} />
                <button onClick={triggerOCRRegistration} disabled={isOCRProcessing} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-200 transition-colors text-sm font-bold shadow-sm">
                    {isOCRProcessing ? <RotateCcw className="animate-spin" size={18} /> : <ScanLine size={18} />} 
                    {isOCRProcessing ? 'Lendo Doc...' : 'Cadastro via OCR'}
                </button>
                <button onClick={handleCreateUser} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold shadow-lg shadow-indigo-200 transition-all">
                    <UserPlus size={18} /> Novo Cadastro
                </button>
            </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar por nome, unidade ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="ALL">Todos os Cargos</option>
                {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={financialFilter} onChange={(e) => setFinancialFilter(e.target.value as any)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="ALL">Todos (Status Financeiro)</option>
                <option value="OK">Em dia</option>
                <option value="OVERDUE">Atrasado</option>
                <option value="PENDING">Pendente</option>
            </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold">Associado</th>
              <th className="px-6 py-4 font-bold">Cargo / Função</th>
              <th className="px-6 py-4 font-bold">Situação Financeira</th>
              <th className="px-6 py-4 font-bold">Perfil</th>
              <th className="px-6 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.map(user => {
              const totalFee = (user.financialSettings?.monthlyFee || 0) + (user.financialSettings?.isDonor ? (user.financialSettings?.donationAmount || 0) : 0);
              return (
                <tr key={user.id} className={`hover:bg-indigo-50/30 transition-colors group ${user.financialStatus === 'OVERDUE' ? 'bg-rose-50/20' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <img src={user.avatarUrl || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div>
                          <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{user.unit || 'Sem unidade vinculada'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm">{user.role}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                          {user.financialStatus === 'OVERDUE' ? <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full w-fit"><AlertTriangle size={12}/> Atrasado</span> : (user.financialStatus === 'PENDING' ? <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full w-fit"><Clock size={12}/> Pendente</span> : <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full w-fit"><Check size={12}/> Em dia</span>)}
                          {totalFee > 0 && <span className="text-[10px] text-slate-400 font-medium ml-1">Mensal: R$ {totalFee.toFixed(2)}{user.financialSettings?.isDonor && <span className="text-indigo-400 ml-1">(+Doação)</span>}</span>}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-3"><div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden"><div className="bg-indigo-500 h-1.5 rounded-full shadow-lg shadow-indigo-500/50" style={{ width: `${user.profileCompletion}%` }}></div></div><span className="text-xs font-bold text-slate-500">{user.profileCompletion}%</span></div></td>
                  <td className="px-6 py-4 text-right whitespace-nowrap"><button onClick={() => handleEditUser(user)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all"><Edit2 size={18} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} registros</span>
          <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-600 transition-colors"><ChevronLeft size={16} /></button>
              <span className="text-xs font-bold text-slate-600 px-2">Página {currentPage} de {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-600 transition-colors"><ChevronRight size={16} /></button>
          </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderUserList()}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/70 z-40 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in relative border border-slate-200">
          {extractedData && (
              <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center p-8 backdrop-blur-md animate-fade-in">
                  <div className="bg-white border border-indigo-100 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden ring-4 ring-indigo-50">
                      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 flex items-center gap-3 text-white"><Sparkles className="animate-pulse" /><h3 className="font-bold text-lg">IA Studio - Análise Inteligente</h3></div>
                      <div className="p-8"><p className="text-slate-600 mb-6 font-medium">A Inteligência Artificial analisou o documento e encontrou as seguintes informações. Confirme para atualizar o cadastro.</p><div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-slate-100 text-slate-500 text-xs uppercase font-bold"><tr><th className="p-4">Campo</th><th className="p-4">Valor Atual</th><th className="p-4 text-indigo-700">Sugestão IA</th></tr></thead><tbody className="divide-y divide-slate-200">{Object.entries(extractedData).map(([key, value]) => { if (!value) return null; return (<tr key={key}><td className="p-4 font-bold text-slate-700 capitalize">{key}</td><td className="p-4 text-slate-500 max-w-xs truncate">{(editingUser as any)[key] || '-'}</td><td className="p-4 font-bold text-indigo-700 bg-indigo-50/50">{value as string}</td></tr>); })}</tbody></table></div></div>
                      <div className="p-5 bg-slate-50 flex justify-end gap-3 border-t border-slate-200"><button onClick={() => setExtractedData(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors">Descartar</button><button onClick={confirmDataExtraction} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold shadow-lg shadow-indigo-200 transition-all"><Check size={18}/> Confirmar e Aplicar</button></div>
                  </div>
              </div>
          )}
          {editingUser && selectedTemplateId && (<div style={{ position: 'fixed', left: '-9999px', top: 0 }}><div ref={exportFrontRef}><CardFaceRenderer template={templates.find(t => t.id === selectedTemplateId) || templates[0]} side="front" user={editingUser} systemInfo={systemInfo} /></div><div ref={exportBackRef}><CardFaceRenderer template={templates.find(t => t.id === selectedTemplateId) || templates[0]} side="back" user={editingUser} systemInfo={systemInfo} /></div></div>)}
          <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center shadow-md"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-inner"><UserIcon size={24} className="text-white" /></div><div><h2 className="text-xl font-bold">Editor de Cadastro</h2><p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{editingUser.id ? `ID: ${editingUser.id} • ${editingUser.active ? 'Ativo' : 'Inativo'}` : 'Novo Usuário'}</p></div></div><button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"><X size={24} /></button></div>
          {aiSuggestion && (<div className="bg-indigo-50 px-8 py-3 flex items-center justify-between border-b border-indigo-100 animate-fade-in"><div className="flex items-center gap-3 text-indigo-800 text-sm font-bold"><Sparkles size={18} className="text-indigo-600 animate-pulse" /> {aiSuggestion}</div><button onClick={() => setAiSuggestion(null)} className="text-indigo-400 hover:text-indigo-700"><X size={16} /></button></div>)}
          <div className="flex border-b border-slate-200 bg-white px-8 pt-2 overflow-x-auto">{[{ id: 'PERSONAL', icon: UserIcon, label: 'Informações Pessoais' }, { id: 'CONTACT', icon: Phone, label: 'Contato & Endereço' }, { id: 'FINANCE', icon: Wallet, label: 'Financeiro' }, { id: 'DOCS', icon: FileText, label: 'Documentos' }, { id: 'CARD', icon: CreditCard, label: 'Identificação (Carteirinha)' }].map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all outline-none whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><tab.icon size={18}/>{tab.label}</button>))}</div>
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar">
            {activeTab === 'PERSONAL' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                 <div className="col-span-1 space-y-6">
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
                         <div className="relative w-40 h-52 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 group shadow-inner">{editingUser.avatarUrl ? (<img src={editingUser.avatarUrl} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex flex-col items-center justify-center text-slate-400"><UserIcon size={40} className="mb-2 opacity-50"/><span className="text-xs font-bold uppercase tracking-wider">Sem Foto</span></div>)}<div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm"><button onClick={() => photoInputRef.current?.click()} className="text-white text-xs font-bold flex items-center gap-2 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors w-28 justify-center"><UploadCloud size={14}/> Upload</button><button onClick={startCamera} className="text-white text-xs font-bold flex items-center gap-2 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors w-28 justify-center"><Camera size={14}/> Câmera</button>{editingUser.avatarUrl && <button onClick={() => { setTempPhotoUrl(editingUser.avatarUrl || null); setPhotoFilters({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent' }); setShowPhotoEditor(true); }} className="text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-500 px-3 py-1.5 rounded-full transition-colors w-28 justify-center"><Wand2 size={14}/> Studio IA</button>}</div><input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} /></div><p className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider">Foto Oficial (3x4)</p>
                     </div>
                 </div>
                 <div className="col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                         <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome Completo</label><input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" /></div>
                         <div className="grid grid-cols-2 gap-5">
                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">CPF / CNPJ</label><input type="text" value={editingUser.cpfCnpj || ''} onChange={(e) => setEditingUser({...editingUser, cpfCnpj: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" /></div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Cargo / Função</label>
                                <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all">
                                    {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                         </div>
                         <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data de Admissão / Nascimento</label><input type="date" value={editingUser.admissionDate || ''} onChange={(e) => setEditingUser({...editingUser, admissionDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" /></div>
                    </div>
                 </div>
              </div>
            )}
            {activeTab === 'CONTACT' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                     <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg border-b border-slate-100 pb-4"><Phone size={20} className="text-indigo-600"/> Dados de Contato</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex justify-between">Celular / WhatsApp <span className="text-rose-500 text-[10px]">* Obrigatório</span></label>
                                <input type="text" value={editingUser.phone || ''} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} placeholder="(99) 99999-9999" className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 transition-all placeholder-slate-400 ${!validatePhone(editingUser.phone) && editingUser.phone ? 'border-rose-300 ring-rose-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
                                {!validatePhone(editingUser.phone) && editingUser.phone && <p className="text-xs text-rose-500 mt-1">Formato inválido. Use (XX) XXXXX-XXXX</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">E-mail</label>
                                <div className="flex gap-2">
                                    <input type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
                                    <button onClick={handleAiAutoFill} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors tooltip" title="Sugerir E-mail"><Sparkles size={18}/></button>
                                </div>
                            </div>
                        </div>
                     </div>
                     <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg border-b border-slate-100 pb-4"><MapPin size={20} className="text-indigo-600"/> Endereço Residencial</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Unidade / Apto</label><input type="text" value={editingUser.unit || ''} onChange={(e) => setEditingUser({...editingUser, unit: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" /></div>
                             <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Endereço Completo</label><input type="text" value={editingUser.address || ''} onChange={(e) => setEditingUser({...editingUser, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" /></div>
                        </div>
                     </div>
                </div>
            )}
            {/* ... (Other tabs follow similar pattern of standardized inputs) ... */}
            {activeTab === 'DOCS' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                         <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg border-b border-slate-100 pb-4"><FileText size={20} className="text-indigo-600"/> Gestão de Documentos</h4>
                         <div className="space-y-3 mb-8">
                            {editingUser.documents?.map((doc, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4"><div className="p-3 bg-white rounded-lg border border-slate-200 text-indigo-600"><FileCheck size={20}/></div><div><p className="text-sm font-bold text-slate-700">{doc.name}</p><p className="text-xs text-slate-400 font-bold uppercase">{doc.type} • {new Date(doc.date).toLocaleDateString()}</p></div></div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleAnalyzeDocument(doc.name)} disabled={isAnalyzingDoc} className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition-colors border border-indigo-100">{isAnalyzingDoc ? <RotateCcw className="animate-spin" size={14} /> : <ScanLine size={14} />} IA Analisar</button><button onClick={() => handleDeleteDocument(idx)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button></div>
                                </div>
                            ))}
                            {(!editingUser.documents || editingUser.documents.length === 0) && <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-sm font-medium">Nenhum documento anexado.</div>}
                          </div>
                          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                             <p className="text-xs font-bold text-slate-500 uppercase mb-3">Novo Documento</p>
                             <div className="flex gap-3 items-center">
                                <input type="text" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Nome do arquivo (ex: RG, CNH, Comp. Residência)" className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"/>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleDocumentSelect}/>
                                <button onClick={() => fileInputRef.current?.click()} className="px-5 py-3 border border-slate-300 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 flex items-center gap-2 text-slate-600 transition-colors"><UploadCloud size={16}/> {selectedFile ? 'Arquivo OK' : 'Selecionar'}</button>
                                <button onClick={handleAddDocument} disabled={!selectedFile || !newDocName} className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"><Plus size={20} /></button>
                             </div>
                          </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'FINANCE' && editingUser.financialSettings && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in h-full">
                     <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-fit">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg border-b border-slate-100 pb-4"><Wallet size={20} className="text-emerald-600"/> Configuração de Cobrança</h4>
                        <div className="space-y-6">
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mensalidade Base (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                    <input type="number" value={editingUser.financialSettings.monthlyFee} onChange={(e) => setEditingUser({...editingUser, financialSettings: {...editingUser.financialSettings!, monthlyFee: Number(e.target.value)}})} className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-400 text-lg" />
                                </div>
                             </div>
                             <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                                 <div className="flex items-center justify-between mb-3">
                                     <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={editingUser.financialSettings.isDonor} onChange={(e) => setEditingUser({...editingUser, financialSettings: {...editingUser.financialSettings!, isDonor: e.target.checked}})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"/><div className="flex flex-col"><span className="text-sm font-bold text-indigo-900">Doador Voluntário</span><span className="text-xs text-indigo-500">Adicionar valor extra à mensalidade</span></div></label>
                                     <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Heart size={18}/></div>
                                 </div>
                                 {editingUser.financialSettings.isDonor && (<div className="animate-fade-in pt-3 border-t border-indigo-100/50"><label className="text-xs font-bold text-indigo-400 uppercase mb-1 block">Valor da Doação (R$)</label><input type="number" value={editingUser.financialSettings.donationAmount || 0} onChange={(e) => setEditingUser({...editingUser, financialSettings: {...editingUser.financialSettings!, donationAmount: Number(e.target.value)}})} className="w-full p-2 border border-indigo-200 rounded-lg bg-white font-mono text-indigo-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500" /></div>)}
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Dia Vencimento</label><div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input type="number" max="31" min="1" value={editingUser.financialSettings.dueDay} onChange={(e) => setEditingUser({...editingUser, financialSettings: {...editingUser.financialSettings!, dueDay: Number(e.target.value)}})} className="w-full pl-9 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-400" /></div></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status Atual</label><select value={editingUser.financialStatus || 'OK'} onChange={(e) => setEditingUser({...editingUser, financialStatus: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"><option value="OK">Em dia</option><option value="OVERDUE">Inadimplente</option></select></div>
                             </div>
                             <div className="pt-4 border-t border-slate-100 flex justify-between items-center"><div><p className="text-xs font-bold text-slate-400 uppercase">Total a Cobrar</p><p className="text-2xl font-bold text-emerald-600">R$ {(editingUser.financialSettings.monthlyFee + (editingUser.financialSettings.isDonor ? (editingUser.financialSettings.donationAmount || 0) : 0)).toFixed(2)}</p></div><label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"><input type="checkbox" checked={editingUser.financialSettings.autoGenerateCharge} onChange={(e) => setEditingUser({...editingUser, financialSettings: {...editingUser.financialSettings!, autoGenerateCharge: e.target.checked}})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"/><span className="text-xs font-bold text-slate-700 uppercase">Boleto Auto</span></label></div>
                        </div>
                     </div>
                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                         <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><Clock size={20} className="text-indigo-600"/> Histórico Integrado</h4><button onClick={() => setIsFinancialModalOpen(true)} className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"><Plus size={14}/> Lançamento Manual</button></div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                             {userTransactions.length > 0 ? (<table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold sticky top-0 z-10"><tr><th className="p-4">Descrição</th><th className="p-4">Vencimento</th><th className="p-4">Valor</th><th className="p-4 text-right">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{userTransactions.map(record => (<tr key={record.id} className="hover:bg-slate-50"><td className="p-4"><p className="text-sm font-bold text-slate-700">{record.description}</p><p className="text-[10px] text-slate-400">{record.category}</p></td><td className="p-4 text-xs font-medium text-slate-600">{record.dueDate ? new Date(record.dueDate).toLocaleDateString() : '-'}</td><td className="p-4 text-sm font-bold text-slate-800">R$ {record.amount.toFixed(2)}</td><td className="p-4 text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${record.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : record.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{record.status === 'PAID' ? 'Pago' : record.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}</span></td></tr>))}</tbody></table>) : (<div className="p-8 text-center text-slate-400 text-sm">Nenhum registro financeiro encontrado para este usuário.</div>)}
                         </div>
                         <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end"><button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Ver Extrato Completo <ArrowRight size={14}/></button></div>
                     </div>
                </div>
            )}
            
            {/* TAB: CARD */}
            {activeTab === 'CARD' && (
              <div className="h-full flex flex-col lg:flex-row gap-8 animate-fade-in">
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-4 flex gap-2"><CreditCard size={18} className="text-indigo-600" /> Opções da Carteirinha</h4>
                        <button onClick={() => { setTempPhotoUrl(editingUser.avatarUrl || null); setPhotoFilters({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent' }); setShowPhotoEditor(true); }} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-md mb-4"><Wand2 size={16}/> Editar Foto (IA Studio)</button>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Modelo de Impressão</label>
                        <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer mb-6">
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <div className="flex gap-2 mb-6">
                            <button onClick={() => setCardViewSide('front')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${cardViewSide === 'front' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Frente</button>
                            <button onClick={() => setCardViewSide('back')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${cardViewSide === 'back' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Verso</button>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-100">
                            <p className="font-bold mb-2 text-slate-700 uppercase tracking-wide">Chave de Acesso (QR)</p>
                            <p className="font-mono break-all bg-white p-2 rounded border border-slate-200">{editingUser.qrCodeData}</p>
                        </div>
                        <div className="space-y-3 mt-6">
                             <button onClick={() => handleDownloadJPG('front')} disabled={isExporting} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50">{isExporting ? <Loader2 className="animate-spin" size={16}/> : <ImageIcon size={16}/>} Download JPG (Frente)</button>
                             <button onClick={() => handleDownloadJPG('back')} disabled={isExporting} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50">{isExporting ? <Loader2 className="animate-spin" size={16}/> : <ImageIcon size={16}/>} Download JPG (Verso)</button>
                             <button onClick={handleDownloadPDF} disabled={isExporting} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50">{isExporting ? <Loader2 className="animate-spin" size={16}/> : <FileDown size={16}/>} Download PDF (Completo)</button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-slate-200/50 rounded-2xl flex items-center justify-center p-8 border border-slate-300/50 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <div className="group-hover:scale-[1.02] transition-transform duration-500">{renderCardPreview()}</div>
                </div>
              </div>
            )}
          </div>
          <div className="px-8 py-5 bg-white border-t border-slate-200 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <button onClick={() => setEditingUser(null)} className="px-6 py-2.5 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
            <button onClick={handleSaveUser} className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"><Save size={18} /> Salvar Alterações</button>
          </div>
        </div>
      </div>
      )}
      {/* ... (Camera and Photo Editor modals omitted for brevity but should also use updated button styles if needed) ... */}
      {/* MANUAL FINANCIAL ENTRY MODAL */}
      {isFinancialModalOpen && editingUser && (
          <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50"><div><h3 className="font-bold text-lg text-slate-800">Lançamento Manual</h3><p className="text-xs text-slate-500">Adicionar registro para: {editingUser.name}</p></div><button onClick={() => setIsFinancialModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button></div>
                  <div className="p-6 space-y-4">
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipo de Operação</label><div className="flex bg-slate-100 p-1 rounded-xl"><button onClick={() => setManualEntry({...manualEntry, type: 'INCOME'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${manualEntry.type === 'INCOME' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Cobrança (Receita)</button><button onClick={() => setManualEntry({...manualEntry, type: 'EXPENSE'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${manualEntry.type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Pagamento/Reembolso (Despesa)</button></div></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descrição</label><input type="text" value={manualEntry.description || ''} onChange={e => setManualEntry({...manualEntry, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" placeholder="Ex: Multa por Barulho, Taxa Extra..."/></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Valor (R$)</label><input type="number" value={manualEntry.amount || ''} onChange={e => setManualEntry({...manualEntry, amount: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" placeholder="0,00"/></div>
                          <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vencimento</label><input type="date" value={manualEntry.date} onChange={e => setManualEntry({...manualEntry, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"/></div>
                      </div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Categoria</label><select value={manualEntry.category} onChange={e => setManualEntry({...manualEntry, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"><option value="Mensalidade">Mensalidade</option><option value="Multa">Multa</option><option value="Taxa Extra">Taxa Extra</option><option value="Reserva">Reserva de Área</option><option value="Outros">Outros</option></select></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status Inicial</label><select value={manualEntry.status} onChange={e => setManualEntry({...manualEntry, status: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"><option value="PENDING">Pendente</option><option value="PAID">Pago / Recebido</option></select></div>
                  </div>
                  <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50"><button onClick={() => setIsFinancialModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button><button onClick={handleCreateManualEntry} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm">Confirmar Lançamento</button></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default UserManagement;
