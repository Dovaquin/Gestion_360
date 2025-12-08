
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customers, transactions } = useStore();
  const navigate = useNavigate();

  const customer = customers.find(c => c.id === id);
  const customerTransactions = transactions.filter(t => t.customerId === id);

  if (!customer) {
    return (
      <div className="flex flex-col min-h-screen bg-background-dark text-white items-center justify-center">
        <p className="text-lg font-medium mb-4">Cliente no encontrado</p>
        <button 
            onClick={() => navigate('/customers')} 
            className="text-primary hover:underline"
        >
            Volver a la lista
        </button>
      </div>
    );
  }

  // Calculate some basic stats for this customer based on transactions (if any)
  const totalPurchases = customerTransactions
    .filter(t => t.type === 'Venta')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 flex h-16 items-center border-b border-white/10 bg-background-dark px-4">
        <button 
            onClick={() => navigate(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 -ml-2"
        >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-white">Detalle del Cliente</h1>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
          {/* Profile Card */}
          <div className="flex flex-col items-center py-8 px-4 bg-surface-dark mb-4 border-b border-white/5">
              <div className="relative group cursor-pointer">
                  <img 
                    src={customer.imageUrl} 
                    alt={customer.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-background-dark shadow-xl group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 border-4 border-background-dark flex items-center justify-center">
                    <span className="material-symbols-outlined text-background-dark text-sm font-bold">edit</span>
                  </div>
              </div>
              <h2 className="text-2xl font-bold mt-4">{customer.name}</h2>
              <div className="flex items-center gap-2 mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                <span className="material-symbols-outlined text-white/50 text-sm">attach_money</span>
                <span className={`text-base font-bold ${customer.debt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {customer.debt > 0 ? 'Debe' : 'A favor'}: $ {customer.debt.toLocaleString('es-AR')}
                </span>
              </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 px-4 mb-6">
             <div className="bg-surface-dark p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center shadow-lg">
                <span className="text-white/50 text-xs uppercase font-bold tracking-wider mb-1">Total Compras</span>
                <span className="text-xl font-bold text-white">$ {totalPurchases.toLocaleString('es-AR')}</span> 
             </div>
             <div className="bg-surface-dark p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center shadow-lg">
                <span className="text-white/50 text-xs uppercase font-bold tracking-wider mb-1">Transacciones</span>
                <span className="text-xl font-bold text-white">{customerTransactions.length}</span>
             </div>
          </div>

          {/* Transactions List */}
          <div className="px-4">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white/90">
                 <span className="material-symbols-outlined text-primary">history</span>
                 Historial de Movimientos
              </h3>
              
              <div className="flex flex-col gap-3">
                  {customerTransactions.length > 0 ? (
                      customerTransactions.map(t => (
                          <div key={t.id} className="bg-surface-dark p-4 rounded-xl border border-white/5 flex justify-between items-center hover:bg-[#23482f] transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'Venta' ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-500'}`}>
                                      <span className="material-symbols-outlined text-xl">{t.type === 'Venta' ? 'shopping_bag' : 'payments'}</span>
                                  </div>
                                  <div className="flex flex-col">
                                      <p className="font-medium text-white line-clamp-1">{t.description}</p>
                                      <p className="text-xs text-white/50">{new Date(t.date).toLocaleDateString()}</p>
                                  </div>
                              </div>
                              <span className={`font-bold whitespace-nowrap ml-2 ${t.type === 'Venta' ? 'text-white' : 'text-red-400'}`}>
                                  {t.type === 'Venta' ? '+' : '-'} $ {t.amount.toLocaleString('es-AR')}
                              </span>
                          </div>
                      ))
                  ) : (
                      <div className="flex flex-col items-center justify-center py-12 opacity-50 bg-surface-dark/30 rounded-xl border border-white/5 border-dashed">
                          <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                          <p className="text-sm">No hay movimientos registrados</p>
                      </div>
                  )}
              </div>
          </div>
      </main>
    </div>
  );
};

export default CustomerDetails;
