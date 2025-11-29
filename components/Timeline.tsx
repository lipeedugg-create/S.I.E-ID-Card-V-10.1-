
import React, { useState } from 'react';
import { MOCK_AGENDA } from '../constants';
import { AgendaEvent } from '../types';
import { 
    Calendar as CalendarIcon, Clock, MapPin, Plus, CheckCircle, 
    AlertTriangle, Users, FileText, ChevronRight, X, Bell,
    ChevronLeft, List
} from 'lucide-react';

const Timeline: React.FC = () => {
  const [events, setEvents] = useState<AgendaEvent[]>(MOCK_AGENDA);
  const [view, setView] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState<'MONTH' | 'WEEK'>('MONTH');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<AgendaEvent>>({ type: 'MEETING', status: 'UPCOMING', date: new Date().toISOString().slice(0, 16), reminder: 'NONE' });

  const getEventIcon = (type: AgendaEvent['type']) => {
      switch(type) {
          case 'MEETING': return <Users size={14} className="text-indigo-600"/>;
          case 'MAINTENANCE': return <AlertTriangle size={14} className="text-amber-600"/>;
          case 'DEADLINE': return <Clock size={14} className="text-rose-600"/>;
          default: return <FileText size={14} className="text-emerald-600"/>;
      }
  };

  const getEventColor = (type: AgendaEvent['type']) => {
      switch(type) {
          case 'MEETING': return 'bg-indigo-50 border-indigo-100 hover:border-indigo-200 text-indigo-700';
          case 'MAINTENANCE': return 'bg-amber-50 border-amber-100 hover:border-amber-200 text-amber-700';
          case 'DEADLINE': return 'bg-rose-50 border-rose-100 hover:border-rose-200 text-rose-700';
          default: return 'bg-emerald-50 border-emerald-100 hover:border-emerald-200 text-emerald-700';
      }
  };

  const handleCreateEvent = () => {
      if (!newEvent.title || !newEvent.date) return;
      const event: AgendaEvent = {
          id: `evt_${Date.now()}`,
          title: newEvent.title!,
          description: newEvent.description || '',
          date: newEvent.date!,
          type: newEvent.type as any,
          status: 'UPCOMING',
          location: newEvent.location,
          createdBy: 'Administrador',
          reminder: newEvent.reminder
      };
      setEvents([...events, event].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setIsModalOpen(false);
      setNewEvent({ type: 'MEETING', status: 'UPCOMING', date: new Date().toISOString().slice(0, 16), reminder: 'NONE' });
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (calendarMode === 'MONTH') {
          newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
      } else {
          newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
      }
      setCurrentDate(newDate);
  };

  const getDaysArray = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const days = [];
      if (calendarMode === 'MONTH') {
          const firstDayOfMonth = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          for (let i = 0; i < firstDayOfMonth; i++) { days.push(null); }
          for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
      } else {
          const curr = new Date(currentDate);
          const first = curr.getDate() - curr.getDay(); 
          for (let i = 0; i < 7; i++) { const day = new Date(curr.setDate(first + i)); days.push(day); }
      }
      return days;
  };

  const renderCalendarCell = (date: Date | null) => {
      if (!date) return <div className="bg-slate-50/50 min-h-[100px] border-b border-r border-slate-100"></div>;
      const dateStr = date.toISOString().slice(0, 10);
      const dayEvents = events.filter(e => e.date.startsWith(dateStr));
      const isToday = new Date().toISOString().slice(0, 10) === dateStr;
      return (
          <div className={`min-h-[100px] p-2 border-b border-r border-slate-100 hover:bg-slate-50 transition-colors group relative ${isToday ? 'bg-indigo-50/30' : ''}`}>
              <div className="flex justify-between items-start mb-2"><span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>{date.getDate()}</span>{dayEvents.length > 0 && <span className="text-[10px] font-bold text-slate-400">{dayEvents.length}</span>}</div>
              <div className="space-y-1">{dayEvents.map(ev => (<div key={ev.id} className={`text-[10px] px-1.5 py-1 rounded border truncate font-bold ${getEventColor(ev.type)}`}>{ev.title}</div>))}</div>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div><h2 className="text-2xl font-bold text-slate-800">Agenda & Timeline</h2><p className="text-sm text-slate-500 mt-1 font-medium">Calendário de eventos, manutenções e prazos importantes.</p></div>
            <div className="flex gap-3">
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button onClick={() => setView('LIST')} className={`p-2 rounded-md transition-all ${view === 'LIST' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`} title="Lista"><List size={20}/></button>
                    <button onClick={() => setView('CALENDAR')} className={`p-2 rounded-md transition-all ${view === 'CALENDAR' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`} title="Calendário Gráfico"><CalendarIcon size={20}/></button>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"><Plus size={18}/> Novo Evento</button>
            </div>
        </div>

        {view === 'CALENDAR' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4"><button onClick={() => navigateCalendar('prev')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronLeft size={20}/></button><h3 className="text-xl font-bold text-slate-800 capitalize min-w-[200px] text-center">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3><button onClick={() => navigateCalendar('next')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronRight size={20}/></button></div>
                    <div className="flex bg-slate-100 p-1 rounded-lg"><button onClick={() => setCalendarMode('MONTH')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${calendarMode === 'MONTH' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Mês</button><button onClick={() => setCalendarMode('WEEK')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${calendarMode === 'WEEK' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Semana</button></div>
                </div>
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (<div key={day} className="p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>))}</div>
                <div className="grid grid-cols-7 bg-white">{getDaysArray().map((date, idx) => (<React.Fragment key={idx}>{renderCalendarCell(date)}</React.Fragment>))}</div>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><CalendarIcon size={20} className="text-indigo-600"/> Próximos Eventos</h3>
                        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pl-8 pb-4">
                            {events.map((event, idx) => (
                                <div key={event.id} className="relative group">
                                    <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-2 border-white shadow-md z-10 ${event.status === 'COMPLETED' ? 'bg-slate-300' : event.type === 'DEADLINE' ? 'bg-rose-500' : event.type === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                                    <div className={`p-5 rounded-xl border transition-all ${event.type === 'MEETING' ? 'bg-indigo-50 border-indigo-100' : event.type === 'MAINTENANCE' ? 'bg-amber-50 border-amber-100' : event.type === 'DEADLINE' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                        <div className="flex justify-between items-start mb-2"><div><span className="text-[10px] font-bold uppercase tracking-wide opacity-60 mb-1 block">{new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span><h4 className="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors flex items-center gap-2">{event.title}{event.reminder && event.reminder !== 'NONE' && (<span className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-black/5" title="Lembrete Ativo"><Bell size={10} /></span>)}</h4></div><div className="flex flex-col items-end"><span className="text-xs font-bold bg-white/50 px-2 py-1 rounded text-slate-600 border border-slate-100">{new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div></div><p className="text-sm text-slate-600 mb-4">{event.description}</p><div className="flex items-center gap-4 text-xs font-medium text-slate-500 border-t border-slate-200/50 pt-3"><span className="flex items-center gap-1.5">{getEventIcon(event.type)} {event.type}</span>{event.location && <span className="flex items-center gap-1.5"><MapPin size={14}/> {event.location}</span>}<span className="ml-auto flex items-center gap-1">Criado por: <span className="text-slate-700 font-bold">{event.createdBy}</span></span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                        <h3 className="text-xl font-bold mb-1">Resumo do Mês</h3>
                        <p className="text-slate-400 text-sm mb-6">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"><span className="text-sm font-medium flex items-center gap-2"><Users size={16} className="text-indigo-400"/> Reuniões</span><span className="font-bold">{events.filter(e => e.type === 'MEETING').length}</span></div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"><span className="text-sm font-medium flex items-center gap-2"><AlertTriangle size={16} className="text-amber-400"/> Manutenções</span><span className="font-bold">{events.filter(e => e.type === 'MAINTENANCE').length}</span></div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"><span className="text-sm font-medium flex items-center gap-2"><Clock size={16} className="text-rose-400"/> Prazos</span><span className="font-bold">{events.filter(e => e.type === 'DEADLINE').length}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-bold text-lg text-slate-800">Novo Evento</h3><button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button></div>
                    <div className="p-6 space-y-4">
                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título</label><input type="text" value={newEvent.title || ''} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"/></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data e Hora</label><input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"/></div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
                                <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                                    <option value="MEETING">Reunião / Assembleia</option>
                                    <option value="MAINTENANCE">Manutenção</option>
                                    <option value="EVENT">Evento Social</option>
                                    <option value="DEADLINE">Prazo / Vencimento</option>
                                </select>
                            </div>
                        </div>
                        {(newEvent.type === 'MEETING' || newEvent.type === 'EVENT') && (
                             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                 <label className="text-xs font-bold text-indigo-600 uppercase mb-1 block flex items-center gap-2"><Bell size={12} /> Configurar Notificação</label>
                                 <select value={newEvent.reminder || 'NONE'} onChange={e => setNewEvent({...newEvent, reminder: e.target.value as any})} className="w-full p-2.5 border border-indigo-200 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500">
                                     <option value="NONE">Sem lembrete automático</option>
                                     <option value="1_HOUR">1 hora antes</option>
                                     <option value="24_HOURS">1 dia antes</option>
                                 </select>
                                 <p className="text-[10px] text-indigo-400 mt-2">Uma notificação será disparada no app para todos os participantes.</p>
                             </div>
                        )}
                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Local</label><input type="text" value={newEvent.location || ''} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" placeholder="Ex: Salão de Festas"/></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descrição</label><textarea value={newEvent.description || ''} onChange={e => setNewEvent({...newEvent, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all resize-none"></textarea></div>
                    </div>
                    <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                        <button onClick={handleCreateEvent} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm">Salvar Evento</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Timeline;
