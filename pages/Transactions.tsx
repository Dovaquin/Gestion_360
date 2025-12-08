
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { Link, useNavigate } from 'react-router-dom';
import { TransactionType, Transaction } from '../types';

const Transactions: React.FC = () => {
  const { transactions } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SALE' | 'EXPENSE'>('ALL');

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to format time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group transactions by date logic
  const groupedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const filtered = sorted.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
                            t.amount.toString().includes(search);
      
      const matchesType = filterType === 'ALL' 
                          ? true 
                          : filterType === 'SALE' 
                            ? t.type === TransactionType.SALE 
                            : t.type === TransactionType.EXPENSE;

      return matchesSearch && matchesType;
    });

    const groups: Record<string, Transaction[]> = {};

    filtered.forEach(t => {
      const date = new Date(t.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let key = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

      // Check for Today/Yesterday
      if (date.toDateString() === today.toDateString()) {
        key = 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Ayer';
      }

      // Capitalize first letter
      key = key.charAt(0).toUpperCase() + key.slice(1);

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(t);
    });

    return groups;
  }, [transactions, search, filterType]);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white">
      {/* Mercado Pago Style Header */}
      <div className="bg-[#102216] sticky top-0 z-30 shadow-sm shadow-black/20">
        <div className="flex items-center p-4">
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="flex-1 ml-2">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xl">search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar en tu actividad" 
                        className="w-full bg-white/5 border-none rounded-full h-10 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:ring-1 focus:ring-primary focus:bg-white/10 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
        </div>
        
        {/* Quick Filters */}
        <div className="flex px-4 pb-3 gap-3 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
                    filterType === 'ALL' 
                    ? 'bg-white/20 text-white border-white/20' 
                    : 'bg-transparent text-white/60 border-white/10 hover:bg-white/10'
                }`}
            >
                Todo
            </button>
            <button 
                onClick={() => setFilterType('SALE')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
                    filterType === 'SALE' 
                    ? 'bg-[#13ec5b]/20 text-[#13ec5b] border-[#13ec5b]/30' 
                    : 'bg-transparent text-white/60 border-white/10 hover:bg-white/10'
                }`}
            >
                Ingresos
            </button>
            <button 
                onClick={() => setFilterType('EXPENSE')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
                    filterType === 'EXPENSE' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : 'bg-transparent text-white/60 border-white/10 hover:bg-white/10'
                }`}
            >
                Gastos
            </button>
        </div>
      </div>

      <main className="flex-1 px-4 pb-6">
        {Object.keys(groupedTransactions).length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">history_toggle_off</span>
                </div>
                <p className="text-sm font-medium">No hay movimientos encontrados</p>
            </div>
        ) : (
            Object.entries(groupedTransactions).map(([dateLabel, items]) => {
            const groupItems = items as Transaction[];
            return (
            <div key={dateLabel} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mt-6 mb-3 ml-1">
                    {dateLabel}
                </h3>
                <div className="flex flex-col bg-surface-dark rounded-2xl overflow-hidden border border-white/5">
                    {groupItems.map((t, index) => (
                        <div key={t.id} className={`flex items-center p-4 gap-3 active:bg-white/5 transition-colors cursor-pointer ${index !== groupItems.length - 1 ? 'border-b border-white/5' : ''}`}>
                            {/* Icon Container */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                t.type === TransactionType.SALE 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'bg-white/5 text-white/60'
                            }`}>
                                <span className="material-symbols-outlined text-[20px]">
                                    {t.type === TransactionType.SALE ? 'arrow_upward' : 'shopping_bag'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-semibold text-white truncate leading-tight">
                                    {t.description}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-xs text-white/50">{formatTime(t.date)}</p>
                                    <span className="w-0.5 h-0.5 rounded-full bg-white/30"></span>
                                    <p className="text-xs text-white/50 truncate">
                                        {t.type === TransactionType.SALE ? 'Venta' : 'Gasto'}
                                    </p>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="flex flex-col items-end shrink-0">
                                <p className={`text-sm font-bold ${
                                    t.type === TransactionType.SALE 
                                        ? 'text-[#13ec5b]' 
                                        : 'text-red-400'
                                }`}>
                                    {t.type === TransactionType.SALE ? '+ ' : '- '}
                                    {formatCurrency(t.amount)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            )})
        )}
      </main>
    </div>
  );
};

export default Transactions;
