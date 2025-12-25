
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customers, transactions, updateCustomer, deleteCustomer } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customer = customers.find(c => c.id === id);
  const customerTransactions = transactions.filter(t => t.customerId === id);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [debt, setDebt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Initialize edit state when customer loads
  useEffect(() => {
    if (customer) {
        setName(customer.name);
        setDebt(customer.debt.toString());
        setImageUrl(customer.imageUrl);
    }
  }, [customer]);

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

  // Calculate stats
  const totalPurchases = customerTransactions
    .filter(t => t.type === 'Venta')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
      if (!name) return;
      updateCustomer({
          ...customer,
          name,
          debt: parseFloat(debt) || 0,
          imageUrl
      });
      setIsEditing(false);
  };

  const handleDelete = () => {
      deleteCustomer(customer.id);
      navigate('/customers', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 flex h-16 items-center border-b border-white/10 bg-background-dark px-4 justify-between">
        <button 
            onClick={() => navigate('/customers')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 -ml-2"
        >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-white">Detalle del Cliente</h1>
        <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-white/10 hover:text-red-300"
        >
            <span className="material-symbols-outlined text-2xl">delete</span>
        </button>
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
          {/* Profile Card / Edit Form */}
          <div className="flex flex-col items-center py-8 px-4 bg-surface-dark mb-4 border-b border-white/5 transition-all">
              
              {/* Avatar with Edit Overlay */}
              <div 
                className={`relative group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                  <img 
                    src={imageUrl || customer.imageUrl} 
                    alt={customer.name} 
                    className={`w-24 h-24 rounded-full object-cover border-4 border-background-dark shadow-xl transition-opacity ${isEditing ? 'opacity-80' : ''}`}
                  />
                  {/* Edit Toggle Button (Only visible if NOT editing yet, toggles edit mode) */}
                  {!isEditing && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-4 border-background-dark flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-lg"
                      >
                        <span className="material-symbols-outlined text-background-dark text-lg font-bold">edit</span>
                      </button>
                  )}
                  {/* Camera Icon (Visible only in Edit Mode) */}
                  {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">add_a_photo</span>
                      </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                    disabled={!isEditing}
                  />
              </div>

              {isEditing ? (
                  <div className="w-full max-w-xs mt-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-white/50 uppercase">Nombre</label>
                        <input 
                            className="bg-black/20 border border-white/10 rounded-lg p-3 text-center text-lg font-bold text-white focus:ring-2 focus:ring-primary focus:outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-white/50 uppercase">Deuda Actual ($)</label>
                        <input 
                            className="bg-black/20 border border-white/10 rounded-lg p-3 text-center text-lg font-bold text-white focus:ring-2 focus:ring-primary focus:outline-none"
                            type="number"
                            value={debt}
                            onChange={(e) => setDebt(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => { setIsEditing(false); setName(customer.name); setDebt(customer.debt.toString()); setImageUrl(customer.imageUrl); }}
                            className="flex-1 py-2 rounded-lg bg-white/10 text-sm font-bold hover:bg-white/20"
                          >
                              Cancelar
                          </button>
                          <button 
                            onClick={handleSave}
                            className="flex-1 py-2 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-primary-dark"
                          >
                              Guardar
                          </button>
                      </div>
                  </div>
              ) : (
                  <>
                    <h2 className="text-2xl font-bold mt-4 text-center px-4">{customer.name}</h2>
                    <div className="flex items-center gap-2 mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        <span className="material-symbols-outlined text-white/50 text-sm">attach_money</span>
                        <span className={`text-base font-bold ${customer.debt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {customer.debt > 0 ? 'Debe' : 'A favor'}: $ {customer.debt.toLocaleString('es-AR')}
                        </span>
                    </div>
                  </>
              )}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-sm rounded-2xl bg-surface-dark border border-white/10 p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">¿Eliminar cliente?</h3>
                    <p className="text-white/60 text-sm mt-1">
                       ¿Estás seguro de que quieres eliminar a <strong>"{customer.name}"</strong>? Esta acción no se puede deshacer.
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
                       onClick={handleDelete}
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
};

export default CustomerDetails;
