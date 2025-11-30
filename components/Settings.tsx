import React, { useState, useRef, useEffect } from 'react';
import { AVAILABLE_ROLES, SYSTEM_PERMISSIONS } from '../constants';
import { SystemInfo, IdCardTemplate, CardElement, User, Permission, OfficialDocument } from '../types';
import { 
  Save, Sparkles, Key, Building, Shield, Check, X, Upload, 
  Image as ImageIcon, CreditCard, Plus, Trash2, 
  Move, Type, MousePointer2, Layers, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowUp, ArrowDown, Maximize, AlertCircle, Grid3X3, Eye, Settings2, UserCheck, Lock, RefreshCw, CheckSquare, Square, UserPlus,
  Cpu, MessageCircle, Landmark, Globe, EyeOff, Link as LinkIcon, AlertTriangle, FileText,
  Bot, Paperclip, Send, FileCheck, ScanLine, Bold, Italic, Underline, File
} from 'lucide-react';

interface SettingsProps {
  systemInfo: SystemInfo;
  onUpdateSystemInfo: (info: SystemInfo) => void;
  templates: IdCardTemplate[];
  onUpdateTemplates: (templates: IdCardTemplate[]) => void;
  usersList: User[];
  onUpdateUsers: (users: User[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ systemInfo, onUpdateSystemInfo, templates, onUpdateTemplates, usersList, onUpdateUsers }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'ACCESS' | 'API' | 'STUDIO'>('INFO');
  
  // STUDIO STATES - SUBTABS
  const [studioMode, setStudioMode] = useState<'CARDS' | 'DOCS'>('CARDS');

  // STUDIO - CARDS STATES
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [studioView, setStudioView] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number, y: number, initialElX: number, initialElY: number } | null>(null);

  // STUDIO - DOCS STATES (Rich Editor)
  const [documents, setDocuments] = useState<OfficialDocument[]>([
      { id: 'doc1', title: 'Ofício Prefeitura - Poda', type: 'OFICIO', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'DRAFT', content: '<div>Ao Excelentíssimo Senhor Secretário de Obras,<br/><br/>Venho por meio deste solicitar a poda das árvores localizadas na Rua Principal, altura do número 100.<br/><br/>Atenciosamente,<br/>Presidente da Associação.</div>', pageSize: 'A4', orientation: 'PORTRAIT' }
  ]);
  const [activeDocId, setActiveDocId] = useState<string | null>('doc1');
  const [docPrompt, setDocPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([{role: 'ai', text: 'Olá! Sou o assistente de documentos do S.I.E. Carregue um modelo PDF/DOC para eu aprender o estilo, ou peça para eu escrever um novo documento.'}]);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isAnalyzingRef, setIsAnalyzingRef] = useState(false);
  const refFileInput = useRef<HTMLInputElement>(null);
  const docEditorRef = useRef<HTMLDivElement>(null);
  const docImageInputRef = useRef<HTMLInputElement>(null);

  // ACCESS TAB STATES
  const [searchTerm, setSearchTerm] = useState('');
  
  // PERMISSIONS MODAL STATE
  const [permissionUser, setPermissionUser] = useState<User | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  // PASSWORD RESET STATE
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // API INTEGRATION STATES
  const [apiConfig, setApiConfig] = useState({
      geminiKey: 'AIzaSy***********************',
      geminiConnected: true,
      paymentKey: '',
      paymentConnected: false,
      whatsappToken: '',
      whatsappInstance: '',
      whatsappConnected: false,
      openFinanceClientId: '',
      openFinanceSecret: '',
      openFinanceConnected: false
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (key: string) => {
      setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeTemplate = templates.find(t => t.id === selectedTemplateId);
  const activeElement = activeTemplate?.elements.find(el => el.id === selectedElementId);
  const activeDoc = documents.find(d => d.id === activeDocId);

  // --- GENERAL HANDLERS ---
  const handleSaveInfo = () => {
    // Simulate API call
    const btn = document.getElementById('save-btn-info');
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Salvando...</span>`;
        setTimeout(() => {
            btn.innerHTML = `<span class="flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Salvo com Sucesso!</span>`;
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        }, 800);
    }
  };

  const handleSaveApi = (service: string) => {
      alert(`Configurações de ${service} salvas e conexão testada com sucesso!`);
      if (service === 'Gemini') setApiConfig(prev => ({ ...prev, geminiConnected: true }));
      if (service === 'Pagamentos') setApiConfig(prev => ({ ...prev, paymentConnected: true }));
      if (service === 'WhatsApp') setApiConfig(prev => ({ ...prev, whatsappConnected: true }));
      if (service === 'Open Finance') setApiConfig(prev => ({ ...prev, openFinanceConnected: true }));
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSystemInfo({ ...systemInfo, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  // --- PERMISSION LOGIC ---
  const handleOpenPermissions = (user: User) => {
      setPermissionUser(user);
      setTempPermissions(user.permissions || []);
  };

  const handleTogglePermission = (permId: string) => {
      if (tempPermissions.includes(permId)) {
          setTempPermissions(tempPermissions.filter(id => id !== permId));
      } else {
          setTempPermissions([...tempPermissions, permId]);
      }
  };

  const handleSavePermissions = () => {
      if (!permissionUser) return;
      const updatedList = usersList.map(u => 
          u.id === permissionUser.id ? { ...u, permissions: tempPermissions } : u
      );
      onUpdateUsers(updatedList);
      setPermissionUser(null);
      alert('Permissões atualizadas com sucesso!');
  };

  // --- PASSWORD RESET LOGIC ---
  const handleOpenPasswordReset = (user: User) => {
      setPasswordResetUser(user);
      setNewPassword('');
  };

  const handleSavePassword = () => {
      if (!passwordResetUser || !newPassword) return;
      const updatedList = usersList.map(u =>
          u.id === passwordResetUser.id ? { ...u, password: newPassword } : u
      );
      onUpdateUsers(updatedList);
      setPasswordResetUser(null);
      alert(`Senha de ${passwordResetUser.name} redefinida com sucesso.`);
  };

  const groupedPermissions = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm);
      return acc;
  }, {} as Record<string, Permission[]>);

  // --- STUDIO (CARDS) LOGIC ---
  const handleCreateTemplate = () => {
    const newTemplate: IdCardTemplate = {
        id: `tpl_${Date.now()}`,
        name: 'Novo Modelo Personalizado',
        width: 340,
        height: 215,
        orientation: 'landscape',
        frontBackground: '#ffffff',
        backBackground: '#f3f4f6',
        elements: [
            { id: `el_${Date.now()}`, type: 'text-dynamic', label: 'Nome', field: 'name', x: 10, y: 10, style: { fontSize: '14px', color: '#000', fontWeight: 'bold' }, layer: 'front' }
        ]
    };
    onUpdateTemplates([...templates, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
  };

  const updateTemplate = (updates: Partial<IdCardTemplate>) => {
    if (!activeTemplate) return;
    const updated = { ...activeTemplate, ...updates };
    onUpdateTemplates(templates.map(t => t.id === activeTemplate.id ? updated : t));
    setSaveSuccess(false);
  };

  const saveCurrentTemplate = () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
  };

  const addElement = (type: CardElement['type']) => {
      if (!activeTemplate) return;
      const newEl: CardElement = {
          id: `el_${Date.now()}`,
          type,
          label: type === 'shape' ? 'Forma' : type === 'image' ? 'Imagem' : 'Texto',
          x: 20,
          y: 20,
          width: type === 'shape' ? 100 : type === 'image' || type === 'qrcode' ? 50 : undefined,
          height: type === 'shape' ? 20 : type === 'image' || type === 'qrcode' ? 50 : undefined,
          style: { 
              fontSize: '12px', 
              color: '#000000', 
              backgroundColor: type === 'shape' ? '#cccccc' : 'transparent',
              textAlign: 'left'
          },
          layer: studioView,
          field: type === 'text-dynamic' ? 'name' : type === 'image' ? 'avatarUrl' : undefined,
          content: type === 'text-static' ? 'Texto Fixo' : undefined
      };
      updateTemplate({ elements: [...activeTemplate.elements, newEl] });
      setSelectedElementId(newEl.id);
  };

  const updateElement = (elementId: string, updates: Partial<CardElement> | { style: Partial<CardElement['style']> }) => {
      if (!activeTemplate) return;
      const newElements = activeTemplate.elements.map(el => {
          if (el.id === elementId) {
             if ('style' in updates && updates.style) {
                 return { ...el, style: { ...el.style, ...updates.style } as CardElement['style'] };
             }
             return { ...el, ...(updates as Partial<CardElement>) };
          }
          return el;
      });
      updateTemplate({ elements: newElements });
  };

  const removeElement = (elementId: string) => {
      if (!activeTemplate) return;
      updateTemplate({ elements: activeTemplate.elements.filter(el => el.id !== elementId) });
      setSelectedElementId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation();
      if (!activeTemplate) return;
      const el = activeTemplate.elements.find(e => e.id === elementId);
      if (!el) return;
      setSelectedElementId(elementId);
      setIsDragging(true);
      dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          initialElX: el.x,
          initialElY: el.y
      };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !dragStartRef.current || !activeTemplate || !selectedElementId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;
      const newX = dragStartRef.current.initialElX + deltaXPercent;
      const newY = dragStartRef.current.initialElY + deltaYPercent;
      updateElement(selectedElementId, { x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
  };

  // --- STUDIO (DOCS) LOGIC ---
  const handleCreateDocument = () => {
      const newDoc: OfficialDocument = {
          id: `doc_${Date.now()}`,
          title: 'Novo Documento',
          type: 'OFICIO',
          content: '<div></div>', // Empty content div
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'DRAFT',
          pageSize: 'A4',
          orientation: 'PORTRAIT'
      };
      setDocuments([...documents, newDoc]);
      setActiveDocId(newDoc.id);
  };

  const handleDeleteDocument = (docId: string) => {
      if (window.confirm('Tem certeza que deseja excluir este documento?')) {
          const newDocs = documents.filter(d => d.id !== docId);
          setDocuments(newDocs);
          if (activeDocId === docId) setActiveDocId(null);
      }
  };

  const handleUpdateDoc = (updates: Partial<OfficialDocument>) => {
      if (!activeDocId) return;
      setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
  };

  // Editor Actions
  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      if (docEditorRef.current && activeDocId) {
          handleUpdateDoc({ content: docEditorRef.current.innerHTML });
      }
  };

  const handleImageUploadEditor = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  execCmd('insertImage', ev.target.result as string);
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleEditorDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  execCmd('insertImage', ev.target.result as string);
              }
          };
          reader.readAsDataURL(files[0]);
      }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setReferenceFile(file);
          setIsAnalyzingRef(true);
          
          // Simulation of OCR / Analysis
          setTimeout(() => {
              setIsAnalyzingRef(false);
              setAiChatHistory(prev => [...prev, { role: 'ai', text: `Analisei o arquivo "${file.name}". Aprendi a estrutura e o estilo de redação. Como posso ajudar agora?` }]);
              if (activeDocId) {
                  handleUpdateDoc({ referenceFile: file.name });
              }
          }, 2000);
      }
  };

  const handleAiGenerateDoc = () => {
      if (!docPrompt) return;
      
      const prompt = docPrompt;
      setDocPrompt('');
      setAiChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
      setIsProcessingAI(true);

      // Simulation of Gemini Generation
      setTimeout(() => {
          setIsProcessingAI(false);
          let generatedContent = '';
          const refText = referenceFile ? `Baseado no modelo "${referenceFile.name}", ` : '';
          
          if (prompt.toLowerCase().includes('poda')) {
              generatedContent = `<div><b>OFÍCIO Nº 123/${new Date().getFullYear()}</b><br/><br/>Assunto: Solicitação de Poda de Árvore<br/><br/>Prezados Senhores,<br/><br/>${refText}Venho por meio deste solicitar a intervenção urgente para poda de árvore localizada em área de risco, conforme descrito em sua solicitação.<br/><br/>Atenciosamente,<br/><br/>Diretoria da Associação.</div>`;
          } else if (prompt.toLowerCase().includes('ata')) {
              generatedContent = `<div><center><b>ATA DA ASSEMBLEIA GERAL ORDINÁRIA</b></center><br/><br/>Aos ${new Date().getDate()} dias do mês de... realizou-se a assembleia para deliberar sobre ${prompt.replace('ata', '').trim()}.<br/><br/>${refText}Seguindo o padrão estatutário...</div>`;
          } else {
              generatedContent = `<div>${refText}Aqui está o esboço do documento solicitado:<br/><br/>Referente a: ${prompt}<br/><br/>[Inserir corpo do texto formal aqui seguindo as normas da ABNT e o estilo da associação].<br/><br/>Atenciosamente.</div>`;
          }

          setAiChatHistory(prev => [...prev, { role: 'ai', text: 'Gerei o documento com base no seu pedido e no modelo de referência. O texto foi inserido no editor.' }]);
          
          if (activeDocId) {
              handleUpdateDoc({ content: generatedContent });
              if (docEditorRef.current) {
                  docEditorRef.current.innerHTML = generatedContent;
              }
          }
      }, 1500);
  };

  // Sync editor content when switching docs
  useEffect(() => {
      if (docEditorRef.current && activeDoc) {
          if (docEditorRef.current.innerHTML !== activeDoc.content) {
              docEditorRef.current.innerHTML = activeDoc.content;
          }
      }
  }, [activeDocId]);

  return (
    <div className="space-y-8 animate-fade-in" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Configurações</h2>
            <p className="text-slate-500 mt-1 font-medium">Gerencie dados da associação, acessos e modelos de impressão.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 overflow-x-auto">
          {['INFO', 'ACCESS', 'STUDIO', 'API'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                {tab === 'INFO' ? 'Associação' : tab === 'ACCESS' ? 'Usuários do Sistema' : tab === 'STUDIO' ? 'Studio IA' : 'Integrações'}
              </button>
          ))}
        </div>
      </div>

      {/* --- TAB: INFO --- */}
      {activeTab === 'INFO' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Building size={20} className="text-indigo-600"/> Dados Cadastrais
                    </h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Fantasia</label>
                        <input type="text" placeholder="Nome" value={systemInfo.name} onChange={e => onUpdateSystemInfo({...systemInfo, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CNPJ</label>
                        <input type="text" placeholder="CNPJ" value={systemInfo.cnpj} onChange={e => onUpdateSystemInfo({...systemInfo, cnpj: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Endereço Completo</label>
                        <input type="text" placeholder="Endereço" value={systemInfo.address} onChange={e => onUpdateSystemInfo({...systemInfo, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"/>
                    </div>
                    
                    {/* Toggle Mapas */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 flex items-center justify-between">
                        <div>
                            <label className="text-sm font-bold text-slate-800 block">Habilitar Mapas Interativos</label>
                            <p className="text-xs text-slate-500 mt-1">Ativa integração com OpenStreetMap e Leaflet. Desative em caso de erros.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={!!systemInfo.enableMaps} onChange={(e) => onUpdateSystemInfo({...systemInfo, enableMaps: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                        <ImageIcon size={20} className="text-indigo-600"/> Identidade Visual
                    </h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Logotipo Oficial</label>
                        <div className="border-2 border-dashed border-slate-300 bg-slate-50 p-6 rounded-xl flex flex-col items-center justify-center hover:bg-white hover:border-indigo-300 transition-all group cursor-pointer relative">
                             <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/>
                            {systemInfo.logoUrl ? (
                                <div className="text-center">
                                    <img src={systemInfo.logoUrl} className="w-32 h-32 object-contain bg-white rounded-lg p-2 border shadow-sm mx-auto mb-3"/>
                                    <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">Clique para alterar</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white border border-slate-200 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Upload size={24}/></div>
                                    <p className="text-sm font-medium text-slate-700">Clique para carregar imagem</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG (Recomendado fundo transparente)</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="text-amber-600 shrink-0" size={20}/>
                        <div>
                            <p className="text-sm font-bold text-amber-800">Atenção</p>
                            <p className="text-xs text-amber-700 mt-1">O logotipo atualizado será refletido automaticamente em todas as novas carteirinhas e documentos do sistema.</p>
                        </div>
                    </div>
                </div>
           </div>
           <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
               <button id="save-btn-info" onClick={handleSaveInfo} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95 transform">
                   <Save size={18}/> Salvar Alterações
               </button>
           </div>
        </div>
      )}

      {/* --- TAB: ACCESS --- */}
      {activeTab === 'ACCESS' && (
          <div className="space-y-8 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <UserPlus size={18} className="text-indigo-600"/> Política de Novos Cadastros
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${systemInfo.registrationMode === 'AUTOMATIC' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <input 
                        type="radio" name="regMode" checked={systemInfo.registrationMode === 'AUTOMATIC'}
                        onChange={() => onUpdateSystemInfo({...systemInfo, registrationMode: 'AUTOMATIC'})}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                        <span className="block text-sm font-bold text-slate-800">Cadastro Automático</span>
                        <span className="text-xs text-slate-500 leading-snug">Novos usuários ganham acesso imediato ao painel básico.</span>
                    </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${systemInfo.registrationMode === 'APPROVAL' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <input 
                        type="radio" name="regMode" checked={systemInfo.registrationMode === 'APPROVAL'}
                        onChange={() => onUpdateSystemInfo({...systemInfo, registrationMode: 'APPROVAL'})}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                        <span className="block text-sm font-bold text-slate-800">Requer Aprovação</span>
                        <span className="text-xs text-slate-500 leading-snug">O acesso permanece bloqueado até aprovação manual.</span>
                    </div>
                    </label>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600"/> Dados Complementares
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                            <label className="text-sm font-bold text-slate-800 block">Ativar Questionário Social / Ficha Cadastral</label>
                            <p className="text-xs text-slate-500 mt-1">Exige preenchimento de dados socioeconômicos (renda, saúde, moradia) para completar o cadastro.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={!!systemInfo.enableQuestionnaire} onChange={(e) => onUpdateSystemInfo({...systemInfo, enableQuestionnaire: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield size={20} className="text-indigo-600"/> Controle de Acesso
                    </h3>
                    <div className="flex gap-3">
                        <input 
                            type="text" placeholder="Buscar usuário..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow hover:bg-indigo-700 transition-all flex items-center gap-2">
                            <UserCheck size={16}/> Novo Operador
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-bold">Usuário (Login)</th>
                                <th className="p-4 font-bold">Nome Completo</th>
                                <th className="p-4 font-bold">Nível de Acesso</th>
                                <th className="p-4 font-bold">Permissões</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {usersList.filter(u => u.username && u.username.includes(searchTerm)).map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">{user.username?.substring(0,2).toUpperCase()}</div>
                                            <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-700">{user.name}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                        }`}>{user.role}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs text-slate-500 font-medium">{user.permissions && user.permissions.length > 0 ? `${user.permissions.length} personalizadas` : 'Padrão do Cargo'}</span>
                                    </td>
                                    <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ativo</span></td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenPasswordReset(user)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg tooltip" title="Redefinir Senha"><Lock size={16}/></button>
                                            <button onClick={() => handleOpenPermissions(user)} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg tooltip" title="Alterar Permissões"><Shield size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
          </div>
      )}

      {/* --- TAB: STUDIO --- */}
      {activeTab === 'STUDIO' && (
          <div className="space-y-6">
              {/* STUDIO SUB-NAVIGATION */}
              <div className="flex justify-center pb-4">
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shadow-inner border border-slate-200">
                      <button onClick={() => setStudioMode('CARDS')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${studioMode === 'CARDS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Carteirinhas</button>
                      <button onClick={() => setStudioMode('DOCS')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${studioMode === 'DOCS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Documentos Inteligentes</button>
                  </div>
              </div>

              {studioMode === 'CARDS' ? (
                  <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-300px)] min-h-[800px]">
                      {/* ID CARD SIDEBAR */}
                      <div className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seus Modelos</span>
                              <button onClick={handleCreateTemplate} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors"><Plus size={18}/></button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                              {templates.map(tpl => (
                                  <div 
                                    key={tpl.id} 
                                    onClick={() => { setSelectedTemplateId(tpl.id); setSelectedElementId(null); }}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group ${selectedTemplateId === tpl.id ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                                  >
                                      <div className="font-bold text-slate-800 text-sm mb-1">{tpl.name}</div>
                                      <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">{tpl.width}x{tpl.height}px</span>
                                        <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                                            {tpl.orientation === 'landscape' ? <div className="w-3 h-2 border border-slate-400"></div> : <div className="w-2 h-3 border border-slate-400"></div>}
                                            {tpl.orientation === 'landscape' ? 'Paisagem' : 'Retrato'}
                                        </span>
                                      </div>
                                      {selectedTemplateId === tpl.id && <div className="absolute right-2 top-2 w-2 h-2 bg-indigo-500 rounded-full"></div>}
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* CENTER CANVAS */}
                      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner p-6 flex flex-col items-center justify-center relative overflow-hidden select-none group/canvas">
                          {activeTemplate ? (
                              <>
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
                                    <div className="flex flex-col gap-2 pointer-events-auto">
                                        <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-200 p-1 flex gap-1">
                                            <button onClick={() => setStudioView('front')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${studioView === 'front' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>FRENTE</button>
                                            <button onClick={() => setStudioView('back')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${studioView === 'back' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>VERSO</button>
                                        </div>
                                        <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-200 p-2 flex gap-2">
                                            <button onClick={() => addElement('text-dynamic')} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors tooltip" title="Adicionar Texto Dinâmico"><Type size={18}/></button>
                                            <button onClick={() => addElement('text-static')} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors tooltip" title="Adicionar Texto Fixo"><Type size={18} className="font-serif"/></button>
                                            <button onClick={() => addElement('image')} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors tooltip" title="Adicionar Imagem"><ImageIcon size={18}/></button>
                                            <button onClick={() => addElement('shape')} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors tooltip" title="Adicionar Forma/Fundo"><Maximize size={18}/></button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pointer-events-auto">
                                        <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-200 p-2 flex gap-1">
                                            <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`} title="Grade"><Grid3X3 size={18}/></button>
                                            <button onClick={() => setShowGuides(!showGuides)} className={`p-2 rounded-lg transition-colors ${showGuides ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`} title="Margens"><Eye size={18}/></button>
                                        </div>
                                        <button onClick={saveCurrentTemplate} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg border border-white/20 transition-all ${saveSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>{saveSuccess ? <Check size={16}/> : <Save size={16}/>}{saveSuccess ? 'Salvo!' : 'Salvar'}</button>
                                    </div>
                                </div>
                                <div className="relative group perspective shadow-2xl rounded-xl">
                                    <div ref={canvasRef} className="relative bg-white overflow-hidden transition-all duration-300 ring-4 ring-white shadow-lg" style={{ width: `${activeTemplate.orientation === 'landscape' ? activeTemplate.width : activeTemplate.height}px`, height: `${activeTemplate.orientation === 'landscape' ? activeTemplate.height : activeTemplate.width}px`, background: studioView === 'front' ? activeTemplate.frontBackground : activeTemplate.backBackground, borderRadius: '12px' }} onClick={() => setSelectedElementId(null)}>
                                        {showGrid && <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>}
                                        {showGuides && <div className="absolute inset-[5mm] border border-dashed border-rose-400/50 pointer-events-none z-50"></div>}
                                        {activeTemplate.elements.filter(el => el.layer === studioView).map(el => (
                                            <div key={el.id} onMouseDown={(e) => handleMouseDown(e, el.id)} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: el.width ? `${el.width}px` : 'auto', height: el.height ? `${el.height}px` : 'auto', ...el.style, cursor: isDragging && selectedElementId === el.id ? 'grabbing' : 'grab', outline: selectedElementId === el.id ? '2px solid #4f46e5' : '1px dashed transparent', zIndex: selectedElementId === el.id ? 100 : undefined, userSelect: 'none' }} className={`group/el hover:outline-indigo-300 min-w-[20px] min-h-[20px] ${selectedElementId === el.id ? 'shadow-2xl' : ''}`}>
                                                {el.type === 'text-dynamic' && (el.field === 'name' ? 'NOME DO USUÁRIO' : `{${el.field}}`)}
                                                {el.type === 'text-static' && el.content}
                                                {el.type === 'image' && (<div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">{el.field === 'system.logo' && systemInfo.logoUrl ? <img src={systemInfo.logoUrl} className="w-full h-full object-cover"/> : <ImageIcon size={16} className="text-slate-300"/>}</div>)}
                                                {el.type === 'qrcode' && <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-1"><div className="flex flex-wrap gap-0.5 justify-center">{Array.from({length: 16}).map((_, i) => (<div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`}></div>))}</div></div>)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                              </>
                          ) : <div className="flex flex-col items-center justify-center text-slate-400"><CreditCard size={48} className="mb-4 opacity-20"/><p className="font-medium">Selecione um modelo</p></div>}
                      </div>

                      {/* RIGHT: PROPERTY INSPECTOR */}
                      <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                          {activeTemplate ? (
                              <div className="flex-1 overflow-y-auto custom-scrollbar">
                                  {!selectedElementId && (
                                    <div className="p-6 space-y-6">
                                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2"><Settings2 size={16} className="text-indigo-600"/> Configuração do Modelo</h4>
                                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Nome do Modelo</label><input type="text" value={activeTemplate.name} onChange={(e) => updateTemplate({ name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"/></div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Largura (px)</label><input type="number" value={activeTemplate.width} onChange={(e) => updateTemplate({ width: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"/></div>
                                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Altura (px)</label><input type="number" value={activeTemplate.height} onChange={(e) => updateTemplate({ height: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"/></div>
                                        </div>
                                    </div>
                                  )}
                                  {selectedElementId && activeElement && (
                                      <div className="p-6 space-y-6">
                                          <div className="flex justify-between items-center border-b border-slate-100 pb-3"><h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">Propriedades</h4><button onClick={() => removeElement(activeElement.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button></div>
                                          {activeElement.type === 'text-dynamic' && (<div><label className="text-xs font-bold text-slate-500 mb-1 block">Campo Dinâmico</label><select value={activeElement.field} onChange={(e) => updateElement(activeElement.id, { field: e.target.value as any })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"><option value="name">Nome</option><option value="role">Cargo</option><option value="cpfCnpj">CPF</option></select></div>)}
                                      </div>
                                  )}
                              </div>
                          ) : <div className="p-8 text-center text-slate-400 flex items-center justify-center h-full"><p>Nenhum modelo selecionado.</p></div>}
                      </div>
                  </div>
              ) : (
                  // --- DOCUMENTS MODE (RICH EDITOR) ---
                  <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-300px)] min-h-[800px]">
                      {/* SIDEBAR: SAVED DOCUMENTS */}
                      <div className="w-full lg:w-64 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Biblioteca</span>
                              <button onClick={handleCreateDocument} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors"><Plus size={18}/></button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                              {documents.map(doc => (
                                  <div 
                                    key={doc.id}
                                    onClick={() => setActiveDocId(doc.id)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all relative group ${activeDocId === doc.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                                  >
                                      <p className={`text-sm font-bold ${activeDocId === doc.id ? 'text-indigo-700' : 'text-slate-700'}`}>{doc.title}</p>
                                      <div className="flex justify-between items-center mt-1">
                                          <span className="text-[10px] text-slate-400 uppercase font-bold">{doc.type}</span>
                                          <span className="text-[10px] text-slate-400">{new Date(doc.updatedAt).toLocaleDateString()}</span>
                                      </div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                        className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                      >
                                          <Trash2 size={14}/>
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* CENTER: EDITOR */}
                      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col overflow-hidden relative shadow-inner">
                          {activeDoc ? (
                              <>
                                {/* Editor Toolbar */}
                                <div className="p-2 border-b border-slate-200 bg-white flex items-center justify-between gap-2 z-10 sticky top-0 shadow-sm">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => execCmd('bold')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Negrito"><Bold size={16}/></button>
                                        <button onClick={() => execCmd('italic')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Itálico"><Italic size={16}/></button>
                                        <button onClick={() => execCmd('underline')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Sublinhado"><Underline size={16}/></button>
                                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                        <button onClick={() => execCmd('justifyLeft')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Esquerda"><AlignLeft size={16}/></button>
                                        <button onClick={() => execCmd('justifyCenter')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Centro"><AlignCenter size={16}/></button>
                                        <button onClick={() => execCmd('justifyRight')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Direita"><AlignRight size={16}/></button>
                                        <button onClick={() => execCmd('justifyFull')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Justificado"><AlignJustify size={16}/></button>
                                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                        <input type="file" ref={docImageInputRef} className="hidden" accept="image/*" onChange={handleImageUploadEditor}/>
                                        <button onClick={() => docImageInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Inserir Imagem"><ImageIcon size={16}/></button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={activeDoc.pageSize || 'A4'} 
                                            onChange={(e) => handleUpdateDoc({ pageSize: e.target.value as any })}
                                            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none"
                                        >
                                            <option value="A4">A4 (210x297mm)</option>
                                            <option value="LETTER">Carta (216x279mm)</option>
                                        </select>
                                        <select 
                                            value={activeDoc.orientation || 'PORTRAIT'} 
                                            onChange={(e) => handleUpdateDoc({ orientation: e.target.value as any })}
                                            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none"
                                        >
                                            <option value="PORTRAIT">Retrato</option>
                                            <option value="LANDSCAPE">Paisagem</option>
                                        </select>
                                        <button onClick={() => alert('Documento salvo!')} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all ml-2"><Save size={14}/> Salvar</button>
                                    </div>
                                </div>

                                {/* Title Edit */}
                                <div className="px-6 py-4 bg-white border-b border-slate-100">
                                    <input 
                                        type="text" 
                                        value={activeDoc.title} 
                                        onChange={(e) => handleUpdateDoc({ title: e.target.value })} 
                                        className="w-full text-xl font-bold text-slate-800 outline-none placeholder-slate-400"
                                        placeholder="Título do Documento"
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Tipo:</span>
                                        <select 
                                            value={activeDoc.type} 
                                            onChange={(e) => handleUpdateDoc({ type: e.target.value as any })} 
                                            className="bg-transparent text-xs font-bold text-indigo-600 outline-none cursor-pointer hover:text-indigo-800"
                                        >
                                            <option value="OFICIO">Ofício</option>
                                            <option value="ATA">Ata de Reunião</option>
                                            <option value="MEMORANDO">Memorando</option>
                                            <option value="CIRCULAR">Circular</option>
                                            <option value="DECLARACAO">Declaração</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Main Editor Area (Paper Simulation) */}
                                <div className="flex-1 overflow-auto bg-slate-100 p-8 flex justify-center custom-scrollbar" onDrop={handleEditorDrop} onDragOver={(e) => e.preventDefault()}>
                                    <div 
                                        ref={docEditorRef}
                                        contentEditable
                                        className="bg-white shadow-2xl outline-none p-[20mm] text-slate-800 font-serif leading-relaxed text-sm transition-all"
                                        style={{ 
                                            width: activeDoc.orientation === 'LANDSCAPE' ? (activeDoc.pageSize === 'LETTER' ? '279mm' : '297mm') : (activeDoc.pageSize === 'LETTER' ? '216mm' : '210mm'),
                                            minHeight: activeDoc.orientation === 'LANDSCAPE' ? (activeDoc.pageSize === 'LETTER' ? '216mm' : '210mm') : (activeDoc.pageSize === 'LETTER' ? '279mm' : '297mm'),
                                        }}
                                        dangerouslySetInnerHTML={{ __html: activeDoc.content }}
                                        onInput={(e) => handleUpdateDoc({ content: e.currentTarget.innerHTML })}
                                    ></div>
                                </div>
                              </>
                          ) : (
                              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                  <FileText size={48} className="mb-4 opacity-20"/>
                                  <p>Selecione ou crie um documento.</p>
                              </div>
                          )}
                      </div>

                      {/* RIGHT: AI ASSISTANT */}
                      <div className="w-full lg:w-80 bg-slate-900 rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-800">
                          <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-2">
                              <Bot className="text-indigo-400" size={20}/>
                              <span className="font-bold text-white text-sm">Assistente IA</span>
                          </div>
                          
                          {/* File Upload / Reference */}
                          <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                              <input type="file" ref={refFileInput} className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleReferenceUpload} />
                              <div 
                                onClick={() => refFileInput.current?.click()}
                                className={`border-2 border-dashed border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-800 transition-all ${isAnalyzingRef ? 'animate-pulse' : ''}`}
                              >
                                  {isAnalyzingRef ? (
                                      <div className="text-indigo-400 text-xs font-bold flex flex-col items-center gap-2">
                                          <ScanLine className="animate-spin" size={20}/> Analisando estrutura...
                                      </div>
                                  ) : referenceFile ? (
                                      <div className="text-emerald-400 text-xs font-bold flex flex-col items-center gap-2">
                                          <FileCheck size={20}/> Modelo Aprendido: <br/>{referenceFile.name}
                                      </div>
                                  ) : (
                                      <div className="text-slate-500 text-xs font-medium flex flex-col items-center gap-2">
                                          <Paperclip size={20}/> Anexar Modelo (PDF/DOC)
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Chat Area */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                              {aiChatHistory.map((msg, idx) => (
                                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none'}`}>
                                          {msg.text}
                                      </div>
                                  </div>
                              ))}
                              {isProcessingAI && (
                                  <div className="flex justify-start">
                                      <div className="bg-slate-800 text-slate-400 p-3 rounded-xl rounded-bl-none text-xs flex items-center gap-2">
                                          <Sparkles size={12} className="animate-spin"/> Escrevendo documento...
                                      </div>
                                  </div>
                              )}
                          </div>

                          {/* Input Area */}
                          <div className="p-4 bg-slate-900 border-t border-slate-800">
                              <div className="relative">
                                  <input 
                                    type="text" 
                                    value={docPrompt} 
                                    onChange={(e) => setDocPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerateDoc()}
                                    placeholder="Ex: Crie um ofício sobre..." 
                                    className="w-full bg-slate-800 text-white text-sm rounded-xl pl-4 pr-10 py-3 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                                  />
                                  <button onClick={handleAiGenerateDoc} disabled={isProcessingAI || !docPrompt} className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white p-1.5 rounded-lg transition-colors disabled:opacity-50">
                                      <Send size={16}/>
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- TAB: API --- */}
      {activeTab === 'API' && (
          // (Conteúdo API mantido)
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200"><Globe size={32}/></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Central de Integrações</h3>
                  <p className="text-slate-500 max-w-lg mx-auto">Conecte o sistema a serviços externos para habilitar recursos avançados.</p>
              </div>
              {[
                { id: 'gemini', title: 'Google Gemini AI', desc: 'Recursos de OCR e IA.', icon: Cpu, color: 'bg-purple-600', connected: apiConfig.geminiConnected, fields: [{ label: 'API Key', value: apiConfig.geminiKey, onChange: (v: string) => setApiConfig({...apiConfig, geminiKey: v}), secure: true }], serviceName: 'Gemini' },
                { id: 'payment', title: 'Gateway de Pagamento', desc: 'Automação financeira.', icon: CreditCard, color: 'bg-emerald-600', connected: apiConfig.paymentConnected, fields: [{ label: 'API Access Token', value: apiConfig.paymentKey, onChange: (v: string) => setApiConfig({...apiConfig, paymentKey: v}), secure: true }], serviceName: 'Pagamentos' },
              ].map((integration) => (
                  <div key={integration.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                      <div className="p-6 flex items-start justify-between">
                          <div className="flex gap-4"><div className={`p-3 rounded-xl ${integration.color} bg-opacity-10 shrink-0`}><integration.icon size={24} className={integration.color.replace('bg-', 'text-')} /></div><div><h4 className="font-bold text-slate-800 text-lg">{integration.title}</h4><p className="text-sm text-slate-500">{integration.desc}</p></div></div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${integration.connected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}><div className={`w-2 h-2 rounded-full ${integration.connected ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>{integration.connected ? 'Conectado' : 'Desconectado'}</div>
                      </div>
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/30">
                          <div className="space-y-4 mt-4">
                              {integration.fields.map((field, idx) => (
                                  <div key={idx}>
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{field.label}</label>
                                      <div className="relative">
                                          <input type={field.secure && !showSecrets[`${integration.id}-${idx}`] ? "password" : "text"} value={field.value} onChange={(e) => field.onChange && field.onChange(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"/>
                                          {field.secure && (<button onClick={() => toggleSecret(`${integration.id}-${idx}`)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">{showSecrets[`${integration.id}-${idx}`] ? <EyeOff size={16}/> : <Eye size={16}/>}</button>)}
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-6 flex justify-end gap-3"><button onClick={() => handleSaveApi(integration.serviceName)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2"><Save size={16}/> Salvar Configuração</button></div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* --- MODALS --- */}
      
      {/* PERMISSION MANAGER MODAL */}
      {permissionUser && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                  <div className="p-6 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800">Gerenciar Permissões</h3>
                      <p className="text-sm text-slate-500">Editando acesso de: <span className="font-bold text-indigo-600">{permissionUser.name}</span></p>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                      {Object.entries(groupedPermissions).map(([module, perms]) => (
                          <div key={module}>
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-100 pb-1">{module}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {perms.map(p => (
                                      <label key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${tempPermissions.includes(p.id) ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                          <input 
                                            type="checkbox" 
                                            checked={tempPermissions.includes(p.id)} 
                                            onChange={() => handleTogglePermission(p.id)}
                                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                          />
                                          <span className={`text-sm font-medium ${tempPermissions.includes(p.id) ? 'text-indigo-800' : 'text-slate-600'}`}>{p.label}</span>
                                      </label>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setPermissionUser(null)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                      <button onClick={handleSavePermissions} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm">Salvar Permissões</button>
                  </div>
              </div>
          </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {passwordResetUser && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                  <div className="p-6 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Key size={20} className="text-indigo-600"/> Redefinir Senha</h3>
                      <p className="text-sm text-slate-500 mt-1">Alterando senha de: <span className="font-bold text-indigo-600">{passwordResetUser.name}</span></p>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nova Senha</label>
                          <input 
                            type="text" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            placeholder="Digite a nova senha..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                          <p className="text-xs text-slate-400 mt-2">Dica: Use uma senha forte com letras e números.</p>
                      </div>
                  </div>
                  <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setPasswordResetUser(null)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                      <button onClick={handleSavePassword} disabled={!newPassword} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">Confirmar Alteração</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Settings;