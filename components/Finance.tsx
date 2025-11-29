
import React, { useState } from 'react';
import { MOCK_BILLS } from '../constants';
import { FinancialRecord, Bill } from '../types';
import { 
    Download, Filter, Plus, MoreHorizontal, Users, RefreshCw, 
    TrendingUp, TrendingDown, DollarSign, Wallet, FileText, 
    CheckCircle, Clock, AlertCircle, Printer, Search, ArrowUpRight, ArrowDownRight, X,
    Calendar, PieChart, FileSpreadsheet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FinanceProps {
  transactions: FinancialRecord[];
  onUpdateTransactions: (transactions: FinancialRecord[]) => void;
}

const Finance: React.FC<FinanceProps> = ({ transactions, onUpdateTransactions }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'BILLING'>('DASHBOARD');
  // transactions state is now managed by parent
  const [bills, setBills] = useState<Bill[]>(MOCK_BILLS);
  const [isGenerating, setIsGenerating] = useState(false);

  // SEARCH & FILTER STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
      type: 'ALL',
      category: 'ALL',
      status: 'ALL',
      startDate: '',
      endDate: ''
  });

  // REPORT MODAL STATE
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({
      type: 'CASH_FLOW',
      period: 'THIS_MONTH',
      format: 'PDF'
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // NEW TRANSACTION MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<FinancialRecord>>({
      type: 'INCOME',
      status: 'PAID',
      date: new Date().toISOString().slice(0, 10),
      category: 'Geral'
  });

  // --- STATS CALCULATION ---
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const overdueAmount = bills.filter(b => b.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0);
  const projectedIncome = bills.filter(b => b.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = [
      { name: 'Receitas', value: totalIncome, color: '#10b981' },
      { name: 'Despesas', value: totalExpense, color: '#ef4444' },
      { name: 'Pendente', value: projectedIncome, color: '#f59e0b' }
  ];

  // --- FILTER LOGIC ---
  const filteredTransactions = transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filters.type === 'ALL' || t.type === filters.type;
      const matchesCategory = filters.category === 'ALL' || t.category === filters.category;
      const matchesStatus = filters.status === 'ALL' || t.status === filters.status;
      
      let matchesDate = true;
      if (filters.startDate) matchesDate = matchesDate && new Date(t.date) >= new Date(filters.startDate);
      if (filters.endDate) matchesDate = matchesDate && new Date(t.date) <= new Date(filters.endDate);

      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesDate;
  });

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));

  // --- HANDLERS ---
  const handleGenerateBills = () => {
      setIsGenerating(true);
      setTimeout(() => {
          setIsGenerating(false);
          alert('142 Boletos gerados com sucesso e enviados por e-mail!');
      }, 2000);
  };

  const handleCreateTransaction = () => {
      if (!newTransaction.description || !newTransaction.amount) return;
      const record: FinancialRecord = {
          id: `tr_${Date.now()}`,
          description: newTransaction.description,
          amount: Number(newTransaction.amount),
          type: newTransaction.type || 'INCOME',
          status: newTransaction.status || 'PENDING',
          date: newTransaction.date || new Date().toISOString(),
          category: newTransaction.category || 'Geral',
          dueDate: newTransaction.dueDate
      };
      onUpdateTransactions([record, ...transactions]);
      setIsModalOpen(false);
      setNewTransaction({ type: 'INCOME', status: 'PAID', date: new Date().toISOString().slice(0, 10), category: 'Geral' });
  };

  const handleGenerateReport = () => {
      setIsGeneratingReport(true);
      setTimeout(() => {
          setIsGeneratingReport(false);
          setIsReportModalOpen(false);
          alert(`Relatório ${reportConfig.type} (${reportConfig.format}) gerado com sucesso!`);
      }, 2000);
  };

  const StatusBadge = ({ status }: { status: string }) => {
      const config = {
          PAID: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pago' },
          PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendente' },
          OVERDUE: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Atrasado' }
      };
      const c = config[status as keyof typeof config] || config.PENDING;
      return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão Financeira</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Controle de caixa, receitas, despesas e emissão de boletos.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
             {[
                 { id: 'DASHBOARD', label: 'Visão Geral', icon: TrendingUp },
                 { id: 'TRANSACTIONS', label: 'Lançamentos', icon: FileText },
                 { id: 'BILLING', label: 'Cobranças', icon: Users }
             ].map(tab => (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                 >
                     <tab.icon size={16}/> {tab.label}
                 </button>
             ))}
        </div>
      </div>

      {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-fade-in">
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Saldo em Caixa</p>
                      <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                          <ArrowUpRight size={14}/> +12% vs mês anterior
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Receitas (Mês)</p>
                      <h3 className="text-2xl font-bold text-emerald-600">R$ {totalIncome.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                      <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Despesas (Mês)</p>
                      <h3 className="text-2xl font-bold text-rose-600">R$ {totalExpense.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                      <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: '45%' }}></div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Inadimplência</p>
                      <h3 className="text-2xl font-bold text-amber-600">R$ {overdueAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                      <div className="mt-4 text-xs text-slate-500">3 Unidades em atraso</div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* CHART */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">Fluxo Financeiro</h3>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} />
                                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30}>
                                      {chartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Ações Rápidas</h3>
                      <div className="space-y-3">
                          <button onClick={() => { setActiveTab('TRANSACTIONS'); setIsModalOpen(true); }} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Plus size={18}/></div>
                                  <span className="font-bold text-slate-700 text-sm">Registrar Lançamento</span>
                              </div>
                              <ArrowUpRight size={16} className="text-slate-400"/>
                          </button>
                          <button onClick={handleGenerateBills} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><RefreshCw size={18}/></div>
                                  <span className="font-bold text-slate-700 text-sm">Gerar Boletos</span>
                              </div>
                              <ArrowUpRight size={16} className="text-slate-400"/>
                          </button>
                          <button onClick={() => setIsReportModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all group">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors"><Printer size={18}/></div>
                                  <span className="font-bold text-slate-700 text-sm">Ver Relatórios</span>
                              </div>
                              <Download size={16} className="text-slate-400"/>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'TRANSACTIONS' && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden animate-fade-in">
             <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                 <div className="relative w-full md:w-auto">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                        type="text" 
                        placeholder="Buscar lançamento..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 transition-all placeholder-slate-400" 
                     />
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                     <button 
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all ${showFilterPanel ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter size={14}/> Filtros
                    </button>
                     <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"><Plus size={14}/> Novo</button>
                 </div>
             </div>

             {/* ADVANCED FILTERS PANEL */}
             {showFilterPanel && (
                 <div className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
                         <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                             <option value="ALL">Todos</option>
                             <option value="INCOME">Receitas</option>
                             <option value="EXPENSE">Despesas</option>
                         </select>
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Categoria</label>
                         <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                             <option value="ALL">Todas</option>
                             {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                         <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                             <option value="ALL">Todos</option>
                             <option value="PAID">Pago</option>
                             <option value="PENDING">Pendente</option>
                             <option value="OVERDUE">Atrasado</option>
                         </select>
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Período</label>
                         <div className="flex gap-2">
                             <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"/>
                             <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"/>
                         </div>
                     </div>
                 </div>
             )}

             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Vencimento</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length > 0 ? filteredTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {item.type === 'INCOME' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{item.description}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-medium text-slate-600">{item.category}</td>
                      <td className="p-5 text-sm font-medium text-slate-600">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                      <td className={`p-5 text-sm font-bold ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.type === 'INCOME' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-5"><StatusBadge status={item.status} /></td>
                      <td className="p-5 text-right">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                      <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">Nenhum lançamento encontrado com os filtros atuais.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {activeTab === 'BILLING' && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800">Central de Cobranças</h3>
                      <p className="text-xs text-slate-500">Gerencie mensalidades e gere boletos para os moradores.</p>
                  </div>
                  <button 
                    onClick={handleGenerateBills}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-wait"
                  >
                      {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <RefreshCw size={18}/>}
                      {isGenerating ? 'Processando...' : 'Gerar Boletos do Mês'}
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Unidade / Sacado</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Mês Ref.</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Vencimento</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Valor</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {bills.map(bill => (
                              <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-5">
                                      <p className="text-sm font-bold text-slate-800">{bill.unit}</p>
                                      <p className="text-xs text-slate-500">{bill.userName}</p>
                                  </td>
                                  <td className="p-5 text-sm font-mono text-slate-600">{bill.month}</td>
                                  <td className="p-5 text-sm font-medium text-slate-600">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                  <td className="p-5 text-sm font-bold text-slate-700">R$ {bill.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                  <td className="p-5"><StatusBadge status={bill.status} /></td>
                                  <td className="p-5 text-right flex justify-end gap-2">
                                      <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg tooltip" title="Imprimir Boleto"><Printer size={18}/></button>
                                      <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg tooltip" title="Confirmar Pagamento"><CheckCircle size={18}/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* CREATE TRANSACTION MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800">Novo Lançamento</h3>
                      <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipo de Operação</label>
                          <div className="flex bg-slate-100 p-1 rounded-xl">
                              <button 
                                onClick={() => setNewTransaction({...newTransaction, type: 'INCOME'})}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTransaction.type === 'INCOME' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                              >Receita</button>
                              <button 
                                onClick={() => setNewTransaction({...newTransaction, type: 'EXPENSE'})}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTransaction.type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                              >Despesa</button>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descrição</label>
                          <input type="text" value={newTransaction.description || ''} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" placeholder="Ex: Manutenção Jardim"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Valor (R$)</label>
                              <input type="number" value={newTransaction.amount || ''} onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" placeholder="0,00"/>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data</label>
                              <input type="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"/>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Categoria</label>
                          <select value={newTransaction.category} onChange={e => setNewTransaction({...newTransaction, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                              <option value="Geral">Geral</option>
                              <option value="Manutenção">Manutenção</option>
                              <option value="Serviços">Serviços</option>
                              <option value="Mensalidade">Mensalidade</option>
                              <option value="Reservas">Reservas</option>
                              <option value="Utilidades">Utilidades (Luz/Água)</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                          <select value={newTransaction.status} onChange={e => setNewTransaction({...newTransaction, status: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                              <option value="PAID">Pago / Recebido</option>
                              <option value="PENDING">Pendente</option>
                          </select>
                      </div>
                  </div>
                  <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                      <button onClick={handleCreateTransaction} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm">Salvar Lançamento</button>
                  </div>
              </div>
          </div>
      )}

      {/* REPORT GENERATION MODAL */}
      {isReportModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          <Printer size={20} className="text-indigo-600"/> Relatórios Personalizados
                      </h3>
                      <button onClick={() => setIsReportModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <div className="p-6 space-y-6">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipo de Relatório</label>
                          <div className="space-y-2">
                              {/* Buttons remain same layout */}
                              <button 
                                onClick={() => setReportConfig({...reportConfig, type: 'CASH_FLOW'})}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${reportConfig.type === 'CASH_FLOW' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                              >
                                  <div className={`p-2 rounded-lg ${reportConfig.type === 'CASH_FLOW' ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}><TrendingUp size={18}/></div>
                                  <div className="text-left">
                                      <p className="font-bold text-slate-700 text-sm">Fluxo de Caixa</p>
                                      <p className="text-xs text-slate-500">Receitas, despesas e saldo do período.</p>
                                  </div>
                              </button>
                              <button 
                                onClick={() => setReportConfig({...reportConfig, type: 'DELINQUENCY'})}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${reportConfig.type === 'DELINQUENCY' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                              >
                                  <div className={`p-2 rounded-lg ${reportConfig.type === 'DELINQUENCY' ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}><AlertCircle size={18}/></div>
                                  <div className="text-left">
                                      <p className="font-bold text-slate-700 text-sm">Relatório de Inadimplência</p>
                                      <p className="text-xs text-slate-500">Lista de unidades e valores em atraso.</p>
                                  </div>
                              </button>
                              <button 
                                onClick={() => setReportConfig({...reportConfig, type: 'CATEGORIES'})}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${reportConfig.type === 'CATEGORIES' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                              >
                                  <div className={`p-2 rounded-lg ${reportConfig.type === 'CATEGORIES' ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}><PieChart size={18}/></div>
                                  <div className="text-left">
                                      <p className="font-bold text-slate-700 text-sm">Despesas por Categoria</p>
                                      <p className="text-xs text-slate-500">Detalhamento de gastos por setor.</p>
                                  </div>
                              </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Período</label>
                              <select value={reportConfig.period} onChange={(e) => setReportConfig({...reportConfig, period: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                                  <option value="THIS_MONTH">Este Mês</option>
                                  <option value="LAST_MONTH">Mês Passado</option>
                                  <option value="THIS_YEAR">Este Ano</option>
                                  <option value="ALL">Todo o Período</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Formato</label>
                              <select value={reportConfig.format} onChange={(e) => setReportConfig({...reportConfig, format: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                                  <option value="PDF">Arquivo PDF</option>
                                  <option value="EXCEL">Planilha Excel</option>
                                  <option value="CSV">Arquivo CSV</option>
                              </select>
                          </div>
                      </div>
                  </div>
                  <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setIsReportModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancelar</button>
                      <button 
                        onClick={handleGenerateReport} 
                        disabled={isGeneratingReport}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                          {isGeneratingReport ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16}/>}
                          {isGeneratingReport ? 'Gerando...' : 'Baixar Relatório'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Finance;
