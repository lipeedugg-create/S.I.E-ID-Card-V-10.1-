import React, { useState, useEffect } from 'react';
import { FinancialRecord, Bill } from '../types';
import { financialService, billingService } from '../services/api';
import { 
    Download, Filter, Plus, MoreHorizontal, Users, RefreshCw, 
    TrendingUp, TrendingDown, FileText, 
    CheckCircle, Printer, Search, ArrowUpRight, X,
    Calendar, PieChart, AlertCircle, CreditCard
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FinanceProps {
  transactions: FinancialRecord[];
  onUpdateTransactions: (transactions: FinancialRecord[]) => void;
}

const Finance: React.FC<FinanceProps> = ({ transactions, onUpdateTransactions }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'BILLING'>('DASHBOARD');
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // MODAL STATES
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<FinancialRecord>>({
      type: 'INCOME',
      status: 'PAID',
      date: new Date().toISOString().slice(0, 10),
      category: 'Geral'
  });

  // --- CARREGAMENTO DE DADOS REAIS ---
  useEffect(() => {
      const loadData = async () => {
          setIsLoading(true);
          try {
              // Carrega transações reais do backend
              const res = await financialService.getAll();
              onUpdateTransactions(res.data);
              
              if (activeTab === 'BILLING') {
                  const billsRes = await billingService.getBills();
                  setBills(billsRes.data);
              }
          } catch (error) {
              console.error("Erro ao carregar financeiro", error);
          } finally {
              setIsLoading(false);
          }
      };
      
      // Carregar apenas se a lista estiver vazia (primeira carga) ou mudou de aba
      if (transactions.length === 0 || activeTab === 'BILLING') {
          loadData();
      }
  }, [activeTab]);

  // --- ESTATÍSTICAS ---
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIncome - totalExpense;
  const overdueAmount = bills.filter(b => b.status === 'OVERDUE').reduce((acc, curr) => acc + Number(curr.amount), 0);

  const chartData = [
      { name: 'Receitas', value: totalIncome, color: '#10b981' },
      { name: 'Despesas', value: totalExpense, color: '#ef4444' },
      { name: 'Saldo', value: balance, color: balance >= 0 ? '#3b82f6' : '#f43f5e' }
  ];

  // --- LÓGICA DE FILTRO ---
  const filteredTransactions = transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filters.type === 'ALL' || t.type === filters.type;
      const matchesCategory = filters.category === 'ALL' || t.category === filters.category;
      const matchesStatus = filters.status === 'ALL' || t.status === filters.status;
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));

  // --- AÇÕES COM API ---
  const handleCreateTransaction = async () => {
      if (!newTransaction.description || !newTransaction.amount) return;
      
      try {
          // Salva no banco de dados
          const res = await financialService.create(newTransaction);
          const savedRecord = res.data;
          
          onUpdateTransactions([savedRecord, ...transactions]);
          setIsModalOpen(false);
          setNewTransaction({ type: 'INCOME', status: 'PAID', date: new Date().toISOString().slice(0, 10), category: 'Geral' });
      } catch (error) {
          alert('Erro ao salvar transação. Tente novamente.');
      }
  };

  const handleGenerateBills = async () => {
      if (!confirm('Deseja gerar boletos para todos os moradores ativos?')) return;
      setIsGenerating(true);
      try {
          const today = new Date();
          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 10);
          const monthRef = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
          
          await billingService.generateBills(monthRef, nextMonth.toISOString().slice(0, 10));
          
          const billsRes = await billingService.getBills();
          setBills(billsRes.data);
          alert('Boletos gerados com sucesso!');
      } catch (error) {
          alert('Erro ao gerar boletos');
      } finally {
          setIsGenerating(false);
      }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão Financeira</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Fluxo de caixa real e controle orçamentário.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
             {[{ id: 'DASHBOARD', label: 'Visão Geral', icon: TrendingUp }, { id: 'TRANSACTIONS', label: 'Lançamentos', icon: FileText }, { id: 'BILLING', label: 'Cobranças', icon: CreditCard }].map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                     <tab.icon size={16}/> {tab.label}
                 </button>
             ))}
        </div>
      </div>

      {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Cards de Resumo */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Saldo em Caixa</p>
                      <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Receitas (Total)</p>
                      <h3 className="text-2xl font-bold text-emerald-600">R$ {totalIncome.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Despesas (Total)</p>
                      <h3 className="text-2xl font-bold text-rose-600">R$ {totalExpense.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Inadimplência</p>
                      <h3 className="text-2xl font-bold text-amber-600">R$ {overdueAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">Análise Gráfica</h3>
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

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Ações</h3>
                      <button onClick={() => { setActiveTab('TRANSACTIONS'); setIsModalOpen(true); }} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group mb-3">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Plus size={18}/></div>
                              <span className="font-bold text-slate-700 text-sm">Novo Lançamento</span>
                          </div>
                          <ArrowUpRight size={16} className="text-slate-400"/>
                      </button>
                      <button onClick={() => { setActiveTab('BILLING'); }} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group mb-3">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CreditCard size={18}/></div>
                              <span className="font-bold text-slate-700 text-sm">Gerar Boletos</span>
                          </div>
                          <ArrowUpRight size={16} className="text-slate-400"/>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'TRANSACTIONS' && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden animate-fade-in">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
                 </div>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg"><Plus size={14}/> Novo</button>
             </div>

             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Descrição</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Categoria</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Data</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Valor</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {item.type === 'INCOME' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                            </div>
                            <span className="text-sm font-bold text-slate-800">{item.description}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-medium text-slate-600">{item.category}</td>
                      <td className="p-5 text-sm font-medium text-slate-600">{new Date(item.date).toLocaleDateString()}</td>
                      <td className={`p-5 text-sm font-bold ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.type === 'INCOME' ? '+' : '-'} R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-5"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum lançamento.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {activeTab === 'BILLING' && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Boletos Emitidos</h3>
                  <button onClick={handleGenerateBills} disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg disabled:opacity-50">
                      {isGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Plus size={14}/>} Gerar em Massa
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Morador</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Vencimento</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Valor</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
                              <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {bills.map(bill => (
                              <tr key={bill.id} className="hover:bg-slate-50">
                                  <td className="p-5 text-sm font-bold text-slate-800">{bill.userName} <span className="text-slate-400 font-normal ml-1">({bill.unit})</span></td>
                                  <td className="p-5 text-sm font-medium text-slate-600">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                  <td className="p-5 text-sm font-bold text-emerald-600">R$ {Number(bill.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                  <td className="p-5"><StatusBadge status={bill.status} /></td>
                                  <td className="p-5 text-right">
                                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg tooltip" title="Imprimir"><Printer size={16}/></button>
                                  </td>
                              </tr>
                          ))}
                          {bills.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum boleto gerado.</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-lg text-slate-800">Novo Lançamento</h3>
                      <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button onClick={() => setNewTransaction({...newTransaction, type: 'INCOME'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTransaction.type === 'INCOME' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>Receita</button>
                          <button onClick={() => setNewTransaction({...newTransaction, type: 'EXPENSE'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTransaction.type === 'EXPENSE' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>Despesa</button>
                      </div>
                      <input type="text" placeholder="Descrição" value={newTransaction.description || ''} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"/>
                      <input type="number" placeholder="Valor (R$)" value={newTransaction.amount || ''} onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"/>
                      <input type="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl">Cancelar</button>
                      <button onClick={handleCreateTransaction} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">Salvar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Finance;