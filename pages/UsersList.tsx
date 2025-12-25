
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { Link, useNavigate } from 'react-router-dom';

const UsersList: React.FC = () => {
  const { users, user } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Redirect if not admin
  if (user?.role !== 'admin') {
      navigate('/dashboard');
      return null;
  }

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white">
       {/* Top Bar */}
       <div className="flex items-center bg-background-dark p-4 pb-2 sticky top-0 z-30">
         <Link to="/dashboard" className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-white/10 text-white/70 hover:text-white">
             <span className="material-symbols-outlined">arrow_back</span>
         </Link>
         <h2 className="text-lg font-bold flex-1 text-center pr-8">Gestión de Usuarios</h2>
      </div>

      {/* Search Bar */}
      <div className="sticky top-[60px] bg-background-dark z-20 pb-4 shadow-sm shadow-black/20 px-4">
            <div className="flex w-full items-center rounded-xl bg-white/10 h-12 px-4 border border-transparent focus-within:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-white/50 mr-2">search</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 text-base w-full placeholder:text-white/50 text-white" 
                  placeholder="Buscar empleado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
      </div>

      <main className="flex-grow px-4 pb-24 flex flex-col gap-2">
        {filteredUsers.length > 0 ? (
            filteredUsers.map(u => (
                <Link 
                    to={`/users/${u.id}`}
                    key={u.id} 
                    className="flex cursor-pointer items-center gap-4 rounded-xl bg-surface-dark p-3 justify-between transition-colors hover:bg-[#23482f] border border-white/5 active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <img className="rounded-full h-12 w-12 object-cover ring-2 ring-white/5 bg-white/10" src={u.avatarUrl} alt={u.name} />
                        <div className="flex flex-col justify-center">
                            <p className="text-white text-base font-medium line-clamp-1">
                                {u.name} {u.id === user.id && '(Tú)'}
                            </p>
                            <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${u.role === 'admin' ? 'text-primary' : 'text-white/50'}`}>
                                {u.role === 'admin' ? 'Administrador' : 'Empleado'}
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                        {u.role === 'admin' && (
                            <span className="material-symbols-outlined text-primary text-lg" title="Acceso total">verified_user</span>
                        )}
                        <span className="material-symbols-outlined text-white/30">chevron_right</span>
                    </div>
                </Link>
            ))
        ) : (
             <div className="flex flex-col items-center justify-center text-center py-10 opacity-60">
                <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                <p>No se encontraron usuarios</p>
            </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-20">
        <Link to="/users/new" className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-background-dark shadow-lg transition-transform hover:scale-105 active:scale-95">
            <span className="material-symbols-outlined" style={{ fontSize: '32px', fontWeight: 500 }}>person_add</span>
        </Link>
      </div>
    </div>
  );
};

export default UsersList;
