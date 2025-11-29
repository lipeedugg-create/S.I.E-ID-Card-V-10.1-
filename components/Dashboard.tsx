import React, { useState } from 'react';
import { MOCK_FINANCIALS, MOCK_INCIDENTS, MOCK_NOTICES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Users, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('SEMESTER');

  const totalIncome = MOCK_FINANCIALS.filter(f => f.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = MOCK_FINANCIALS.filter(f => f.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const openIncidents = MOCK_INCIDENTS.filter(i => i.status !== 'RESOLVED').length;

  // Função para gerar dados simulados baseados no filtro selecionado
  const getChartData = () => {
    switch (timeFilter) {
      case 'YEAR':
        return [
          { name: 'Jan', receita: 12000, despesa: 10000 },
          { name: 'Fev', receita: 12500, despesa: 11000 },
          { name: 'Mar', receita: 11800, despesa: 9500 },
          { name: 'Abr', receita: 13000, despesa: 12000 },
          { name: 'Mai', receita: 12500, despesa: 10500 },
          { name: 'Jun', receita: 14000, despesa: 11000 },
          { name: 'Jul', receita: 13500, despesa: 11500 },
          { name: 'Ago', receita: 14200, despesa: 10800 },
          { name: 'Set', receita: 13800, despesa: 11200 },
          { name: 'Out', receita: 15000, despesa: 12000 },
          { name: 'Nov', receita: 14500, despesa: 11000 },
          { name: 'Dez', receita: 16000, despesa: 13000 },
        ];
      case 'QUARTER':
        return [
          { name: 'Mês 1', receita: 13800, despesa: 11200 },
          { name: 'Mês 2', receita: 15000, despesa: 12000 },
          { name: 'Mês 3', receita: 14500, despesa: 11000 },
        ];
      case 'SEMESTER':
      default:
        return [
          { name: 'Jan', receita: 12000, despesa: 10000 },
          { name: 'Fev', receita: 12500, despesa: 11000 },
          { name: 'Mar', receita: 11800, despesa: 9500 },
          { name: 'Abr', receita: 13000, despesa: 12000 },
          { name: 'Mai', receita: 12500, despesa: 10500 },
          { name: 'Jun', receita: 14000, despesa: 11000 },
        ];
    }
  };

  const chartData = getChartData();

  const StatCard = ({ title, value, trend, icon: Icon, colorClass, borderClass }: any) => (
      <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 ${borderClass} hover:shadow-md transition-shadow`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
              <h3 className={`text-2xl md:text-3xl font-bold mt-2 ${colorClass}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '50').replace('900', '100')} ${colorClass}`}>
              <Icon size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 font-medium">{trend}</p>
      </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
            title="Saldo Atual" 
            value={`R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            trend="+2.5% em relação ao mês anterior"
            icon={balance >= 0 ? ArrowUpRight : ArrowDownRight}
            colorClass={balance >= 0 ? "text-emerald-600" : "text-rose-600"}
            borderClass="border-b-4 border-b-emerald-500"
        />
        <StatCard 
            title="Inadimplência" 
            value="4.2%"
            trend="3 unidades em atraso"
            icon={AlertTriangle}
            colorClass="text-rose-600"
            borderClass="border-b-4 border-b-rose-500"
        />
        <StatCard 
            title="Ocorrências" 
            value={openIncidents}
            trend="Abertas nos últimos 7 dias"
            icon={AlertTriangle}
            colorClass="text-amber-500"
            borderClass="border-b-4 border-b-amber-500"
        />
        <StatCard 
            title="Ocupação" 
            value="92%"
            trend="4 unidades vagas"
            icon={Users}
            colorClass="text-indigo-600"
            borderClass="border-b-4 border-b-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                Fluxo de Caixa
              </h3>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-sm font-bold rounded-lg px-3 py-2 text-slate-600 outline-none hover:border-indigo-300 transition-colors focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                    <option value="QUARTER">Último Trimestre</option>
                    <option value="SEMESTER">Semestral</option>
                    <option value="YEAR">Anual</option>
                </select>
              </div>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="receita" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Receita" barSize={20} />
                <Bar dataKey="despesa" fill="#e11d48" radius={[6, 6, 0, 0]} name="Despesa" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notices Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Mural de Avisos</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
            {MOCK_NOTICES.slice(0, 3).map((notice) => (
              <div key={notice.id} className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                    notice.urgency === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                    notice.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {notice.urgency === 'HIGH' ? 'URGENTE' : notice.urgency === 'MEDIUM' ? 'ATENÇÃO' : 'INFO'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(notice.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{notice.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-xl text-sm bg-slate-50 text-indigo-600 font-bold hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-slate-200">
            Ver todos os avisos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;