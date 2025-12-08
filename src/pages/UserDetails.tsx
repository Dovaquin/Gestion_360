import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/Store'; // Keep for local mock users for now
import { useSessionContext } from '../context/SessionContext'; // Import SessionContext
import { User, UserPermissions } from '../types';
import { supabase } from '../integrations/supabase/client'; // Import supabase client

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { users, addUser, updateUser, deleteUser } = useStore(); // Still using local store for users for now
  const { appUser: currentUser, fetchAppUserProfile } = useSessionContext(); // Get current logged-in user
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNew = !id;
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Protect route: Only admins can access
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
        navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const existingUser = users.find(u => u.id === id);

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [permissions, setPermissions] = useState<UserPermissions>({
      inventory: true,
      sales: true,
      customers: false,
      reports: false
  });

  useEffect(() => {
    if (existingUser) {
        setName(existingUser.name);
        setPin(existingUser.pin);
        setRole(existingUser.role);
        setPermissions(existingUser.permissions);
        setAvatarUrl(existingUser.avatarUrl);
    } else {
        setAvatarUrl(`https://i.pravatar.cc/150?u=${Date.now()}`);
    }
  }, [existingUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || pin.length !== 4) {
        alert("Completa el nombre y usa un PIN de 4 dígitos.");
        return;
    }

    const userData: User = {
        id: existingUser ? existingUser.id : Date.now().toString(), // This ID will be replaced by Supabase auth.users.id
        name,
        pin,
        role,
        permissions: role === 'admin' ? { inventory: true, sales: true, customers: true, reports: true } : permissions,
        avatarUrl: avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`
    };

    if (isNew) {
        // For new users, we'd typically create them via Supabase Auth, then their profile is auto-created
        // For now, we'll add to local store, but this needs to be updated for Supabase
        addUser(userData); 
    } else {
        // Update existing user profile in Supabase
        const { error } = await supabase
            .from('profiles')
            .update({ 
                first_name: name.split(' ')[0] || '',
                last_name: name.split(' ').slice(1).join(' ') || '',
                pin,
                role,
                permissions,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', userData.id);

        if (error) {
            console.error('Error updating user profile:', error);
            alert('Error al actualizar el perfil del usuario.');
        } else {
            updateUser(userData); // Update local store for immediate UI reflection
            if (currentUser?.id === userData.id) {
                fetchAppUserProfile(userData.id); // Refresh current user's profile if it was updated
            }
        }
    }
    navigate('/users');
  };

  const confirmDelete = async () => {
    if (id) {
        // In a real Supabase app, deleting a user from auth.users would cascade delete the profile
        // For now, we'll just delete from local store
        deleteUser(id); 
        // If we were deleting from Supabase Auth:
        // const { error } = await supabase.auth.admin.deleteUser(id);
        // if (error) console.error('Error deleting user:', error);
    }
    navigate('/users', { replace: true });
  };

  const togglePermission = (key: keyof UserPermissions) => {
      setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null; // Render nothing if not admin, as redirect is handled by useEffect
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark group/design-root text-white">
       {/* Top Bar */}
       <div className="sticky top-0 z-10 flex h-16 items-center border-b border-white/10 bg-background-dark px-4">
            <Link to="/users" className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-white">
                {isNew ? 'Nuevo Usuario' : 'Editar Usuario'}
            </h1>
            { !isNew && id !== currentUser?.id ? (
                <button 
                    onClick={() => setIsDeleteModalOpen(true)} 
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-red-400 hover:bg-white/10"
                >
                    <span className="material-symbols-outlined text-2xl">delete</span>
                </button>
            ) : <div className="w-10"></div> }
       </div>

       <main className="flex flex-1 flex-col p-4 pb-24">
         <div className="flex flex-col gap-y-6">
            
            {/* Image Upload */}
            <div className="flex justify-center py-2">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-28 h-28 rounded-full border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all overflow-hidden bg-black/20"
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-3xl text-white/50">add_a_photo</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                         <span className="material-symbols-outlined text-white text-2xl">edit</span>
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>

            {/* Basic Info */}
            <div className="bg-surface-dark p-4 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Información Básica</h3>
                
                <label className="flex flex-col">
                    <p className="text-base font-medium leading-normal text-white pb-2">Nombre</p>
                    <input
                        className="bg-black/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary border border-white/10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre completo"
                    />
                </label>

                <label className="flex flex-col">
                    <p className="text-base font-medium leading-normal text-white pb-2">PIN de Acceso (4 dígitos)</p>
                    <input
                        className="bg-black/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary border border-white/10 tracking-widest text-center font-mono text-xl"
                        value={pin}
                        onChange={(e) => {
                            if (e.target.value.length <= 4) setPin(e.target.value);
                        }}
                        type="tel"
                        placeholder="0000"
                    />
                </label>

                <label className="flex flex-col">
                    <p className="text-base font-medium leading-normal text-white pb-2">Rol</p>
                    <div className="flex bg-black/20 rounded-lg p-1 border border-white/10">
                        <button 
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${role === 'employee' ? 'bg-primary text-background-dark shadow' : 'text-white/50'}`}
                            onClick={() => setRole('employee')}
                        >
                            Empleado
                        </button>
                        <button 
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${role === 'admin' ? 'bg-primary text-background-dark shadow' : 'text-white/50'}`}
                            onClick={() => setRole('admin')}
                        >
                            Administrador
                        </button>
                    </div>
                </label>
            </div>

            {/* Permissions (Only show if role is employee) */}
            {role === 'employee' && (
                <div className="bg-surface-dark p-4 rounded-xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Permisos de Acceso</h3>
                    
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <span>Inventario (Ver/Editar)</span>
                        </div>
                        <button 
                            onClick={() => togglePermission('inventory')}
                            className={`w-12 h-6 rounded-full relative transition-colors ${permissions.inventory ? 'bg-primary' : 'bg-white/10'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${permissions.inventory ? 'translate-x-6' : ''}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">add_shopping_cart</span>
                            </div>
                            <span>Registrar Ventas/Gastos</span>
                        </div>
                        <button 
                            onClick={() => togglePermission('sales')}
                            className={`w-12 h-6 rounded-full relative transition-colors ${permissions.sales ? 'bg-primary' : 'bg-white/10'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${permissions.sales ? 'translate-x-6' : ''}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <span>Gestión de Clientes</span>
                        </div>
                        <button 
                            onClick={() => togglePermission('customers')}
                            className={`w-12 h-6 rounded-full relative transition-colors ${permissions.customers ? 'bg-primary' : 'bg-white/10'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${permissions.customers ? 'translate-x-6' : ''}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">analytics</span>
                            </div>
                            <span>Ver Reportes</span>
                        </div>
                        <button 
                            onClick={() => togglePermission('reports')}
                            className={`w-12 h-6 rounded-full relative transition-colors ${permissions.reports ? 'bg-primary' : 'bg-white/10'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${permissions.reports ? 'translate-x-6' : ''}`}></span>
                        </button>
                    </div>
                </div>
            )}

            {role === 'admin' && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3 items-start">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-sm text-primary/80 leading-relaxed">
                        Los administradores tienen acceso completo a todas las funciones del sistema, incluyendo la gestión de otros usuarios.
                    </p>
                </div>
            )}
         </div>
       </main>

       {/* Footer Actions */}
       <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-background-dark/95 backdrop-blur-sm p-4 safe-pb z-20 flex justify-center">
            <div className="w-full max-w-md">
                <button
                    onClick={handleSubmit}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-background-dark transition-all hover:bg-primary-dark active:scale-95"
                >
                    Guardar Usuario
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
                    <h3 className="text-lg font-bold text-white">¿Eliminar usuario?</h3>
                    <p className="text-white/60 text-sm mt-1">
                       ¿Estás seguro de que quieres eliminar a <strong>"{name}"</strong>? Perderá el acceso inmediatamente.
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
};

export default UserDetails;