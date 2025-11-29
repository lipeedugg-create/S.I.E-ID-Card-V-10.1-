import React, { useState } from 'react';
import { MOCK_NOTICES, MOCK_POLLS } from '../constants';
import { Alert, Notice } from '../types';
import { 
    FileText, MessageSquare, PieChart, Download, Clock, Send, 
    Bell, Users, Smartphone, Mail, AlertTriangle, CheckCircle, 
    History, Megaphone, Trash2, Plus, Info, Check
} from 'lucide-react';

interface CommunicationProps {
    alerts?: Alert[];
    onAddAlert?: (alert: Alert) => void;
}

const Communication: React.FC<CommunicationProps> = ({ alerts = [], onAddAlert }) => {
  const [activeTab, setActiveTab] = useState<'BOARD' | 'ALERTS' | 'POLLS'>('BOARD');
  
  // ALERT WIZARD STATE
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<Alert['type']>('INFO');
  const [alertTarget, setAlertTarget] = useState<Alert['target']>('ALL');
  const [selectedChannels, setSelectedChannels] = useState<Alert['channels']>(['APP']);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const toggleChannel = (channel: 'APP' | 'EMAIL' | 'WHATSAPP') => {
      if (selectedChannels.includes(channel)) {
          setSelectedChannels(selectedChannels.filter(c => c !== channel));
      } else {
          setSelectedChannels([...selectedChannels, channel]);
      }
  };

  const handleSendAlert = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSending(true);
      
      // Simulate API call
      setTimeout(() => {
          setIsSending(false);
          setSendSuccess(true);
          
          if (onAddAlert) {
              const newAlert: Alert = {
                  id: `new_${Date.now()}`,
                  title: alertTitle,
                  message: alertMsg,
                  type: alertType,
                  target: alertTarget,
                  channels: selectedChannels,
                  date: new Date().toISOString(),
                  sentBy: 'Administrador' // Mocked
              };
              onAddAlert(newAlert);
          }

          setTimeout(() => {
              setSendSuccess(false);
              setAlertTitle('');
              setAlertMsg('');
              setAlertType('INFO');
          }, 3000);
      }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        {/* TABS */}
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 w-fit">
            {[
                { id: 'BOARD', label: 'Mural Digital', icon: MessageSquare },
                { id: 'ALERTS', label: 'Central de Disparos', icon: Megaphone },
                { id: 'POLLS', label: 'Votações', icon: PieChart }
            ].map(tab => (
                <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
                >
                <tab.icon size={18}/> {tab.label}
                </button>
            ))}
        </div>

      {activeTab === 'BOARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Notices Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="text-indigo-600" /> Comunicados Fixados
                    </h2>
                    <button className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100">
                        <Plus size={16} className="inline mr-1"/> Novo Aviso
                    </button>
                </div>
                
                <div className="space-y-4">
                    {MOCK_NOTICES.map(notice => (
                    <div key={notice.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-all">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        notice.urgency === 'HIGH' ? 'bg-rose-500' : 
                        notice.urgency === 'MEDIUM' ? 'bg-amber-500' : 'bg-indigo-500'
                        }`} />
                        <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">{notice.title}</h3>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md">
                            <Clock size={12} />
                            {new Date(notice.date).toLocaleDateString('pt-BR')}
                        </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{notice.content}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {notice.author.charAt(0)}
                        </div>
                        <span>Postado por: <span className="text-slate-800">{notice.author}</span></span>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-amber-500" /> Documentos Públicos
                </h2>
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                    {['Ata Assembleia Set/23.pdf', 'Regimento Interno Atualizado.pdf', 'Balancete Outubro.xlsx'].map((doc, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{doc}</span>
                            </div>
                            <Download size={18} className="text-slate-400 hover:text-indigo-600 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'ALERTS' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
              {/* LEFT: CREATE ALERT */}
              <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                       <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                           <Send className="text-indigo-600" size={20}/> Criar Novo Alerta
                       </h3>
                       
                       {sendSuccess ? (
                           <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center animate-fade-in">
                               <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <CheckCircle size={32}/>
                               </div>
                               <h4 className="text-xl font-bold text-emerald-800">Alerta Enviado!</h4>
                               <p className="text-emerald-600 mt-2">Sua mensagem está sendo processada e enviada para os destinatários selecionados.</p>
                           </div>
                       ) : (
                           <form onSubmit={handleSendAlert} className="space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Título do Alerta</label>
                                       <input 
                                         type="text" required 
                                         value={alertTitle} onChange={e => setAlertTitle(e.target.value)}
                                         className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                         placeholder="Ex: Manutenção Urgente"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nível de Urgência</label>
                                       <select 
                                         value={alertType} onChange={e => setAlertType(e.target.value as any)}
                                         className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                       >
                                           <option value="INFO">Informativo (Padrão)</option>
                                           <option value="WARNING">Aviso Importante</option>
                                           <option value="EMERGENCY">EMERGÊNCIA (Notificação Sonora)</option>
                                           <option value="SUCCESS">Comunicado Positivo</option>
                                       </select>
                                   </div>
                               </div>
                               
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mensagem</label>
                                   <textarea 
                                      required rows={4}
                                      value={alertMsg} onChange={e => setAlertMsg(e.target.value)}
                                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                      placeholder="Digite a mensagem completa aqui..."
                                   ></textarea>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                   <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><Users size={16}/> Público Alvo</label>
                                       <div className="space-y-2">
                                           {['ALL', 'BLOCK_A', 'BLOCK_B', 'STAFF'].map(target => (
                                               <label key={target} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${alertTarget === target ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                                                   <input 
                                                     type="radio" name="target" 
                                                     checked={alertTarget === target} 
                                                     onChange={() => setAlertTarget(target as any)}
                                                     className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                                   />
                                                   <span className="text-sm font-bold text-slate-700">
                                                       {target === 'ALL' ? 'Todos os Usuários' : target === 'BLOCK_A' ? 'Apenas Bloco A' : target === 'BLOCK_B' ? 'Apenas Bloco B' : 'Apenas Funcionários'}
                                                   </span>
                                               </label>
                                           ))}
                                       </div>
                                   </div>
                                   
                                   <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><Bell size={16}/> Canais de Envio</label>
                                       <div className="space-y-2">
                                           <div onClick={() => toggleChannel('APP')} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedChannels.includes('APP') ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                                               <div className={`p-1.5 rounded-md ${selectedChannels.includes('APP') ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}><Smartphone size={16}/></div>
                                               <span className="text-sm font-bold text-slate-700">Notificação Push (App)</span>
                                               {selectedChannels.includes('APP') && <Check size={16} className="ml-auto text-indigo-600"/>}
                                           </div>
                                           <div onClick={() => toggleChannel('EMAIL')} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedChannels.includes('EMAIL') ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                                               <div className={`p-1.5 rounded-md ${selectedChannels.includes('EMAIL') ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}><Mail size={16}/></div>
                                               <span className="text-sm font-bold text-slate-700">E-mail</span>
                                               {selectedChannels.includes('EMAIL') && <Check size={16} className="ml-auto text-indigo-600"/>}
                                           </div>
                                           <div onClick={() => toggleChannel('WHATSAPP')} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedChannels.includes('WHATSAPP') ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                                               <div className={`p-1.5 rounded-md ${selectedChannels.includes('WHATSAPP') ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}><MessageSquare size={16}/></div>
                                               <span className="text-sm font-bold text-slate-700">WhatsApp (API)</span>
                                               {selectedChannels.includes('WHATSAPP') && <Check size={16} className="ml-auto text-indigo-600"/>}
                                           </div>
                                       </div>
                                   </div>
                               </div>

                               <div className="pt-6 border-t border-slate-100 flex justify-end">
                                   <button disabled={isSending} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait">
                                       {isSending ? 'Enviando...' : 'Disparar Alerta'}
                                       {!isSending && <Send size={18}/>}
                                   </button>
                               </div>
                           </form>
                       )}
                  </div>
              </div>

              {/* RIGHT: HISTORY */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <History className="text-slate-400" size={20}/> Histórico de Envios
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {alerts.map(alert => (
                          <div key={alert.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all group">
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      alert.type === 'EMERGENCY' ? 'bg-rose-100 text-rose-600' :
                                      alert.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                      alert.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                  }`}>{alert.type === 'EMERGENCY' ? 'EMERGÊNCIA' : alert.type}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{new Date(alert.date).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm mb-1">{alert.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2">{alert.message}</p>
                              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-[10px] text-slate-400">
                                  <Users size={12}/> {alert.target}
                                  <span className="mx-1">•</span>
                                  {alert.channels.join(', ')}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'POLLS' && (
          <div className="space-y-6 animate-fade-in">
             {MOCK_POLLS.map(poll => (
              <div key={poll.id} className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 max-w-2xl">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-slate-800 text-lg">{poll.question}</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">Em andamento</span>
                </div>
                
                <div className="space-y-5">
                  {poll.options.map(option => {
                    const percentage = Math.round((option.votes / poll.totalVotes) * 100);
                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-slate-700">{option.text}</span>
                          <span className="text-slate-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{poll.totalVotes} votos registrados</span>
                  <button className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                    Votar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default Communication;