
import React, { useState } from 'react';
import { MOCK_RESERVATIONS, MOCK_INCIDENTS, MOCK_VISITORS, MOCK_MAINTENANCE } from '../constants';
import { Reservation, Incident, Visitor, MaintenanceRecord } from '../types';
import { 
    Construction, Calendar, AlertTriangle, Users, Plus, CheckCircle, 
    XCircle, Clock, Search, Filter, Wrench, UserCheck, Truck, MoreHorizontal
} from 'lucide-react';

const Operations: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'RESERVATIONS' | 'INCIDENTS' | 'CONCIERGE' | 'MAINTENANCE'>('RESERVATIONS');

    // MOCK DATA STATES
    const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
    const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
    const [visitors, setVisitors] = useState<Visitor[]>(MOCK_VISITORS);
    const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);

    // MODAL STATES
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);

    // FORM STATES (Simplistic for demo)
    const [newRes, setNewRes] = useState<Partial<Reservation>>({ status: 'PENDING' });
    const [newInc, setNewInc] = useState<Partial<Incident>>({ status: 'OPEN', priority: 'MEDIUM' });
    const [newVis, setNewVis] = useState<Partial<Visitor>>({ type: 'VISITOR' });

    // HANDLERS
    const handleAddReservation = () => {
        if (!newRes.area || !newRes.date) return;
        setReservations([...reservations, { ...newRes, id: `r_${Date.now()}` } as Reservation]);
        setIsReservationModalOpen(false);
        setNewRes({ status: 'PENDING' });
    };

    const handleAddIncident = () => {
        if (!newInc.title) return;
        setIncidents([...incidents, { ...newInc, id: `i_${Date.now()}`, date: new Date().toISOString().slice(0, 10), reportedBy: 'Admin' } as Incident]);
        setIsIncidentModalOpen(false);
        setNewInc({ status: 'OPEN', priority: 'MEDIUM' });
    };

    const handleAddVisitor = () => {
        if (!newVis.name) return;
        setVisitors([...visitors, { ...newVis, id: `v_${Date.now()}`, entryTime: new Date().toISOString(), registeredBy: 'Portaria' } as Visitor]);
        setIsVisitorModalOpen(false);
        setNewVis({ type: 'VISITOR' });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: any = {
            CONFIRMED: 'bg-emerald-100 text-emerald-700',
            PENDING: 'bg-amber-100 text-amber-700',
            CANCELLED: 'bg-rose-100 text-rose-700',
            OPEN: 'bg-rose-100 text-rose-700',
            IN_PROGRESS: 'bg-blue-100 text-blue-700',
            RESOLVED: 'bg-emerald-100 text-emerald-700',
            COMPLETED: 'bg-emerald-100 text-emerald-700',
            SCHEDULED: 'bg-indigo-100 text-indigo-700'
        };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${colors[status] || 'bg-slate-100'}`}>{status}</span>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
             {/* HEADER & TABS */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Módulo Operacional</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Gerencie reservas, ocorrências, manutenções e portaria.</p>
                </div>
                <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 overflow-x-auto">
                    {[
                        { id: 'RESERVATIONS', label: 'Reservas', icon: Calendar },
                        { id: 'INCIDENTS', label: 'Ocorrências', icon: AlertTriangle },
                        { id: 'CONCIERGE', label: 'Portaria', icon: UserCheck },
                        { id: 'MAINTENANCE', label: 'Manutenção', icon: Wrench }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                        >
                            <tab.icon size={16}/> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                {/* TOOLBAR */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                     <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input type="text" placeholder="Buscar registros..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all placeholder-slate-400" />
                     </div>
                     <button 
                        onClick={() => {
                            if (activeTab === 'RESERVATIONS') setIsReservationModalOpen(true);
                            if (activeTab === 'INCIDENTS') setIsIncidentModalOpen(true);
                            if (activeTab === 'CONCIERGE') setIsVisitorModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                         <Plus size={14}/> Novo Registro
                     </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase">
                            <tr>
                                {activeTab === 'RESERVATIONS' && <><th className="p-5">Área Comum</th><th className="p-5">Data/Hora</th><th className="p-5">Morador</th><th className="p-5">Status</th></>}
                                {activeTab === 'INCIDENTS' && <><th className="p-5">Título</th><th className="p-5">Local</th><th className="p-5">Prioridade</th><th className="p-5">Status</th></>}
                                {activeTab === 'CONCIERGE' && <><th className="p-5">Visitante</th><th className="p-5">Tipo</th><th className="p-5">Destino</th><th className="p-5">Entrada</th></>}
                                {activeTab === 'MAINTENANCE' && <><th className="p-5">Serviço</th><th className="p-5">Tipo</th><th className="p-5">Data</th><th className="p-5">Status</th></>}
                                <th className="p-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeTab === 'RESERVATIONS' && reservations.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-bold text-slate-700">{r.area}</td>
                                    <td className="p-5 text-sm">{new Date(r.date).toLocaleDateString()} • {r.startTime} - {r.endTime}</td>
                                    <td className="p-5 text-sm">{r.resident}</td>
                                    <td className="p-5"><StatusBadge status={r.status}/></td>
                                    <td className="p-5 text-right"><MoreHorizontal className="ml-auto text-slate-400 cursor-pointer hover:text-indigo-600"/></td>
                                </tr>
                            ))}
                            {activeTab === 'INCIDENTS' && incidents.map(i => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-bold text-slate-700">{i.title}</td>
                                    <td className="p-5 text-sm">{i.location}</td>
                                    <td className="p-5"><span className={`font-bold text-xs ${i.priority === 'HIGH' ? 'text-rose-600' : 'text-slate-600'}`}>{i.priority}</span></td>
                                    <td className="p-5"><StatusBadge status={i.status}/></td>
                                    <td className="p-5 text-right"><MoreHorizontal className="ml-auto text-slate-400 cursor-pointer hover:text-indigo-600"/></td>
                                </tr>
                            ))}
                            {activeTab === 'CONCIERGE' && visitors.map(v => (
                                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-bold text-slate-700">{v.name} <span className="block text-[10px] text-slate-400 font-mono">{v.document}</span></td>
                                    <td className="p-5 text-sm">{v.type === 'DELIVERY' ? <span className="flex items-center gap-1"><Truck size={14}/> Entrega</span> : 'Visita'}</td>
                                    <td className="p-5 text-sm">{v.destinationUnit}</td>
                                    <td className="p-5 text-sm">{new Date(v.entryTime).toLocaleString()}</td>
                                    <td className="p-5 text-right"><MoreHorizontal className="ml-auto text-slate-400 cursor-pointer hover:text-indigo-600"/></td>
                                </tr>
                            ))}
                             {activeTab === 'MAINTENANCE' && maintenance.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-bold text-slate-700">{m.title} <span className="block text-[10px] text-slate-400">{m.assignedTo}</span></td>
                                    <td className="p-5 text-sm">{m.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva'}</td>
                                    <td className="p-5 text-sm">{new Date(m.date).toLocaleDateString()}</td>
                                    <td className="p-5"><StatusBadge status={m.status}/></td>
                                    <td className="p-5 text-right"><MoreHorizontal className="ml-auto text-slate-400 cursor-pointer hover:text-indigo-600"/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODALS --- */}
            
            {/* NEW RESERVATION MODAL */}
            {isReservationModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Nova Reserva</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" placeholder="Área (Salão, Churrasqueira...)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newRes.area || ''} onChange={e => setNewRes({...newRes, area: e.target.value})} />
                            <input type="text" placeholder="Morador / Unidade" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newRes.resident || ''} onChange={e => setNewRes({...newRes, resident: e.target.value})} />
                            <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newRes.date || ''} onChange={e => setNewRes({...newRes, date: e.target.value})} />
                            <div className="flex gap-2">
                                <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newRes.startTime || ''} onChange={e => setNewRes({...newRes, startTime: e.target.value})} />
                                <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newRes.endTime || ''} onChange={e => setNewRes({...newRes, endTime: e.target.value})} />
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setIsReservationModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                            <button onClick={handleAddReservation} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW INCIDENT MODAL */}
            {isIncidentModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Reportar Ocorrência</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" placeholder="Título do problema" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newInc.title || ''} onChange={e => setNewInc({...newInc, title: e.target.value})} />
                            <input type="text" placeholder="Local" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newInc.location || ''} onChange={e => setNewInc({...newInc, location: e.target.value})} />
                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer" value={newInc.priority} onChange={e => setNewInc({...newInc, priority: e.target.value as any})}>
                                <option value="LOW">Baixa Prioridade</option>
                                <option value="MEDIUM">Média Prioridade</option>
                                <option value="HIGH">Alta Prioridade</option>
                            </select>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setIsIncidentModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                            <button onClick={handleAddIncident} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm">Reportar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW VISITOR MODAL */}
            {isVisitorModalOpen && (
                 <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                     <div className="p-5 border-b border-slate-100 bg-slate-50">
                         <h3 className="font-bold text-lg text-slate-800">Registrar Entrada</h3>
                     </div>
                     <div className="p-6 space-y-4">
                         <input type="text" placeholder="Nome do Visitante" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newVis.name || ''} onChange={e => setNewVis({...newVis, name: e.target.value})} />
                         <input type="text" placeholder="Documento (RG/CPF)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newVis.document || ''} onChange={e => setNewVis({...newVis, document: e.target.value})} />
                         <input type="text" placeholder="Unidade de Destino" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" value={newVis.destinationUnit || ''} onChange={e => setNewVis({...newVis, destinationUnit: e.target.value})} />
                         <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer" value={newVis.type} onChange={e => setNewVis({...newVis, type: e.target.value as any})}>
                             <option value="VISITOR">Visitante</option>
                             <option value="DELIVERY">Entregador</option>
                             <option value="SERVICE">Prestador de Serviço</option>
                         </select>
                     </div>
                     <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                         <button onClick={() => setIsVisitorModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                         <button onClick={handleAddVisitor} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm">Registrar</button>
                     </div>
                 </div>
             </div>
            )}
        </div>
    );
};

export default Operations;
