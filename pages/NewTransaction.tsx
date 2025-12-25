
import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { useNavigate, Link } from 'react-router-dom';
import { TransactionType } from '../types';

const NewTransaction: React.FC = () => {
  const { addTransaction, customers, products } = useStore();
  const navigate = useNavigate();

  const [type, setType] = useState<TransactionType>(TransactionType.SALE);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const handleSubmit = () => {
    if (!description || !amount) return;

    addTransaction({
        id: Date.now().toString(),
        type,
        description,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        customerId: selectedCustomer || undefined
    });

    navigate('/dashboard');
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (!productId) return;

    const product = products.find(p => p.id === productId);
    if (product) {
        setDescription(product.name);
        setAmount(product.price.toString());
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark group/design-root">
       {/* Top Bar */}
       <div className="sticky top-0 z-10 flex h-16 items-center border-b border-white/10 bg-background-dark px-4">
            <Link to="/dashboard" className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10">
                <span className="material-symbols-outlined text-2xl">close</span>
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-white">Nuevo Registro</h1>
            <div className="w-10"></div>
       </div>

       <main className="flex flex-1 flex-col p-4 pb-32">
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

            {/* Product Selector (Only for sales) */}
            {type === TransactionType.SALE && (
                <label className="flex flex-col animate-in fade-in slide-in-from-top-2">
                    <p className="text-base font-medium leading-normal text-white pb-2">Seleccionar del Inventario (Opcional)</p>
                    <div className="relative">
                        <select 
                            className="flex h-14 w-full min-w-0 flex-1 appearance-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 pr-10 text-base font-normal leading-normal text-white focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                            onChange={handleProductSelect}
                            defaultValue=""
                        >
                            <option value="" disabled>-- Elegir producto --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">inventory_2</span>
                    </div>
                </label>
            )}

            {/* Description */}
            <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">Descripción</p>
                <input 
                    className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                    placeholder={type === TransactionType.SALE ? "ej. Venta de Taza" : "ej. Pago de alquiler"}
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
                        placeholder="0.00"
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
                    <p className="text-base font-medium leading-normal text-white pb-2">Cliente</p>
                    <div className="relative">
                        <select 
                            className="flex h-14 w-full min-w-0 flex-1 appearance-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 pr-10 text-base font-normal leading-normal text-white focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                        >
                            <option value="">Seleccionar cliente</option>
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
                    onClick={handleSubmit}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-background-dark transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    disabled={!description || !amount}
                >
                    Guardar Registro
                </button>
            </div>
       </div>
    </div>
  );
};

export default NewTransaction;
