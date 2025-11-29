
import React, { useState } from 'react';
import { MOCK_USER, MENU_ITEMS, MOCK_SYSTEM_INFO, MOCK_TEMPLATES, MOCK_USERS_LIST, MOCK_ALERTS, MOCK_FINANCIALS } from './constants';
import { SystemInfo, IdCardTemplate, User, UserRole, Alert, FinancialRecord } from './types';
import { LogOut, Search, Bell, Menu, X, Lock, User as UserIcon, ArrowRight, AlertCircle, Building, CheckCircle, ArrowLeft, Info, Check, AlertTriangle, ShieldAlert, Construction, ClipboardList, Calendar, Wallet, Map } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Communication from './components/Communication';
import SmartMap from './components/SmartMap';
import Settings from './components/Settings';
import UserManagement from './components/UserManagement';
import Surveys from './components/Surveys';
import Timeline from './components/Timeline';
import Operations from './components/Operations';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Login Form State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Registration Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Hoisted State (Global Data)
  const [systemInfo, setSystemInfo] = useState<SystemInfo>(MOCK_SYSTEM_INFO);
  const [templates, setTemplates] = useState<IdCardTemplate[]>(MOCK_TEMPLATES);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS_LIST);
  const [systemAlerts, setSystemAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(MOCK_FINANCIALS);

  // AUTHENTICATION HANDLER
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    setTimeout(() => {
        // Check for mock users
        const user = allUsers.find(u => u.username === loginUser && u.password === loginPass);
        setIsLoggingIn(false);

        if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setLoginError('');
            setActiveTab('dashboard');
        } else {
            setLoginError('Credenciais inválidas. Tente admin / 123');
        }
    }, 800);
  };

  const handleRegistration = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate registration request
      setRegSuccess(true);
      
      // AUTO REGISTRATION LOGIC
      if (systemInfo.registrationMode === 'AUTOMATIC') {
          setTimeout(() => {
              const newUser: User = {
                  id: Date.now().toString(),
                  name: regName,
                  username: regEmail.split('@')[0],
                  password: regPassword,
                  role: UserRole.RESIDENT,
                  active: true,
                  email: regEmail,
                  phone: regPhone,
                  avatarUrl: `https://ui-avatars.com/api/?name=${regName}&background=random`,
                  profileCompletion: 20
              };
              setAllUsers([...allUsers, newUser]);
              setCurrentUser(newUser);
              setIsAuthenticated(true);
              setRegSuccess(false);
              setIsRegistering(false);
              alert('Cadastro realizado com sucesso! Bem-vindo.');
          }, 1500);
      } else {
        setTimeout(() => {
            setRegSuccess(false);
            setIsRegistering(false);
            setLoginError(''); // Clear any previous errors
            setLoginUser(regEmail.split('@')[0]); // Suggest username
            alert('Solicitação enviada com sucesso! Aguarde a aprovação da administração.');
        }, 2500);
      }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoginUser('');
      setLoginPass('');
  };

  const handleAddAlert = (alert: Alert) => {
      setSystemAlerts([alert, ...systemAlerts]);
  };

  // ROLE BASED MENU FILTERING
  const allowedMenuItems = MENU_ITEMS.filter(item => {
      if (!currentUser) return false;
      if (currentUser.role === UserRole.ADMIN) return true; // Admin sees everything
      if (item.roles.includes('ALL')) return true; // Public modules
      return item.roles.includes(currentUser.role as UserRole);
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <UserManagement systemInfo={systemInfo} templates={templates} transactions={financialRecords} onUpdateTransactions={setFinancialRecords} />;
      case 'finance': return <Finance transactions={financialRecords} onUpdateTransactions={setFinancialRecords} />;
      case 'social': return <Communication alerts={systemAlerts} onAddAlert={handleAddAlert} />;
      case 'map': return <SmartMap />;
      case 'operations': return <Operations />;
      case 'surveys': return <Surveys />;
      case 'timeline': return <Timeline />;
      case 'settings': return <Settings systemInfo={systemInfo} onUpdateSystemInfo={setSystemInfo} templates={templates} onUpdateTemplates={setTemplates} usersList={allUsers} onUpdateUsers={setAllUsers} />;
      default: return <Dashboard />;
    }
  };

  // --- LOGIN & REGISTER SCREEN ---
  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
              {/* ANIMATED BACKGROUND */}
              <div className="absolute inset-0 z-0">
                   <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                   <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                   <div className="absolute -bottom-40 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
              </div>

              <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in transition-all duration-300 relative z-10">
                  {/* HEADER WITH DYNAMIC LOGO */}
                  <div className="bg-transparent p-8 text-center relative">
                      <div className="relative z-10 flex flex-col items-center">
                          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-6 p-2 ring-1 ring-white/30">
                              {systemInfo.logoUrl ? (
                                  <img src={systemInfo.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                  <span className="font-bold text-4xl">S</span>
                              )}
                          </div>
                          <h1 className="text-2xl font-bold text-white tracking-tight uppercase drop-shadow-md">{systemInfo.name || 'S.I.E System'}</h1>
                          <p className="text-indigo-200 text-sm font-medium mt-1">Sistema Inteligente Ativo</p>
                      </div>
                  </div>
                  
                  {isRegistering ? (
                      // REGISTRATION FORM
                      <form onSubmit={handleRegistration} className="p-8 space-y-5 bg-white/95 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
                           <div className="text-center mb-4">
                              <h2 className="text-xl font-bold text-slate-800">Solicitar Acesso</h2>
                              <p className="text-slate-500 text-sm">Crie sua conta para acessar o sistema.</p>
                           </div>

                           {regSuccess ? (
                               <div className="bg-emerald-50 text-emerald-600 p-8 rounded-2xl flex flex-col items-center text-center animate-fade-in border border-emerald-100">
                                   <CheckCircle size={48} className="mb-4"/>
                                   <p className="font-bold text-lg">Solicitação Enviada!</p>
                                   <p className="text-sm mt-2 text-emerald-700">Aguardando processamento do sistema.</p>
                               </div>
                           ) : (
                               <>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Nome Completo</label>
                                        <input 
                                            type="text" required
                                            value={regName} onChange={e => setRegName(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder-slate-400"
                                            placeholder="Seu nome"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">WhatsApp</label>
                                            <input 
                                                type="tel" required
                                                value={regPhone} onChange={e => setRegPhone(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder-slate-400"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Senha</label>
                                            <input 
                                                type="password" required
                                                value={regPassword} onChange={e => setRegPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder-slate-400"
                                                placeholder="Criar senha"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">E-mail (Opcional)</label>
                                        <input 
                                            type="email"
                                            value={regEmail} onChange={e => setRegEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder-slate-400"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                                    Enviar Solicitação
                                </button>
                               </>
                           )}
                           
                           <button type="button" onClick={() => setIsRegistering(false)} className="w-full py-2 text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                               <ArrowLeft size={16}/> Voltar para Login
                           </button>
                      </form>
                  ) : (
                      // LOGIN FORM
                      <form onSubmit={handleLogin} className="p-8 space-y-6 bg-white/95 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
                          <div className="text-center mb-2">
                              <h2 className="text-xl font-bold text-slate-900">Bem-vindo</h2>
                              <p className="text-slate-500 text-sm font-medium">Faça login para gerenciar sua unidade.</p>
                          </div>

                          {loginError && (
                              <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2 border border-rose-100 animate-fade-in justify-center">
                                  <AlertCircle size={16} /> {loginError}
                              </div>
                          )}

                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5 ml-1">Usuário</label>
                                  <div className="relative">
                                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input 
                                        type="text" 
                                        value={loginUser}
                                        onChange={e => setLoginUser(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder-slate-400" 
                                        placeholder="Ex: admin"
                                      />
                                  </div>
                              </div>
                              <div>
                                  <div className="flex justify-between items-center mb-1.5 ml-1">
                                      <label className="block text-xs font-bold text-slate-900 uppercase">Senha</label>
                                      <a href="#" className="text-[10px] font-bold text-indigo-600 hover:underline">Esqueceu a senha?</a>
                                  </div>
                                  <div className="relative">
                                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input 
                                        type="password" 
                                        value={loginPass}
                                        onChange={e => setLoginPass(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder-slate-400" 
                                        placeholder="••••••••"
                                      />
                                  </div>
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer ml-1">
                                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"/>
                                  <span className="text-xs font-medium text-slate-600">Lembrar meu acesso</span>
                              </label>
                          </div>

                          <button 
                            type="submit" 
                            disabled={isLoggingIn}
                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                          >
                              {isLoggingIn ? 'Autenticando...' : 'Entrar no Sistema'}
                              {!isLoggingIn && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                          </button>

                          <div className="text-center mt-6 pt-6 border-t border-slate-100">
                              <p className="text-xs text-slate-400 mb-3">Ainda não possui conta?</p>
                              <button type="button" onClick={() => setIsRegistering(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all">
                                  Solicitar Cadastro de Morador
                              </button>
                          </div>
                      </form>
                  )}
              </div>
          </div>
      );
  }

  // --- MAIN APP (SHELL LAYOUT) ---
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Flex Item, Fixed on Mobile, Static on Desktop */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white overflow-hidden">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg shrink-0 overflow-hidden p-1">
                  {systemInfo.logoUrl ? <img src={systemInfo.logoUrl} className="w-full h-full object-contain"/> : 'S'}
              </div>
              <span className="truncate">{systemInfo.name?.split(' ')[0] || 'S.I.E'}</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="px-4 py-6 flex-1 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4 px-2">Painel de Controle</p>
            <nav className="space-y-1">
              {allowedMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative
                    ${activeTab === item.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                  `}
                >
                  <item.icon size={20} className={`relative z-10 transition-colors ${activeTab === item.id ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="relative z-10">{item.label}</span>
                  {activeTab === item.id && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white/40"></div>}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-white/5 bg-slate-900/50">
            <div className="mb-4 px-2">
                 <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Licenciado para</p>
                 <div className="flex items-center gap-2">
                    <Building size={12} className="text-slate-500"/>
                    <p className="text-xs text-slate-200 font-medium truncate">{systemInfo.name}</p>
                 </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all">
              <LogOut size={18} />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Flex Item */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full relative">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm transition-all shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100">
              <Menu size={24} />
            </button>
            <div className="relative hidden sm:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar (ex: morador, unidade...)" 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white w-56 md:w-72 transition-all shadow-inner placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-full transition-all ${showNotifications ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'}`}
                >
                  <Bell size={22} />
                  {systemAlerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>}
                </button>

                {/* NOTIFICATIONS DROPDOWN */}
                {showNotifications && (
                    <div className="absolute right-0 mt-4 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-scale-in origin-top-right">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h4 className="font-bold text-slate-800 text-sm">Notificações</h4>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{systemAlerts.length} novas</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {systemAlerts.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">Nenhuma notificação nova.</div>
                            ) : (
                                systemAlerts.map(alert => (
                                    <div key={alert.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full shrink-0 ${
                                                alert.type === 'EMERGENCY' ? 'bg-rose-100 text-rose-600' :
                                                alert.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                                alert.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                            }`}>
                                                {alert.type === 'EMERGENCY' ? <ShieldAlert size={16}/> : 
                                                 alert.type === 'WARNING' ? <AlertTriangle size={16}/> : 
                                                 alert.type === 'SUCCESS' ? <Check size={16}/> : <Info size={16}/>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">{alert.title}</p>
                                                <p className="text-xs text-slate-500 mt-1 leading-snug">{alert.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(alert.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                            <button onClick={() => { setActiveTab('social'); setShowNotifications(false); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Ver Central de Alertas</button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-4 pl-4 md:pl-6 border-l border-slate-200">
              <div className="text-right hidden md:block leading-tight">
                <p className="text-sm font-bold text-slate-800">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 font-medium">{currentUser?.unit || 'Sistema'} • <span className="text-indigo-600">{currentUser?.role}</span></p>
              </div>
              <img 
                src={currentUser?.avatarUrl || 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content Wrapper */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 scroll-smooth custom-scrollbar">
            <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 pb-10">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
