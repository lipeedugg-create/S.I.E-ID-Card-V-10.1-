
import React, { useState } from 'react';
import { MOCK_SURVEYS } from '../constants';
import { Survey, SurveyQuestion } from '../types';
import { 
    ClipboardList, Plus, BarChart2, Share2, Users, Calendar, 
    CheckCircle, ExternalLink, Copy, PieChart, Activity, X, Trash2
} from 'lucide-react';

interface SurveyCardProps {
    survey: Survey;
    onViewResults: (survey: Survey) => void;
    onShareLink: (link?: string) => void;
    onDelete: (id: string) => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onViewResults, onShareLink, onDelete }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full group relative">
        <button onClick={() => onDelete(survey.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors p-1"><Trash2 size={16}/></button>
        <div className="flex justify-between items-start mb-4 pr-6">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                survey.type === 'CENSUS' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                survey.type === 'VOTING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
                {survey.type === 'CENSUS' ? 'Censo Demográfico' : survey.type === 'VOTING' ? 'Votação Oficial' : 'Pesquisa'}
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-bold ${survey.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full ${survey.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                {survey.status === 'ACTIVE' ? 'Em andamento' : 'Encerrado'}
            </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{survey.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{survey.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-6">
            <div className="flex items-center gap-1.5"><Users size={14}/> {survey.responseCount} Respostas</div>
            <div className="flex items-center gap-1.5"><Calendar size={14}/> Até {new Date(survey.endDate).toLocaleDateString()}</div>
        </div>

        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
            <button onClick={() => onViewResults(survey)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors">
                <BarChart2 size={16}/> Resultados
            </button>
            {survey.externalAccess && (
                <button onClick={() => onShareLink(survey.externalLink)} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors tooltip" title="Copiar Link Externo">
                    <Share2 size={16}/>
                </button>
            )}
        </div>
    </div>
);

const Surveys: React.FC = () => {
    const [surveys, setSurveys] = useState<Survey[]>(MOCK_SURVEYS);
    const [activeView, setActiveView] = useState<'LIST' | 'RESULTS'>('LIST');
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

    // CREATE MODAL STATE
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSurvey, setNewSurvey] = useState<Partial<Survey>>({
        type: 'SATISFACTION',
        status: 'DRAFT',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        questions: []
    });
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionType, setNewQuestionType] = useState<SurveyQuestion['type']>('choice');

    const handleViewResults = (survey: Survey) => {
        setSelectedSurvey(survey);
        setActiveView('RESULTS');
    };

    const handleShareLink = (link?: string) => {
        if (!link) return;
        navigator.clipboard.writeText(link);
        alert('Link copiado para a área de transferência! Envie para os moradores.');
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta pesquisa?')) {
            setSurveys(surveys.filter(s => s.id !== id));
        }
    };

    const addQuestion = () => {
        if (!newQuestionText) return;
        const q: SurveyQuestion = {
            id: `q_${Date.now()}`,
            text: newQuestionText,
            type: newQuestionType,
            options: newQuestionType === 'choice' || newQuestionType === 'multiple' ? ['Opção 1', 'Opção 2', 'Opção 3'] : undefined
        };
        setNewSurvey({ ...newSurvey, questions: [...(newSurvey.questions || []), q] });
        setNewQuestionText('');
    };

    const removeQuestion = (idx: number) => {
        const qs = [...(newSurvey.questions || [])];
        qs.splice(idx, 1);
        setNewSurvey({ ...newSurvey, questions: qs });
    };

    const handleCreateSurvey = () => {
        if (!newSurvey.title) { alert('Título é obrigatório'); return; }
        const created: Survey = {
            id: `srv_${Date.now()}`,
            title: newSurvey.title!,
            description: newSurvey.description || '',
            type: newSurvey.type || 'SATISFACTION',
            status: 'ACTIVE',
            startDate: newSurvey.startDate!,
            endDate: newSurvey.endDate!,
            questions: newSurvey.questions || [],
            responseCount: 0,
            externalAccess: !!newSurvey.externalAccess,
            externalLink: `https://viverbem.org.br/p/${Date.now()}`
        };
        setSurveys([...surveys, created]);
        setIsCreateOpen(false);
        setNewSurvey({ type: 'SATISFACTION', status: 'DRAFT', startDate: '', endDate: '', questions: [] });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {activeView === 'LIST' && (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Pesquisas & Censo</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Coleta de dados, votações e censo demográfico com acesso externo.</p>
                        </div>
                        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                            <Plus size={18}/> Nova Pesquisa
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {surveys.map(s => (
                            <SurveyCard 
                                key={s.id} 
                                survey={s} 
                                onViewResults={handleViewResults}
                                onShareLink={handleShareLink}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </>
            )}

            {activeView === 'RESULTS' && selectedSurvey && (
                <div className="animate-fade-in">
                    <button onClick={() => setActiveView('LIST')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                        ← Voltar para lista
                    </button>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedSurvey.title}</h2>
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase">{selectedSurvey.status === 'ACTIVE' ? 'Ativa' : 'Encerrada'}</span>
                                </div>
                                <p className="text-slate-500 max-w-2xl">{selectedSurvey.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-indigo-600">{selectedSurvey.responseCount}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Participações</p>
                                </div>
                                {selectedSurvey.externalAccess && (
                                    <button onClick={() => handleShareLink(selectedSurvey.externalLink)} className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                                        <ExternalLink size={14}/> Link Público: {selectedSurvey.externalLink?.replace('https://', '')} <Copy size={12}/>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                             {selectedSurvey.questions.map((q, idx) => (
                                 <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                     <h4 className="font-bold text-slate-800 mb-6 flex gap-3">
                                         <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0">{idx + 1}</span>
                                         {q.text}
                                     </h4>
                                     
                                     {q.type === 'choice' || q.type === 'rating' ? (
                                         <div className="space-y-4">
                                             {/* Mock Visualization of Results */}
                                             {(q.options || ['Excelente', 'Bom', 'Regular', 'Ruim']).map((opt, i) => {
                                                 const mockPercent = Math.floor(Math.random() * 80) + 5; 
                                                 return (
                                                     <div key={i} className="space-y-1">
                                                         <div className="flex justify-between text-xs font-bold text-slate-600">
                                                             <span>{opt}</span>
                                                             <span>{mockPercent}%</span>
                                                         </div>
                                                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                             <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${mockPercent}%`, opacity: 1 - (i * 0.15) }}></div>
                                                         </div>
                                                     </div>
                                                 )
                                             })}
                                         </div>
                                     ) : (
                                         <div className="h-40 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-sm italic border border-dashed border-slate-200">
                                             Respostas em texto (Nuvem de palavras indisponível na prévia)
                                         </div>
                                     )}
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {isCreateOpen && (
                 <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                     <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                         <h3 className="font-bold text-lg text-slate-800">Nova Pesquisa / Censo</h3>
                         <button onClick={() => setIsCreateOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
                     </div>
                     <div className="p-6 overflow-y-auto flex-1 space-y-5">
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipo</label>
                             <div className="flex gap-2">
                                 {['SATISFACTION', 'VOTING', 'CENSUS'].map(type => (
                                     <button 
                                        key={type}
                                        onClick={() => setNewSurvey({...newSurvey, type: type as any})}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${newSurvey.type === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-500'}`}
                                     >
                                         {type === 'SATISFACTION' ? 'Pesquisa' : type === 'VOTING' ? 'Votação' : 'Censo'}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título</label>
                             <input type="text" value={newSurvey.title || ''} onChange={e => setNewSurvey({...newSurvey, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" placeholder="Ex: Censo 2024"/>
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descrição</label>
                             <textarea rows={2} value={newSurvey.description || ''} onChange={e => setNewSurvey({...newSurvey, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder-slate-400"/>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data Início</label>
                                 <input type="date" value={newSurvey.startDate} onChange={e => setNewSurvey({...newSurvey, startDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"/>
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data Fim</label>
                                 <input type="date" value={newSurvey.endDate} onChange={e => setNewSurvey({...newSurvey, endDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"/>
                             </div>
                         </div>
                         
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                 <label className="text-xs font-bold text-slate-500 uppercase">Perguntas ({newSurvey.questions?.length})</label>
                             </div>
                             <div className="space-y-3 mb-4">
                                 {newSurvey.questions?.map((q, i) => (
                                     <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                                         <span className="text-sm font-medium text-slate-700 truncate">{i+1}. {q.text}</span>
                                         <button onClick={() => removeQuestion(i)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
                                     </div>
                                 ))}
                             </div>
                             <div className="flex gap-2">
                                 <input type="text" value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} placeholder="Nova pergunta..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500 transition-all"/>
                                 <select value={newQuestionType} onChange={e => setNewQuestionType(e.target.value as any)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                     <option value="choice">Múltipla Escolha</option>
                                     <option value="text">Texto</option>
                                     <option value="rating">Avaliação (1-5)</option>
                                 </select>
                                 <button onClick={addQuestion} className="p-2 bg-indigo-600 text-white rounded-lg"><Plus size={20}/></button>
                             </div>
                         </div>

                         <div className="flex items-center gap-2">
                             <input type="checkbox" checked={!!newSurvey.externalAccess} onChange={e => setNewSurvey({...newSurvey, externalAccess: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded"/>
                             <span className="text-sm font-medium text-slate-700">Permitir acesso externo (Link Público)</span>
                         </div>
                     </div>
                     <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                         <button onClick={() => setIsCreateOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                         <button onClick={handleCreateSurvey} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm">Criar Pesquisa</button>
                     </div>
                 </div>
             </div>
            )}
        </div>
    );
};

export default Surveys;
