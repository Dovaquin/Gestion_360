
import React from 'react';
import { useStore } from '../context/Store';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { user, transactions, logout } = useStore();
  const navigate = useNavigate();

  // Calculate Stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSales = monthlyTransactions
    .filter(t => t.type === 'Venta')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'Gasto')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalSales - totalExpenses;

  // Chart Data: Last 7 days
  const chartData = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayTransactions = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getDate() === d.getDate() && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    const dayTotal = dayTransactions.reduce((acc, t) => t.type === 'Venta' ? acc + t.amount : acc - t.amount, 0);
    chartData.push({
      day: dayNames[d.getDay()],
      amount: Math.max(0, dayTotal), // Simple visual, only positive for this chart style
      rawAmount: dayTotal
    });
  }

  const formatCurrency = (val: number) => `$ ${val.toLocaleString('es-AR')}`;
  
  // Safe check if user exists (though protected route ensures it)
  const avatar = user?.avatarUrl || 'https://i.pravatar.cc/150';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper component for Quick Actions
  const QuickAction = ({ 
    to, 
    icon, 
    label, 
    hasPermission, 
    fullWidth = false 
  }: { 
    to: string; 
    icon: string; 
    label: React.ReactNode; 
    hasPermission: boolean;
    fullWidth?: boolean;
  }) => {
    if (hasPermission) {
      return (
        <Link 
          to={to} 
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-dark p-4 h-32 hover:bg-[#23482f] active:scale-95 transition-all border border-white/5 ${fullWidth ? 'col-span-2' : ''}`}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
          </div>
          <p className="text-sm font-semibold text-center leading-tight">{label}</p>
        </Link>
      );
    }
  
    return (
      <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-dark p-4 h-32 opacity-40 border border-white/5 relative overflow-hidden ${fullWidth ? 'col-span-2' : ''}`}>
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-2xl">lock</span>
        </div>
        <p className="text-sm font-semibold text-center leading-tight">{label}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white pb-6">
      {/* Top Bar */}
      <div className="flex items-center p-4 justify-between sticky top-0 z-20 bg-background-dark/95 backdrop-blur-sm">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-primary/20"
            style={{ backgroundImage: `url(${avatar})` }}
          ></div>
        </div>
        <h1 className="text-lg font-bold">Gestión 360</h1>
        <div className="w-10 flex justify-end">
          <button 
            onClick={handleLogout}
            className="text-red-500 hover:text-red-400 transition-colors flex items-center justify-center"
            title="Cerrar Sesión"
          >
            <span className="material-symbols-outlined text-[28px]">logout</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col gap-3 p-4 pt-2">
        
        {/* Row: Sales & Expenses */}
        <div className="grid grid-cols-2 gap-3">
            {/* Ventas - Clickable */}
            <Link to="/transactions?type=SALE" className="flex flex-col justify-between gap-1 rounded-2xl p-4 bg-surface-dark border border-white/5 shadow-lg hover:bg-[#23482f] transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-1.5 text-white/70">
                    <span className="material-symbols-outlined text-primary text-xl">monitoring</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Ventas</span>
                </div>
                <div>
                    <p className="text-xl font-bold tracking-tight truncate text-[#13ec5b]">{formatCurrency(totalSales)}</p>
                    <p className="text-primary text-[10px] font-bold bg-primary/10 w-fit px-2 py-0.5 rounded-full mt-1">Mes actual</p>
                </div>
            </Link>

            {/* Gastos - Clickable */}
            <Link to="/transactions?type=EXPENSE" className="flex flex-col justify-between gap-1 rounded-2xl p-4 bg-surface-dark border border-white/5 shadow-lg hover:bg-[#23482f] transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-1.5 text-white/70">
                    <span className="material-symbols-outlined text-orange-400 text-xl">receipt_long</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Gastos</span>
                </div>
                <div>
                    <p className="text-xl font-bold tracking-tight truncate text-red-400">{formatCurrency(totalExpenses)}</p>
                    <p className="text-orange-400 text-[10px] font-bold bg-orange-400/10 w-fit px-2 py-0.5 rounded-full mt-1">Mes actual</p>
                </div>
            </Link>
        </div>

        {/* Balance (Full Width) */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-surface-dark border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="flex items-center gap-2 text-white/70 relative z-10">
            <span className="material-symbols-outlined text-white/80 text-xl">account_balance_wallet</span>
            <span className="text-sm font-medium">Balance Actual</span>
          </div>
          <p className="text-3xl font-bold tracking-tight relative z-10">{formatCurrency(balance)}</p>
          <div className="flex items-center gap-2 relative z-10">
             <span className={`w-2 h-2 rounded-full ${balance >= 0 ? 'bg-primary' : 'bg-red-500'}`}></span>
             <p className="text-white/50 text-xs font-medium">Calculado este mes</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold">Actividad Reciente</h2>
        <Link to="/transactions" className="text-primary text-sm font-semibold hover:underline">Ver todo</Link>
      </div>
      
      <div className="px-4">
        <Link to="/transactions" className="block">
            <div className="flex flex-col rounded-2xl bg-surface-dark p-5 border border-white/5 transition-colors hover:bg-[#23482f]">
            <div className="mb-4">
                <p className="text-white/60 text-sm font-medium">Últimos 7 Días</p>
                <p className="text-2xl font-bold">$350,000</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[#92c9a4] text-xs">Esta Semana</span>
                    <span className="text-primary text-xs font-bold">+8%</span>
                </div>
            </div>
            
            <div className="h-40 w-full pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} 
                        dy={10}
                    />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#102216', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ display: 'none' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#13ec5b' : 'rgba(19, 236, 91, 0.3)'} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold px-4 pt-6 pb-3">Accesos Rápidos</h2>
      <div className="grid grid-cols-2 gap-4 px-4 pb-8">
        
        <QuickAction 
          to="/transaction/new" 
          icon="add_shopping_cart" 
          label={<>Registrar<br/>Venta/Gasto</>}
          hasPermission={!!user?.permissions.sales}
        />
        
        <QuickAction 
          to="/inventory" 
          icon="inventory_2" 
          label="Inventario"
          hasPermission={!!user?.permissions.inventory}
        />

        <QuickAction 
          to="/customers" 
          icon="groups" 
          label="Clientes"
          hasPermission={!!user?.permissions.customers}
        />

        <QuickAction 
          to="/reports" 
          icon="analytics" 
          label="Reportes"
          hasPermission={!!user?.permissions.reports}
        />

        <QuickAction 
          to="/users" 
          icon="manage_accounts" 
          label="Usuarios (Admin)"
          hasPermission={user?.role === 'admin'}
          fullWidth={true}
        />

      </div>
    </div>
  );
};

export default Dashboard;
