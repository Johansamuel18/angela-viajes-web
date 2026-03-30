import React, { useContext, useMemo, useState } from 'react';
import { SalesContext } from '../context/SalesContext';

export default function Dashboard() {
  const { sales } = useContext(SalesContext);
  const [selectedMonth, setSelectedMonth] = useState('');

  // Obtener meses únicos basados en las fechas para el filtro desplegable
  const availableMonths = [...new Set(sales.map(sale => sale.fecha.substring(0, 7)))].sort().reverse();

  // Filtrar las ventas por el mes seleccionado
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
  
  const recentSales = filteredSales.slice(0, 3); // Como añadimos al inicio del array, los primeros son los recientes

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Hola, Angela 👋</h1>
          <p className="text-gray-500 mt-1">Aquí tienes el resumen de tus ventas de pasajes.</p>
        </div>
        
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm font-medium"
        >
          <option value="">Todos los meses</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm shadow-pink-50 transition-transform hover:-translate-y-1 duration-300">
          <h3 className="text-sm font-medium text-gray-500">Ventas Totales del Mes</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalSales}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm shadow-pink-50 transition-transform hover:-translate-y-1 duration-300">
          <h3 className="text-sm font-medium text-gray-500">Ingreso Bruto</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">S/ {grossIncome.toFixed(2)}</p>
        </div>
        <div className="bg-pink-400 p-6 rounded-3xl shadow-md shadow-pink-200 text-white transition-transform hover:-translate-y-1 duration-300">
          <h3 className="text-sm font-medium text-pink-100">Comisión Acumulada (1%)</h3>
          <p className="text-3xl font-bold mt-2 text-white">S/ {totalCommission.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-pink-50">
          <h2 className="text-lg font-semibold text-gray-800">Últimas 3 ventas recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50/50 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Monto</th>
                <th className="px-6 py-4 font-medium text-pink-600">Comisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-pink-50/30 transition-colors">
                  <td className="px-6 py-4 text-gray-600">{sale.fecha}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{sale.nombre_cliente}</td>
                  <td className="px-6 py-4 text-gray-600">S/ {parseFloat(sale.monto_total).toFixed(2)}</td>
                  <td className="px-6 py-4 font-semibold text-pink-500">S/ {parseFloat(sale.comision).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
