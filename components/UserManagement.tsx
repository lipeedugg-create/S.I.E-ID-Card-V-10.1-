
import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { AVAILABLE_ROLES } from '../constants';
import { User, SystemInfo, IdCardTemplate, FinancialRecord, SocialQuestionnaireData } from '../types';
import { userService, aiService, financialService } from '../services/api';
import { 
  Save, Sparkles, Search, Edit2, Trash2, CreditCard, User as UserIcon, 
  Image as ImageIcon, X, Plus, Wallet, UploadCloud, FileText, Check, 
  Camera, Wand2, ScanLine, RotateCcw, UserPlus, FileCheck, Loader2, Phone, MapPin,
  Calendar, Clock, FileDown, Heart, ArrowRight, Crop, Sun, Monitor
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SocialQuestionnaire from './SocialQuestionnaire';

interface UserManagementProps {
  systemInfo: SystemInfo;
  templates: IdCardTemplate[];
  transactions: FinancialRecord[];
  onUpdateTransactions: (transactions: FinancialRecord[]) => void;
}

const CardFaceRenderer = memo(({ template, side, user, systemInfo, onEditImage }: any) => {
    return (
        <div style={{ width: `${template.orientation === 'landscape' ? template.width : template.height}px`, height: `${template.orientation === 'landscape' ? template.height : template.width}px`, background: side === 'front' ? template.frontBackground : template.backBackground, position: 'relative', overflow: 'hidden', borderRadius: '8px', boxShadow: 'none' }}>
              {template.elements.filter((el: any) => el.layer === side).map((el: any) => {
                  let content = el.content;
                  if (el.type === 'text-dynamic' && el.field) {
                      if (el.field.startsWith('system.')) {
                          content = el.field === 'system.name' ? systemInfo.name : el.field === 'system.cnpj' ? systemInfo.cnpj : systemInfo.address;
                      } else {
                          const val = user[el.field];
                          content = val ? String(val) : ''; 
                          if (el.field.includes('Date')) content = val ? new Date(val).toLocaleDateString('pt-BR') : '';
                      }
                  }
                  return (
                      <div key={el.id} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, ...el.style, overflow: 'hidden' }}>
                          {el.type === 'image' ? (
                              <img src={el.field === 'system.logo' ? systemInfo.logoUrl : user.avatarUrl || ''} className="w-full h-full object-cover" onClick={onEditImage}/>
                          ) : el.type === 'qrcode' ? (
                              <div className="w-full h-full bg-black"></div> 
                          ) : content}
                      </div>
                  )
              })}
        </div>
    );
});

const UserManagement: React.FC<UserManagementProps> = ({ systemInfo, templates, transactions, onUpdateTransactions }) => {
  // STATE: Data from API
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE: UI & Filters
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [financialFilter, setFinancialFilter] = useState<'ALL' | 'OK' | 'OVERDUE' | 'PENDING'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'CONTACT' | 'DOCS' | 'FINANCE' | 'CARD' | 'SOCIAL'>('PERSONAL');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  
  // STATE: OCR & Files
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<User> | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);

  // STATE: Camera & Photo Editor
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [photoFilters, setPhotoFilters] = useState({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent', zoom: 1 });
  
  // STATE: Export
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [cardViewSide, setCardViewSide] = useState<'front' | 'back'>('front');

  // STATE: Finance Modal (Manual)
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState<Partial<FinancialRecord>>({ type: 'INCOME', status: 'PENDING', amount: 0, description: '' });

  // Refs
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportFrontRef = useRef<HTMLDivElement>(null);
  const exportBackRef = useRef<HTMLDivElement>(null);

  // --- 1. CARREGAMENTO INICIAL (API) ---
  useEffect(() => {
      loadUsers();
  }, []);

  const loadUsers = async () => {
      setIsLoading(true);
      try {
          const response = await userService.getAll();
          setUsers(response.data);
      } catch (error) {
          console.error("Erro ao carregar usuários", error);
      } finally {
          setIsLoading(false);
      }
  };

  // --- 2. INTEGRAÇÃO COM BACKEND (SALVAR) ---
  const handleSaveUser = async () => {
      if (!editingUser) return;
      if (!editingUser.name) { alert('Nome é obrigatório.'); return; }

      try {
          let savedUser;
          if (editingUser.id && !editingUser.id.startsWith('temp_')) {
              const res = await userService.update(editingUser.id, editingUser);
              savedUser = res.data;
              setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
          } else {
              const { id, ...userData } = editingUser;
              const res = await userService.create(userData);
              savedUser = res.data;
              setUsers([...users, savedUser]);
          }
          setEditingUser(null);
          alert('Usuário salvo com sucesso!');
      } catch (error) {
          console.error("Erro ao salvar", error);
          alert('Erro ao salvar usuário.');
      }
  };

  // --- 3. OCR / IA VIA BACKEND ---
  const processOCRRegistration = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsOCRProcessing(true);
          const file = e.target.files[0];
          const formData = new FormData();
          formData.append('document', file);

          try {
              const res = await aiService.analyzeDocument(formData);
              const extracted = res.data; 

              const newUser: User = {
                  id: `temp_${Date.now()}`,
                  name: extracted.name?.toUpperCase() || '',
                  role: 'RESIDENT',
                  active: true,
                  cpfCnpj: extracted.cpfCnpj || '',
                  rg: extracted.rg || '',
                  birthDate: extracted.birthDate || '',
                  address: extracted.address || '',
                  admissionDate: new Date().toISOString().slice(0, 10),
                  financialStatus: 'OK'
              } as User;

              setEditingUser(newUser);
              setActiveTab('PERSONAL');
              setAiSuggestion('Dados extraídos via IA! Verifique antes de salvar.');
          } catch (error) {
              console.error("Erro OCR", error);
              alert("Falha na análise do documento.");
          } finally {
              setIsOCRProcessing(false);
              if (ocrInputRef.current) ocrInputRef.current.value = '';
          }
      }
  };

  // --- 4. CAMERA & PHOTO EDITING ---
  const startCamera = async () => {
      setShowCamera(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
          alert('Erro ao acessar câmera.');
          setShowCamera(false);
      }
  };

  const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext('2d');
          if (context) {
              // Draw video frame to canvas
              context.drawImage(videoRef.current, 0, 0, 300, 300);
              const dataUrl = canvasRef.current.toDataURL('image/jpeg');
              setTempPhotoUrl(dataUrl);
              setPhotoFilters({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent', zoom: 1 });
              stopCamera();
              setShowPhotoEditor(true);
          }
      }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
      setShowCamera(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setTempPhotoUrl(ev.target?.result as string);
              setPhotoFilters({ brightness: 100, contrast: 100, grayscale: 0, bg: 'transparent', zoom: 1 });
              setShowPhotoEditor(true);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  // Process and Upload Edited Photo
  const saveEditedPhoto = async () => {
      if (!tempPhotoUrl || !editingUser) return;
      
      try {
          // 1. Create a processing canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.src = tempPhotoUrl;
          await new Promise(r => img.onload = r);

          // 2. Set dimensions (Standard 3x4 ratio high res)
          const targetW = 600;
          const targetH = 800;
          canvas.width = targetW;
          canvas.height = targetH;

          if (ctx) {
              // 3. Apply Filters
              ctx.filter = `brightness(${photoFilters.brightness}%) contrast(${photoFilters.contrast}%) grayscale(${photoFilters.grayscale}%)`;
              
              // 4. Draw Background (if white requested)
              if (photoFilters.bg === 'white') {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, targetW, targetH);
              }

              // 5. Draw Image (Center Crop Logic)
              const scale = Math.max(targetW / img.width, targetH / img.height) * photoFilters.zoom;
              const x = (targetW / 2) - (img.width / 2) * scale;
              const y = (targetH / 2) - (img.height / 2) * scale;
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          }

          // 6. Convert to Blob and Upload
          canvas.toBlob(async (blob) => {
              if (blob) {
                  const formData = new FormData();
                  formData.append('file', blob, `avatar_${editingUser.id}.jpg`);
                  
                  setAiSuggestion('Salvando imagem processada...');
                  const res = await userService.uploadAvatar(formData);
                  
                  setEditingUser({ ...editingUser, avatarUrl: res.data.url });
                  setAiSuggestion('Foto atualizada!');
                  setShowPhotoEditor(false);
                  setTempPhotoUrl(null);
                  setTimeout(() => setAiSuggestion(null), 3000);
              }
          }, 'image/jpeg', 0.95);

      } catch (error) {
          console.error(error);
          alert('Erro ao processar imagem.');
      }
  };

  const handleAiEditCommand = (cmd: string) => {
      setAiPrompt(cmd);
      const lower = cmd.toLowerCase();
      
      if (lower.includes('fundo') || lower.includes('background')) {
          setAiSuggestion('IA: Removendo fundo e aplicando padrão branco...');
          setPhotoFilters(p => ({ ...p, bg: 'white' }));
      }
      else if (lower.includes('brilho') || lower.includes('melhorar')) {
          setAiSuggestion('IA: Ajustando iluminação e contraste...');
          setPhotoFilters(p => ({ ...p, brightness: 110, contrast: 115 }));
      }
      else if (lower.includes('3x4') || lower.includes('padrão') || lower.includes('enquadrar')) {
          setAiSuggestion('IA: Aplicando enquadramento oficial 3x4...');
          setPhotoFilters(p => ({ ...p, zoom: 1.2 }));
      }
      
      setTimeout(() => setAiSuggestion(null), 2500);
  };

  // --- FILTERS & PAGINATION ---
  const filteredUsers = useMemo(() => {
      return users.filter(u => {
          const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase());
          const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
          return matchesSearch && matchesRole;
      });
  }, [users, search, roleFilter]);

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* USER LIST & HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex gap-4">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <input type="file" ref={ocrInputRef} className="hidden" accept="image/*,.pdf" onChange={processOCRRegistration} />
                  <button onClick={() => ocrInputRef.current?.click()} disabled={isOCRProcessing} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-200 transition-colors">
                      {isOCRProcessing ? <Loader2 className="animate-spin" size={16}/> : <ScanLine size={16}/>} Cadastro OCR (IA)
                  </button>
              </div>
              <button onClick={() => { setEditingUser({ id: `temp_${Date.now()}`, name: '', role: 'RESIDENT', active: true } as User); setActiveTab('PERSONAL'); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700">
                  <UserPlus size={18}/> Novo Cadastro
              </button>
          </div>

          {isLoading ? (
              <div className="p-10 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2"/> Carregando dados...</div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="p-5">Nome</th><th className="p-5">Cargo</th><th className="p-5">Status</th><th className="p-5 text-right">Ações</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                          {paginatedUsers.map(user => (
                              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-5 font-bold text-slate-700 flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">{user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : <UserIcon className="p-1 text-slate-400"/>}</div>
                                      {user.name}
                                  </td>
                                  <td className="p-5 text-sm text-slate-600">{user.role}</td>
                                  <td className="p-5"><span className={`px-2 py-1 rounded text-xs font-bold ${user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{user.active ? 'Ativo' : 'Inativo'}</span></td>
                                  <td className="p-5 text-right"><button onClick={() => setEditingUser(user)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded"><Edit2 size={16}/></button></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
          <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold">{editingUser.name ? editingUser.name[0] : 'N'}</div>
                          <div>
                              <h2 className="font-bold text-lg">{editingUser.name || 'Novo Usuário'}</h2>
                              <p className="text-xs text-slate-400 uppercase tracking-wider">{editingUser.role}</p>
                          </div>
                      </div>
                      <button onClick={() => setEditingUser(null)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24}/></button>
                  </div>
                  
                  {aiSuggestion && <div className="bg-indigo-50 p-2 text-center text-indigo-700 text-sm font-bold flex items-center justify-center gap-2 animate-pulse"><Sparkles size={14}/> {aiSuggestion}</div>}

                  {/* Tabs */}
                  <div className="flex border-b border-slate-200 overflow-x-auto shrink-0">
                      {['PERSONAL', 'CONTACT', 'DOCS', 'FINANCE', 'CARD', 'SOCIAL'].map(t => (
                          <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                              {t === 'PERSONAL' ? 'Informações' : t === 'CONTACT' ? 'Contato' : t === 'DOCS' ? 'Documentos' : t === 'FINANCE' ? 'Financeiro' : t === 'CARD' ? 'Carteirinha' : 'Ficha Social'}
                          </button>
                      ))}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                      {/* --- TAB: PERSONAL --- */}
                      {activeTab === 'PERSONAL' && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Photo Section */}
                              <div className="lg:col-span-1 space-y-4">
                                  <div className="aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm">
                                      {editingUser.avatarUrl ? (
                                          <img src={editingUser.avatarUrl} className="w-full h-full object-cover"/>
                                      ) : (
                                          <div className="text-center text-slate-400">
                                              <UserIcon size={64} className="mx-auto mb-2 opacity-50"/>
                                              <span className="text-xs font-bold uppercase">Sem Foto</span>
                                          </div>
                                      )}
                                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                          <button onClick={() => startCamera()} className="px-4 py-2 bg-white rounded-full text-xs font-bold flex items-center gap-2 hover:bg-indigo-50"><Camera size={14}/> Câmera</button>
                                          <button onClick={() => photoInputRef.current?.click()} className="px-4 py-2 bg-white rounded-full text-xs font-bold flex items-center gap-2 hover:bg-indigo-50"><UploadCloud size={14}/> Upload</button>
                                          {editingUser.avatarUrl && <button onClick={() => { setTempPhotoUrl(editingUser.avatarUrl || ''); setShowPhotoEditor(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center gap-2 hover:bg-indigo-700"><Wand2 size={14}/> Editar IA</button>}
                                      </div>
                                      <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload}/>
                                  </div>
                                  <p className="text-center text-xs text-slate-500">Formato oficial 3x4 recomendado.</p>
                              </div>

                              {/* Fields Section */}
                              <div className="lg:col-span-2 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome Completo</label><input className="w-full p-3 border rounded-xl" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} /></div>
                                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">CPF</label><input className="w-full p-3 border rounded-xl" value={editingUser.cpfCnpj || ''} onChange={e => setEditingUser({...editingUser, cpfCnpj: e.target.value})} /></div>
                                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">RG</label><input className="w-full p-3 border rounded-xl" value={editingUser.rg || ''} onChange={e => setEditingUser({...editingUser, rg: e.target.value})} /></div>
                                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data Nascimento</label><input type="date" className="w-full p-3 border rounded-xl" value={editingUser.birthDate || ''} onChange={e => setEditingUser({...editingUser, birthDate: e.target.value})} /></div>
                                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Cargo / Função</label><select className="w-full p-3 border rounded-xl" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>{AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data Admissão</label><input type="date" className="w-full p-3 border rounded-xl" value={editingUser.admissionDate || ''} onChange={e => setEditingUser({...editingUser, admissionDate: e.target.value})} /></div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* --- TAB: CONTACT --- */}
                      {activeTab === 'CONTACT' && (
                          <div className="max-w-2xl mx-auto space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Celular / WhatsApp</label><input className="w-full p-3 border rounded-xl" value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} /></div>
                                  <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">E-mail</label><input className="w-full p-3 border rounded-xl" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} /></div>
                                  <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Endereço Completo</label><input className="w-full p-3 border rounded-xl" value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} /></div>
                                  <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Unidade / Apto</label><input className="w-full p-3 border rounded-xl" value={editingUser.unit || ''} onChange={e => setEditingUser({...editingUser, unit: e.target.value})} /></div>
                              </div>
                          </div>
                      )}

                      {/* --- TAB: CARD --- */}
                      {activeTab === 'CARD' && (
                          <div className="flex flex-col items-center">
                              <div className="mb-6 flex gap-4">
                                  <select className="p-2 border rounded-lg text-sm" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>{templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                  <div className="flex bg-slate-200 rounded-lg p-1"><button onClick={() => setCardViewSide('front')} className={`px-4 py-1 rounded text-sm font-bold ${cardViewSide === 'front' ? 'bg-white shadow' : ''}`}>Frente</button><button onClick={() => setCardViewSide('back')} className={`px-4 py-1 rounded text-sm font-bold ${cardViewSide === 'back' ? 'bg-white shadow' : ''}`}>Verso</button></div>
                              </div>
                              <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-200 transform hover:scale-105 transition-transform">
                                  <CardFaceRenderer template={templates.find(t => t.id === selectedTemplateId) || templates[0]} side={cardViewSide} user={editingUser} systemInfo={systemInfo} onEditImage={() => {setTempPhotoUrl(editingUser.avatarUrl || ''); setShowPhotoEditor(true);}} />
                              </div>
                          </div>
                      )}

                      {/* --- TAB: SOCIAL --- */}
                      {activeTab === 'SOCIAL' && (
                          <SocialQuestionnaire user={editingUser} onSave={(data) => { setEditingUser({...editingUser, socialData: data}); alert('Ficha salva localmente. Clique em Salvar Usuário para persistir.'); }} onCancel={() => {}} />
                      )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
                      <button onClick={() => setEditingUser(null)} className="px-6 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                      <button onClick={handleSaveUser} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2"><Save size={18}/> Salvar Cadastro</button>
                  </div>
              </div>
          </div>
      )}

      {/* CAMERA MODAL */}
      {showCamera && (
          <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center">
              <video ref={videoRef} autoPlay className="w-full max-w-lg rounded-2xl border-4 border-slate-800 mb-6" />
              <canvas ref={canvasRef} className="hidden" width="300" height="300" />
              <div className="flex gap-4">
                  <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 hover:border-indigo-500 hover:scale-110 transition-all flex items-center justify-center"><Camera size={32}/></button>
                  <button onClick={stopCamera} className="px-6 py-3 bg-rose-600 text-white rounded-full font-bold">Cancelar</button>
              </div>
          </div>
      )}

      {/* PHOTO EDITOR MODAL (AI STUDIO) */}
      {showPhotoEditor && tempPhotoUrl && (
          <div className="fixed inset-0 bg-slate-900/90 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden shadow-2xl">
                  {/* Canvas Area */}
                  <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] flex items-center justify-center p-8 relative overflow-hidden">
                      <div className="relative shadow-2xl" style={{ 
                          width: `${300 * photoFilters.zoom}px`, 
                          height: `${400 * photoFilters.zoom}px`,
                          transition: 'all 0.3s ease' 
                      }}>
                          <img 
                              src={tempPhotoUrl} 
                              className="w-full h-full object-cover"
                              style={{ 
                                  filter: `brightness(${photoFilters.brightness}%) contrast(${photoFilters.contrast}%) grayscale(${photoFilters.grayscale}%)`,
                                  backgroundColor: photoFilters.bg 
                              }} 
                          />
                          {/* Guides for 3x4 */}
                          <div className="absolute inset-0 border-2 border-white/30 pointer-events-none grid grid-cols-2 grid-rows-2"></div>
                      </div>
                  </div>

                  {/* Sidebar Controls */}
                  <div className="w-80 bg-slate-50 border-l border-slate-200 p-6 flex flex-col">
                      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Wand2 className="text-purple-600"/> Studio IA</h3>
                      
                      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                          {/* AI Commands */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 uppercase">Comandos Rápidos</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <button onClick={() => handleAiEditCommand('remover fundo')} className="p-2 bg-white border rounded-lg text-xs font-bold hover:border-purple-400 hover:text-purple-600 transition-colors">Remover Fundo</button>
                                  <button onClick={() => handleAiEditCommand('padrão 3x4')} className="p-2 bg-white border rounded-lg text-xs font-bold hover:border-purple-400 hover:text-purple-600 transition-colors">Enquadrar 3x4</button>
                                  <button onClick={() => handleAiEditCommand('melhorar')} className="p-2 bg-white border rounded-lg text-xs font-bold hover:border-purple-400 hover:text-purple-600 transition-colors">Melhorar Luz</button>
                                  <button onClick={() => handleAiEditCommand('fundo branco')} className="p-2 bg-white border rounded-lg text-xs font-bold hover:border-purple-400 hover:text-purple-600 transition-colors">Fundo Branco</button>
                              </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-slate-200">
                              <label className="text-xs font-bold text-slate-400 uppercase">Ajustes Manuais</label>
                              <div>
                                  <div className="flex justify-between text-xs mb-1"><span>Brilho</span><span>{photoFilters.brightness}%</span></div>
                                  <input type="range" min="50" max="150" value={photoFilters.brightness} onChange={e => setPhotoFilters({...photoFilters, brightness: Number(e.target.value)})} className="w-full accent-indigo-600"/>
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs mb-1"><span>Contraste</span><span>{photoFilters.contrast}%</span></div>
                                  <input type="range" min="50" max="150" value={photoFilters.contrast} onChange={e => setPhotoFilters({...photoFilters, contrast: Number(e.target.value)})} className="w-full accent-indigo-600"/>
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs mb-1"><span>Zoom</span><span>{photoFilters.zoom}x</span></div>
                                  <input type="range" min="0.5" max="2" step="0.1" value={photoFilters.zoom} onChange={e => setPhotoFilters({...photoFilters, zoom: Number(e.target.value)})} className="w-full accent-indigo-600"/>
                              </div>
                          </div>
                      </div>

                      <div className="pt-6 border-t border-slate-200 space-y-3">
                          <button onClick={saveEditedPhoto} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"><Check size={18}/> Salvar Foto</button>
                          <button onClick={() => setShowPhotoEditor(false)} className="w-full py-3 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-white transition-all">Cancelar</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default UserManagement;
