
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/Store';
import { TransactionType } from '../types';

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { transactions, updateTransaction, deleteTransaction, customers, user } = useStore();
  const navigate = useNavigate();

  const transaction = transactions.find(t => t.id === id);

  // States for form
  const [type, setType] = useState<TransactionType>(TransactionType.SALE);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      // Convert ISO to YYYY-MM-DD for input date
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setSelectedCustomer(transaction.customerId || '');
    }
  }, [transaction]);

  if (!transaction) {
    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white items-center justify-center">
          <p className="text-lg font-medium mb-4">Transacción no encontrada</p>
          <button onClick={() => navigate('/transactions')} className="text-primary hover:underline">
            Volver a la actividad
          </button>
        </div>
    );
  }

  const handleUpdate = () => {
    if (!description || !amount) return;
    
    updateTransaction({
        ...transaction,
        type,
        description,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        customerId: selectedCustomer || undefined
    });
    navigate('/transactions');
  };

  const confirmDelete = () => {
    deleteTransaction(transaction.id);
    navigate('/transactions', { replace: true });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark group/design-root">
       {/* Top Bar */}
       <div className="sticky top-0 z-10 flex h-16 items-center border-b border-white/10 bg-background-dark px-4 justify-between">
            <Link to="/transactions" className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <h1 className="text-lg font-bold text-white">Editar Movimiento</h1>
            {isAdmin ? (
                 <button 
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-white/10 hover:text-red-300"
                >
                    <span className="material-symbols-outlined text-2xl">delete</span>
                </button>
            ) : <div className="w-10"></div>}
       </div>

       <main className="flex flex-1 flex-col p-4 pb-24">
         <div className="flex flex-col gap-y-6">
            
            {/* Type Selector */}
            <div>
                <p className="text-base font-medium leading-normal text-white pb-2">Tipo</p>
                <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary/10 p-1 border border-primary/20">
                    <label className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${type === TransactionType.SALE ? 'bg-primary text-background-dark shadow-sm' : 'text-primary hover:bg-primary/10'}`}>
                        <span className="truncate">Venta</span>
                        <input 
                            type="radio" 
                            name="type" 
                            className="invisible w-0 absolute" 
                            checked={type === TransactionType.SALE}
                            onChange={() => setType(TransactionType.SALE)}
                        />
                    </label>
                    <label className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${type === TransactionType.EXPENSE ? 'bg-primary text-background-dark shadow-sm' : 'text-primary hover:bg-primary/10'}`}>
                        <span className="truncate">Gasto</span>
                        <input 
                            type="radio" 
                            name="type" 
                            className="invisible w-0 absolute"
                            checked={type === TransactionType.EXPENSE}
                            onChange={() => setType(TransactionType.EXPENSE)}
                        />
                    </label>
                </div>
            </div>

            {/* Description */}
            <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">Descripción</p>
                <input
                    className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>

            {/* Amount */}
            <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">Monto</p>
                <div className="relative flex w-full items-center">
                    <span className="material-symbols-outlined absolute left-4 text-white/50">payments</span>
                    <input
                        className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark py-4 pl-12 pr-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                        inputMode="decimal"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </label>

             {/* Date */}
            <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">Fecha</p>
                <div className="relative flex w-full items-center">
                    <input 
                        className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/50 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow appearance-none"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-4 text-white/50 pointer-events-none">calendar_today</span>
                </div>
            </label>

            {/* Customer Select (Only for sales) */}
            {type === TransactionType.SALE && (
                <label className="flex flex-col animate-in fade-in slide-in-from-top-2">
                    <p className="text-base font-medium leading-normal text-white pb-2">Cliente (Opcional)</p>
                    <div className="relative">
                        <select 
                            className="flex h-14 w-full min-w-0 flex-1 appearance-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 pr-10 text-base font-normal leading-normal text-white focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                        >
                            <option value="">Sin cliente asignado</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">arrow_drop_down</span>
                    </div>
                </label>
            )}
         </div>
       </main>

       {/* Footer Actions */}
       <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-background-dark/95 backdrop-blur-sm p-4 safe-pb z-20 flex justify-center">
            <div className="w-full max-w-md">
                <button
                    onClick={handleUpdate}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-background-dark transition-all hover:bg-primary-dark active:scale-95"
                >
                    Guardar Cambios
                </button>
            </div>
       </div>

       {/* Custom Delete Confirmation Modal */}
       {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-sm rounded-2xl bg-surface-dark border border-white/10 p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">¿Eliminar movimiento?</h3>
                    <p className="text-white/60 text-sm mt-1">
                       Estás a punto de eliminar este registro de <strong>{formatCurrency(transaction.amount)}</strong>.
                    </p>
                 </div>
                 <div className="flex gap-3 w-full mt-2">
                    <button 
                       onClick={() => setIsDeleteModalOpen(false)}
                       className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 active:scale-95"
                    >
                       Cancelar
                    </button>
                    <button 
                       onClick={confirmDelete}
                       className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600 active:scale-95"
                    >
                       Eliminar
                    </button>
                 </div>
              </div>
           </div>
        </div>
       )}
    </div>
  );

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  }
};

export default TransactionDetails;
