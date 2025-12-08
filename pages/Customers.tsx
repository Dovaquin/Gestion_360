
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { Link } from 'react-router-dom';

const Customers: React.FC = () => {
  const { customers } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'debt'>('name');

  const processedCustomers = useMemo(() => {
    // 1. Filter
    let result = customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    // 2. Sort
    return result.sort((a, b) => {
      if (sortBy === 'debt') {
        // Sort by Debt Descending (Highest first)
        // If debt is equal, sort by name
        if (b.debt === a.debt) return a.name.localeCompare(b.name);
        return b.debt - a.debt;
      } else {
        // Sort by Name Ascending (A-Z)
        return a.name.localeCompare(b.name);
      }
    });
  }, [customers, search, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white">
       {/* Top Bar */}
       <div className="flex items-center bg-background-dark p-4 pb-2 sticky top-0 z-30">
         <Link to="/dashboard" className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-white/10 text-white/70 hover:text-white">
             <span className="material-symbols-outlined">arrow_back</span>
         </Link>
         <h2 className="text-lg font-bold flex-1 text-center pr-8">Clientes</h2>
      </div>

      {/* Search Bar & Sort Options Container */}
       <div className="sticky top-[60px] bg-background-dark z-20 pb-2 shadow-sm shadow-black/20">
         <div className="px-4 py-2">
            <div className="flex w-full items-center rounded-lg bg-zinc-900/50 h-12 px-4 border border-white/5 focus-within:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-zinc-400 mr-2">search</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 text-base w-full placeholder:text-zinc-500 text-white" 
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
         </div>
         
         {/* Sort Chips */}
         <div className="flex gap-3 px-4 pt-1 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setSortBy('name')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    sortBy === 'name' 
                    ? 'bg-primary text-background-dark border-primary' 
                    : 'bg-transparent text-white/70 border-white/10 hover:border-white/30'
                }`}
            >
                <span className="material-symbols-outlined text-[18px] font-bold">sort_by_alpha</span>
                A-Z
            </button>
            <button 
                onClick={() => setSortBy('debt')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    sortBy === 'debt' 
                    ? 'bg-primary text-background-dark border-primary' 
                    : 'bg-transparent text-white/70 border-white/10 hover:border-white/30'
                }`}
            >
                <span className="material-symbols-outlined text-[18px] font-bold">attach_money</span>
                Mayor Deuda
            </button>
         </div>
      </div>

      <main className="flex-grow px-4 pb-24 pt-4 flex flex-col gap-2">
        {processedCustomers.map(customer => (
            <Link 
                to={`/customers/${customer.id}`}
                key={customer.id} 
                className="flex cursor-pointer items-center gap-4 rounded-lg bg-zinc-900/50 p-3 min-h-[72px] justify-between transition-colors hover:bg-zinc-800 border border-white/5 active:scale-[0.98]"
            >
                <div className="flex items-center gap-4">
                    <img className="rounded-full h-14 w-14 object-cover ring-2 ring-white/5" src={customer.imageUrl} alt={customer.name} />
                    <div className="flex flex-col justify-center">
                        <p className="text-white text-base font-medium line-clamp-1">{customer.name}</p>
                        <p className="text-zinc-400 text-sm line-clamp-1">Deuda: <span className={customer.debt > 0 ? 'text-red-400' : 'text-green-400'}>$ {customer.debt.toLocaleString('es-AR')}</span></p>
                    </div>
                </div>
                <div className="shrink-0">
                    <span className="material-symbols-outlined text-zinc-500">chevron_right</span>
                </div>
            </Link>
        ))}
        {processedCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-10 opacity-60">
                <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                <p>No se encontraron clientes</p>
            </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-20">
        <Link to="/customers/new" className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-background-dark shadow-lg transition-transform hover:scale-105 active:scale-95">
            <span className="material-symbols-outlined" style={{ fontSize: '32px', fontWeight: 500 }}>add</span>
        </Link>
      </div>
    </div>
  );
};

export default Customers;
