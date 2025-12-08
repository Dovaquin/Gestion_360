import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { Link } from 'react-router-dom';

const Inventory: React.FC = () => {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc'>('name');

  const processedProducts = useMemo(() => {
    // 1. Filter
    let result = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );

    // 2. Sort
    return result.sort((a, b) => {
      if (sortBy === 'stock_asc') {
        return a.stock - b.stock;
      } else if (sortBy === 'stock_desc') {
        return b.stock - a.stock;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [products, search, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-stone-900 dark:text-white">
      {/* Top Bar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 sticky top-0 z-30">
        <Link to="/dashboard" className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-white/10 text-white/70 hover:text-white">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold leading-tight flex-1 text-center pr-8">Inventario</h1>
      </div>

      {/* Search Bar & Sort Options Container */}
      <div className="sticky top-[72px] bg-background-light dark:bg-background-dark z-20 pb-2 shadow-sm shadow-black/20">
        <div className="px-4 py-2">
            <div className="flex w-full items-center rounded-xl bg-white/10 h-12 px-4 border border-transparent focus-within:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-white/50 mr-2">search</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 text-base w-full placeholder:text-white/50 text-white" 
                  placeholder="Buscar producto por nombre o SKU"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* Sort Chips */}
        <div className="flex gap-3 px-4 pt-1 overflow-x-auto no-scrollbar pb-2">
            <button 
                onClick={() => setSortBy('name')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap ${
                    sortBy === 'name' 
                    ? 'bg-primary text-background-dark border-primary' 
                    : 'bg-transparent text-white/70 border-white/10 hover:border-white/30'
                }`}
            >
                <span className="material-symbols-outlined text-[18px] font-bold">sort_by_alpha</span>
                A-Z
            </button>
            <button 
                onClick={() => setSortBy('stock_asc')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap ${
                    sortBy === 'stock_asc' 
                    ? 'bg-primary text-background-dark border-primary' 
                    : 'bg-transparent text-white/70 border-white/10 hover:border-white/30'
                }`}
            >
                <span className="material-symbols-outlined text-[18px] font-bold">arrow_downward</span>
                Menor Stock
            </button>
            <button 
                onClick={() => setSortBy('stock_desc')}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap ${
                    sortBy === 'stock_desc' 
                    ? 'bg-primary text-background-dark border-primary' 
                    : 'bg-transparent text-white/70 border-white/10 hover:border-white/30'
                }`}
            >
                <span className="material-symbols-outlined text-[18px] font-bold">arrow_upward</span>
                Mayor Stock
            </button>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 p-4 pt-2 pb-24">
        {processedProducts.map(product => (
            <Link 
              to={`/inventory/${product.id}`}
              key={product.id} 
              className="flex items-center gap-4 bg-surface-dark px-4 py-3 rounded-xl cursor-pointer hover:bg-[#23482f] active:scale-[0.98] transition-all border border-white/5"
            >
                <div 
                  className="bg-center bg-no-repeat bg-cover rounded-lg size-14 shrink-0 bg-white/5 border border-white/5" 
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                ></div>
                <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-base font-medium line-clamp-1 text-white">{product.name}</p>
                    <p className={`text-sm line-clamp-1 ${product.stock <= 5 ? 'text-red-400 font-medium' : 'text-white/60'}`}>
                        Stock: {product.stock} unidades
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end">
                        <p className="text-base font-medium text-white">$ {product.price.toLocaleString('es-AR')}</p>
                        <p className="text-white/60 text-xs">ARS</p>
                    </div>
                    <span className="material-symbols-outlined text-white/40">chevron_right</span>
                </div>
            </Link>
        ))}
        {processedProducts.length === 0 && (
             <div className="flex flex-col items-center justify-center text-center py-20 px-4 opacity-50">
                <div className="flex items-center justify-center size-24 bg-white/5 rounded-full mb-6">
                    <span className="material-symbols-outlined text-5xl text-white/50">inventory_2</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">No se encontraron productos</h3>
                <p className="text-white/60 text-base max-w-xs">Intenta con otro término de búsqueda.</p>
            </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-30">
        <Link to="/inventory/new" className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-primary text-background-dark shadow-lg hover:scale-105 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-3xl font-medium">add</span>
        </Link>
      </div>
    </div>
  );
};

export default Inventory;