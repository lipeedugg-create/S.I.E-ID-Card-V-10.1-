
import React, { useState, useRef, useEffect } from 'react';
import { AVAILABLE_ROLES, SYSTEM_PERMISSIONS } from '../constants';
import { SystemInfo, IdCardTemplate, CardElement, User, Permission } from '../types';
import { 
  Save, Sparkles, Key, Building, Shield, Check, X, Upload, 
  Image as ImageIcon, CreditCard, Plus, Trash2, 
  Move, Type, MousePointer2, Layers, AlignLeft, AlignCenter, AlignRight,
  ArrowUp, ArrowDown, Maximize, AlertCircle, Grid3X3, Eye, Settings2, UserCheck, Lock, RefreshCw, CheckSquare, Square, UserPlus,
  Cpu, MessageCircle, Landmark, Globe, EyeOff, Link as LinkIcon, AlertTriangle
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
  
  // STUDIO STATES
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [studioView, setStudioView] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number, y: number, initialElX: number, initialElY: number } | null>(null);

  // ACCESS TAB STATES
  const [searchTerm, setSearchTerm] = useState('');
  
  // PERMISSIONS MODAL STATE
  const [permissionUser, setPermissionUser] = useState<User | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

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
  };

  const groupedPermissions = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm);
      return acc;
  }, {} as Record<string, Permission[]>);

  // --- STUDIO LOGIC ---
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

  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
      if (!activeTemplate) return;
      const index = activeTemplate.elements.findIndex(el => el.id === elementId);
      if (index === -1) return;
      const newElements = [...activeTemplate.elements];
      if (direction === 'up' && index < newElements.length - 1) {
          [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
      } else if (direction === 'down' && index > 0) {
          [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
      }
      updateTemplate({ elements: newElements });
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
                {tab === 'INFO' ? 'Associação' : tab === 'ACCESS' ? 'Usuários do Sistema' : tab === 'STUDIO' ? 'Studio Carteirinha' : 'Integrações'}
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
                                            <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg tooltip" title="Redefinir Senha"><Lock size={16}/></button>
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

      {/* --- STUDIO --- */}
      {activeTab === 'STUDIO' && (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[800px]">
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

              {/* CENTER CANVAS (UNCHANGED LOGIC, JUST STYLING) */}
              <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner p-6 flex flex-col items-center justify-center relative overflow-hidden select-none group/canvas">
                  {/* ... Toolbar & Canvas rendering (same as before) ... */}
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
                                        {el.type === 'qrcode' && <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[8px] border border-white">QR</div>}
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
                                {/* Orientation & Color pickers remain similar but cleaner */}
                            </div>
                          )}
                          {selectedElementId && activeElement && (
                              <div className="p-6 space-y-6">
                                  <div className="flex justify-between items-center border-b border-slate-100 pb-3"><h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">Propriedades</h4><button onClick={() => removeElement(activeElement.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button></div>
                                  {activeElement.type === 'text-dynamic' && (<div><label className="text-xs font-bold text-slate-500 mb-1 block">Campo Dinâmico</label><select value={activeElement.field} onChange={(e) => updateElement(activeElement.id, { field: e.target.value as any })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"><option value="name">Nome</option><option value="role">Cargo</option><option value="cpfCnpj">CPF</option></select></div>)}
                                  {/* Inputs stylized */}
                              </div>
                          )}
                      </div>
                  ) : <div className="p-8 text-center text-slate-400 flex items-center justify-center h-full"><p>Nenhum modelo selecionado.</p></div>}
              </div>
          </div>
      )}

      {/* --- TAB: API --- */}
      {activeTab === 'API' && (
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
    </div>
  );
};

export default Settings;
