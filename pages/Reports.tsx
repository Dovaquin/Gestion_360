
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { Link } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TransactionType } from '../types';

const Reports: React.FC = () => {
  const { transactions } = useStore();
  const [timeframe, setTimeframe] = useState<'Día' | 'Mes' | 'Año'>('Mes');

  const {
    chartData,
    totalSales,
    totalExpenses,
    netProfit,
    topProducts,
    periodLabel,
    growth
  } = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let filteredTransactions = transactions;
    let chartData: any[] = [];
    let periodLabel = "";
    let previousPeriodSales = 0; // For simple growth calc approximation

    if (timeframe === 'Día') {
      filteredTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getDate() === currentDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      periodLabel = "Hoy";

      const blocks = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
      chartData = blocks.map((block, index) => {
        const startHour = index * 4;
        const endHour = startHour + 4;
        const blockTrans = filteredTransactions.filter(t => {
          const h = new Date(t.date).getHours();
          return h >= startHour && h < endHour;
        });
        return {
          name: block,
          sales: blockTrans.filter(t => t.type === TransactionType.SALE).reduce((acc, t) => acc + t.amount, 0),
          expenses: blockTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0)
        };
      });

    } else if (timeframe === 'Mes') {
      filteredTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      periodLabel = "Este mes";

      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
      chartData = weeks.map((week, index) => {
        const blockTrans = filteredTransactions.filter(t => {
          const d = new Date(t.date).getDate();
          return Math.ceil(d / 7) === (index + 1);
        });
        return {
          name: week,
          sales: blockTrans.filter(t => t.type === TransactionType.SALE).reduce((acc, t) => acc + t.amount, 0),
          expenses: blockTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0)
        };
      });

      // Simple mock for previous month sales to calculate growth
      // In a real app, calculate actual previous month
      previousPeriodSales = 100000; 

    } else if (timeframe === 'Año') {
      filteredTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === currentYear;
      });
      periodLabel = "Este año";

      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      chartData = months.map((month, index) => {
        const blockTrans = filteredTransactions.filter(t => {
          return new Date(t.date).getMonth() === index;
        });
        return {
          name: month,
          sales: blockTrans.filter(t => t.type === TransactionType.SALE).reduce((acc, t) => acc + t.amount, 0),
          expenses: blockTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0)
        };
      });
    }

    const totalSales = filteredTransactions
        .filter(t => t.type === TransactionType.SALE)
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = filteredTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((acc, t) => acc + t.amount, 0);
    
    const netProfit = totalSales - totalExpenses;
    const growth = previousPeriodSales > 0 ? ((totalSales - previousPeriodSales) / previousPeriodSales) * 100 : 0;

    // Top Products based on transaction description grouping
    const salesMap = new Map<string, { qty: number, total: number }>();
    filteredTransactions
        .filter(t => t.type === TransactionType.SALE)
        .forEach(t => {
            const existing = salesMap.get(t.description) || { qty: 0, total: 0 };
            // Since we don't have quantity in transaction, we assume 1 transaction = 1 unit for simplicity,
            // or we could assume the description contains quantity. For now, count occurrences.
            salesMap.set(t.description, { qty: existing.qty + 1, total: existing.total + t.amount });
        });

    const topProducts = Array.from(salesMap.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    return {
        chartData,
        totalSales,
        totalExpenses,
        netProfit,
        topProducts,
        periodLabel,
        growth
    };
  }, [transactions, timeframe]);

  const formatCurrency = (val: number) => `$ ${val.toLocaleString('es-AR')}`;

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 bg-background-dark sticky top-0 z-20">
        <Link to="/dashboard" className="flex size-12 shrink-0 items-center justify-start text-white active:opacity-70">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </Link>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight -ml-12">Reportes y Estadísticas</h2>
      </div>

      {/* Filter Toggles */}
      <div className="flex px-4 py-3">
        <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-surface-dark p-1 border border-white/5">
            {['Día', 'Mes', 'Año'].map((t) => (
                <button 
                    key={t}
                    onClick={() => setTimeframe(t as any)}
                    className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-medium transition-all ${timeframe === t ? 'bg-primary text-background-dark shadow-sm' : 'text-white/60 hover:text-white'}`}
                >
                    {t}
                </button>
            ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-2">
            <div className="flex flex-1 flex-col gap-2 rounded-xl p-4 bg-surface-dark border border-white/5">
                <p className="text-base font-medium text-white/70">Ventas Totales</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalSales)}</p>
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-xl p-4 bg-surface-dark border border-white/5">
                <p className="text-base font-medium text-white/70">Gastos Totales</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="flex w-full flex-col gap-2 rounded-xl p-4 bg-surface-dark border border-white/5 sm:col-span-2">
                <p className="text-base font-medium text-white/70">Ganancia Neta</p>
                <p className={`text-2xl font-bold tracking-tight ${netProfit >= 0 ? 'text-primary' : 'text-red-400'}`}>
                    {formatCurrency(netProfit)}
                </p>
            </div>
        </div>

        {/* Chart */}
        <div className="flex flex-col gap-4 px-4 py-2">
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-dark border border-white/5">
                <p className="text-base font-medium text-white/70">Ventas vs. Gastos ({periodLabel})</p>
                <p className="text-3xl font-bold tracking-tighter">{formatCurrency(netProfit)}</p>
                
                {timeframe === 'Mes' && growth !== 0 && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-normal text-white/60">{periodLabel}</span>
                        <span className={`material-symbols-outlined text-sm ${growth >= 0 ? 'text-primary' : 'text-red-400'}`}>
                            {growth >= 0 ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                        <span className={`text-sm font-medium ${growth >= 0 ? 'text-primary' : 'text-red-400'}`}>
                            {Math.abs(growth).toFixed(1)}%
                        </span>
                    </div>
                )}

                <div className="h-48 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} 
                                dy={10}
                                interval={timeframe === 'Año' ? 0 : 'preserveEnd'} 
                            />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{ backgroundColor: '#102216', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#aaa', marginBottom: '0.25rem' }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar name="Ventas" dataKey="sales" fill="#13ec5b" radius={[4, 4, 0, 0]} />
                            <Bar name="Gastos" dataKey="expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Top Products */}
        <h3 className="px-4 pb-3 pt-4 text-lg font-bold">Conceptos Más Vendidos</h3>
        <div className="flex flex-col gap-3 px-4 pb-24">
            {topProducts.length > 0 ? (
                topProducts.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg bg-surface-dark p-3 border border-white/5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5">
                            <span className="material-symbols-outlined text-2xl text-primary">sell</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{item.name}</p>
                            <p className="text-sm text-white/50">{item.qty} {item.qty === 1 ? 'Transacción' : 'Transacciones'}</p>
                        </div>
                        <p className="font-bold text-white whitespace-nowrap">{formatCurrency(item.total)}</p>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                    <p className="text-sm">No hay datos de ventas en este periodo</p>
                </div>
            )}
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-30">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background-dark shadow-xl hover:scale-105 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-2xl">ios_share</span>
        </button>
      </div>

    </div>
  );
};

export default Reports;
