import React, { useContext, useMemo, useState } from 'react';
import { SalesContext } from '../context/SalesContext';
import { TrendingUp, Wallet, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { sales } = useContext(SalesContext);
  const [selectedMonth, setSelectedMonth] = useState('');

  const availableMonths = [...new Set(sales.map(sale => sale.fecha.substring(0, 7)))].sort().reverse();

  const filteredSales = selectedMonth
    ? sales.filter(sale => sale.fecha.startsWith(selectedMonth))
    : sales;

  const totalSales = filteredSales.length;

  const grossIncome = useMemo(() => {
    return filteredSales.reduce((acc, sale) => acc + parseFloat(sale.monto_total), 0);
  }, [filteredSales]);

  const totalCommission = useMemo(() => {
    return filteredSales.reduce((acc, sale) => acc + parseFloat(sale.comision), 0);
  }, [filteredSales]);

  const recentSales = filteredSales.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 md:gap-4 mb-4 md:mb-0 text-center md:text-left">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Hola, Amor 👋</h1>
          <p className="text-gray-400 mt-2 font-medium text-sm md:text-base">Aquí tienes el resumen de tus ventas de pasajes.</p>
        </div>

        <div className="relative group w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none px-6 py-3.5 md:py-3 w-full sm:w-48 text-center md:text-left rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:border-[#ff2a70] focus:ring-1 focus:ring-[#ff2a70] shadow-xl font-medium transition-all [&>option]:bg-[#1a0512] [&>option]:text-white hover:border-white/30 cursor-pointer"
          >
            <option value="">Todos los meses</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 group-hover:text-white/80 transition-colors">
            ▼
          </div>
        </div>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white/5 backdrop-blur-2xl p-5 md:p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:bg-white/10 hover:border-white/20 duration-300 group">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-2.5 bg-white/10 rounded-xl text-gray-300 group-hover:text-white group-hover:scale-110 transition-all">
              <CheckCircle size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <h3 className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-widest group-hover:text-gray-300">Ventas Totales</h3>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">{totalSales}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl p-5 md:p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:bg-white/10 hover:border-white/20 duration-300 group">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-2.5 bg-white/10 rounded-xl text-gray-300 group-hover:text-white group-hover:scale-110 transition-all">
              <TrendingUp size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <h3 className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-widest group-hover:text-gray-300">Ingreso Bruto</h3>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm"><span className="text-gray-500 text-2xl md:text-3xl">S/</span> {grossIncome.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-[#ff2a70] to-[#f83a8f] p-5 md:p-6 rounded-2xl border border-white/20 shadow-[0_0_20px_rgba(255,42,112,0.6)] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,42,112,0.8)] duration-300 group relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-8 h-full w-1/2 bg-white/10 blur-3xl -rotate-12 translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"></div>
          <div className="flex items-center gap-3 mb-3 md:mb-4 relative z-10">
            <div className="p-2 md:p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white group-hover:scale-110 transition-all">
              <Wallet size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <h3 className="text-xs md:text-sm font-bold text-white/90 uppercase tracking-widest">Comisión Acumulada (1%)</h3>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md relative z-10"><span className="text-white/70 text-2xl md:text-3xl">S/</span> {totalCommission.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="p-5 md:p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-bold text-white tracking-wide">Últimas 5 ventas recientes</h2>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/30 text-gray-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-5">Fecha</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5 text-right">Monto Total</th>
                <th className="px-6 py-5 text-right">Comisión (1%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="bg-white/3 hover:bg-white/10 transition-colors group cursor-default">
                  <td className="px-6 py-4 text-gray-400 font-medium group-hover:text-gray-300">{sale.fecha}</td>
                  <td className="px-6 py-4 font-bold text-gray-200 group-hover:text-white">{sale.nombre_cliente}</td>
                  <td className="px-6 py-4 text-gray-300 font-medium group-hover:text-gray-200 text-right">S/ {parseFloat(sale.monto_total).toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-[#ff2a70] drop-shadow-[0_0_5px_rgba(255,42,112,0.3)] group-hover:drop-shadow-[0_0_10px_rgba(255,42,112,0.6)] text-right">
                    S/ {parseFloat(sale.comision).toFixed(2)}
                  </td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium bg-black/10">
                    No hay ventas registradas en este mes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-white/10">
          {recentSales.map((sale) => (
            <div key={sale.id} className="p-5 flex flex-col gap-2 bg-white/3 hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col flex-1 truncate pr-4">
                  <span className="font-bold text-white text-base truncate">{sale.nombre_cliente}</span>
                  <span className="text-xs text-gray-400 font-medium mt-1">{sale.fecha}</span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  <span className="text-sm text-gray-300 font-bold mb-0.5"><span className="text-[10px] text-gray-500 font-normal mr-1 uppercase">Total</span>S/ {parseFloat(sale.monto_total).toFixed(2)}</span>
                  <span className="text-sm font-bold text-[#ff2a70] drop-shadow-[0_0_5px_rgba(255,42,112,0.3)]"><span className="text-[10px] text-[#ff2a70]/50 font-normal mr-1 uppercase">Comisión</span>S/ {parseFloat(sale.comision).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
          {recentSales.length === 0 && (
             <div className="p-8 text-center text-gray-500 font-medium bg-black/10 text-sm">
                No hay ventas registradas en este mes.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
