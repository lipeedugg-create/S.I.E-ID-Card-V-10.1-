import React, { useState } from 'react';
import { MOCK_UNITS } from '../constants';
import { UnitData } from '../types';
import { Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const SmartMap: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'DEBT' | 'WARNING' | 'OK'>('ALL');

  const filteredUnits = MOCK_UNITS.filter(u => filter === 'ALL' || u.status === filter);

  // Group by block for visualization
  const blocks = Array.from(new Set(MOCK_UNITS.map(u => u.block)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEBT': return 'bg-rose-500 hover:bg-rose-600 shadow-rose-200';
      case 'WARNING': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
      case 'OK': return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] gap-8 animate-fade-in">
      {/* Map Visualization Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-md border border-slate-200 p-8 overflow-hidden relative">
        <div className="absolute top-6 left-6 z-10 flex gap-2 bg-white/95 p-2 rounded-xl backdrop-blur-md shadow-lg border border-slate-100">
          <button onClick={() => setFilter('ALL')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Todos</button>
          <button onClick={() => setFilter('DEBT')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'DEBT' ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Inadimplentes</button>
          <button onClick={() => setFilter('WARNING')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Ocorrências</button>
        </div>

        <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 relative overflow-auto">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 p-12 max-w-5xl w-full z-0">
            {blocks.map(block => (
              <div key={block} className="relative bg-white p-6 rounded-2xl shadow-xl border-2 border-slate-100">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg border-4 border-slate-50">
                  Bloco {block}
                </div>
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {filteredUnits.filter(u => u.block === block).map(unit => (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className={`
                        aspect-square rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md transition-all transform hover:scale-105 hover:-translate-y-1
                        ${getStatusColor(unit.status)}
                        ${selectedUnit?.id === unit.id ? 'ring-4 ring-indigo-300 scale-110 -translate-y-1 z-10' : ''}
                      `}
                    >
                      {unit.number}
                    </button>
                  ))}
                </div>
                <div className="mt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t pt-4 border-slate-50">Entrada Principal</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-md border border-slate-200 p-8 flex flex-col">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Detalhes da Unidade</h3>
        
        {selectedUnit ? (
          <div className="flex-1 animate-fade-in">
            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${getStatusColor(selectedUnit.status)}`}>
                {selectedUnit.number}
              </div>
              <div>
                <h4 className="font-bold text-2xl text-slate-800">Bloco {selectedUnit.block}</h4>
                <p className="text-sm font-medium text-slate-500">{selectedUnit.residentName}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status Financeiro</p>
                <div className="flex items-center gap-2.5">
                  {selectedUnit.status === 'DEBT' ? (
                    <>
                      <XCircle className="text-rose-500" size={20} />
                      <span className="text-sm font-bold text-rose-700">Inadimplente (2 meses)</span>
                    </>
                  ) : selectedUnit.status === 'WARNING' ? (
                    <>
                      <AlertTriangle className="text-amber-500" size={20} />
                      <span className="text-sm font-bold text-amber-700">Atenção (Acordo)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="text-emerald-500" size={20} />
                      <span className="text-sm font-bold text-emerald-700">Em dia</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Veículos Cadastrados</p>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700 flex justify-between"><span>Honda Civic</span> <span className="text-slate-500 font-mono text-xs bg-white px-2 py-0.5 rounded border">ABC-1234</span></p>
                    <p className="text-sm font-medium text-slate-700 flex justify-between"><span>Toyota Corolla</span> <span className="text-slate-500 font-mono text-xs bg-white px-2 py-0.5 rounded border">XYZ-9876</span></p>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pets</p>
                <p className="text-sm font-medium text-slate-700">1 Cachorro (Pequeno porte)</p>
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 text-sm mt-6">
                Ver Histórico Completo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 m-2">
            <Info size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-medium max-w-[200px]">Selecione uma unidade no mapa para visualizar os detalhes completos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMap;