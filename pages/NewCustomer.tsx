
import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { useNavigate, Link } from 'react-router-dom';

const NewCustomer: React.FC = () => {
  const { addCustomer } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [debt, setDebt] = useState('');

  const handleSubmit = () => {
    if (!name) return;

    addCustomer({
        id: Date.now().toString(),
        name,
        debt: parseFloat(debt) || 0,
        imageUrl: `https://i.pravatar.cc/150?u=${Date.now()}` // Random avatar based on timestamp
    });

    navigate('/customers');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark group/design-root">
       {/* Top Bar */}
       <div className="sticky top-0 z-10 flex h-16 items-center border-b border-white/10 bg-background-dark px-4">
            <Link to="/customers" className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10">
                <span className="material-symbols-outlined text-2xl">close</span>
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-white">Nuevo Cliente</h1>
            <div className="w-10"></div>
       </div>

       <main className="flex flex-1 flex-col p-4">
         <div className="flex flex-col gap-y-6">
            {/* Name */}
            <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">Nombre del Cliente</p>
                <input
                    className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                    placeholder="ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
            </label>

            {/* Initial Debt */}
            <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">Deuda Inicial (Opcional)</p>
                <div className="relative flex w-full items-center">
                    <span className="material-symbols-outlined absolute left-4 text-white/50">attach_money</span>
                    <input
                        className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark py-4 pl-12 pr-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                        inputMode="decimal"
                        placeholder="0.00"
                        type="number"
                        value={debt}
                        onChange={(e) => setDebt(e.target.value)}
                    />
                </div>
            </label>
         </div>
       </main>

       {/* Footer Actions */}
       <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-background-dark/95 backdrop-blur-sm p-4 safe-pb z-20 flex justify-center">
            <div className="w-full max-w-md">
                <button
                    onClick={handleSubmit}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-background-dark transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    disabled={!name}
                >
                    Guardar Cliente
                </button>
            </div>
       </div>
    </div>
  );
};

export default NewCustomer;
