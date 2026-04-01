import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Trash2, Search, ExternalLink, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function Historial() {
  const [sales, setSales] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Carga de Datos en tiempo real desde Firestore
  useEffect(() => {
    // Nota: dependemos de 'createdAt' para ordenar de más reciente a más antiguo cronológicamente
    const q = query(collection(db, 'ventas'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesData = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setSales(salesData);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar ventas en tiempo real:", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Limpiamos el listener al desmontar el componente
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Amorcito, segura que deseas eliminar esta venta?")) {
      try {
        await deleteDoc(doc(db, 'ventas', id));
      } catch (error) {
        console.error("Error eliminando venta: ", error);
        alert("Hubo un error al eliminar la venta.");
      }
    }
  };

  // 2. Extraer meses únicos para el filtro
  const availableMonths = [...new Set(sales.map(sale => sale.fecha?.substring(0, 7) || ''))]
    .filter(Boolean)
    .sort()
    .reverse();

  // 3. Filtrar ventas según la búsqueda y el mes
  let filteredSales = selectedMonth 
    ? sales.filter(sale => sale.fecha?.startsWith(selectedMonth))
    : sales;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredSales = filteredSales.filter(sale => 
      sale.nombre_cliente?.toLowerCase().includes(term)
    );
  }

  // 4. Exportación a Excel
  const handleExport = () => {
    if (filteredSales.length === 0) {
      alert("No hay datos para exportar con estos filtros.");
      return;
    }

    const dataToExport = filteredSales.map(sale => ({
      "ID de Venta": sale.id,
      "Fecha": sale.fecha,
      "Cliente": sale.nombre_cliente,
      "Tipo": sale.tipo_comprobante,
      "Monto Total (S/)": parseFloat(sale.monto_total || 0).toFixed(2),
      "Comisión (S/)": parseFloat(sale.comision || 0).toFixed(2),
      "URL del Archivo": sale.url_pdf || "Sin archivo"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    
    const fileName = selectedMonth ? `Ventas_Angela_${selectedMonth}.xlsx` : `Ventas_Angela_Todas.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Función opcional para forzar la descarga del PDF
  const handleDownloadPDF = async (url, nombreCliente) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Comprobante_${nombreCliente.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Error descargando el PDF de forma directa:", e);
      // Fallback: Si Cloudinary bloquea por CORS, lo abrimos en pestaña nueva y de ahí puede descargar
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabecera */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 md:gap-6 text-center md:text-left">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Historial de Ventas</h1>
          <p className="text-gray-400 mt-2 font-medium text-sm md:text-base">Revisa, filtra y gestiona tus registros históricos.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Buscador de Cliente */}
          <div className="relative w-full sm:w-64 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#ff2a70]">
              <Search className="h-5 w-5 text-gray-500 group-focus-within:text-[#ff2a70] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 w-full rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a70] focus:ring-1 focus:ring-[#ff2a70] text-sm transition-all shadow-xl"
            />
          </div>

          {/* Filtro por Mes */}
          <div className="relative group">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none px-5 py-3 w-full sm:w-auto rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:border-[#ff2a70] focus:ring-1 focus:ring-[#ff2a70] text-sm shadow-xl font-medium transition-all [&>option]:bg-[#1a0512] [&>option]:text-white cursor-pointer pr-10"
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

          {/* Botón Excel */}
          <button 
            onClick={handleExport} 
            className="flex items-center justify-center gap-2 bg-[#1d5c36]/40 backdrop-blur-md border border-[#34a853]/40 text-[#4ade80] px-5 py-3 rounded-xl hover:bg-[#1d5c36]/60 hover:border-[#34a853]/60 transition-all text-sm font-bold whitespace-nowrap shadow-lg shadow-black/20"
          >
            <FileSpreadsheet size={18} />
            Exportar Excel
          </button>
        </div>
      </header>

      {/* Interfaz de Tabla Responsiva y Lista Móvil */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center items-center gap-3 text-gray-400 animate-pulse font-medium">
            <div className="w-6 h-6 border-2 border-white/20 border-t-[#ff2a70] rounded-full animate-spin"></div>
            Cargando historial de ventas...
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/30 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="px-6 py-5">Fecha</th>
                    <th className="px-6 py-5">Cliente</th>
                    <th className="px-6 py-5 text-right">Monto Total</th>
                    <th className="px-6 py-5 text-[#ff2a70] text-right">Comisión (1%)</th>
                    <th className="px-6 py-5 text-center">Comprobante</th>
                    <th className="px-6 py-5 text-center">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium bg-white/5">
                        No se encontraron ventas para esta búsqueda o fecha.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="bg-white/3 hover:bg-white/10 transition-colors group">
                        <td className="px-6 py-4 text-gray-400 font-medium group-hover:text-gray-300">
                          {sale.fecha}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-200 group-hover:text-white">
                          {sale.nombre_cliente}
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-medium group-hover:text-gray-200 text-right">
                          S/ {parseFloat(sale.monto_total || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-bold text-[#ff2a70] drop-shadow-[0_0_5px_rgba(255,42,112,0.3)] group-hover:drop-shadow-[0_0_8px_rgba(255,42,112,0.6)] text-right">
                          S/ {parseFloat(sale.comision || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {/* Botones de visualización PDF */}
                          {sale.url_pdf ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => window.open(sale.url_pdf, '_blank')}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-[#ff2a70] hover:shadow-[0_0_15px_rgba(255,42,112,0.5)] rounded-lg transition-all border border-white/20 hover:border-transparent"
                              >
                                <ExternalLink size={14} />
                                Ver PDF
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(sale.url_pdf, sale.nombre_cliente)}
                                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white bg-white/5 hover:bg-white/20 rounded-lg transition-all border border-white/10"
                                title="Descargar PDF"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="flex justify-center text-gray-500 text-xs italic">Sin PDF</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => handleDelete(sale.id)}
                              className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                              title="Eliminar venta"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-white/10">
              {filteredSales.length === 0 ? (
                 <div className="p-8 text-center text-gray-500 font-medium bg-white/5 text-sm">
                    No se encontraron ventas para esta búsqueda o fecha.
                 </div>
              ) : (
                filteredSales.map((sale) => (
                  <div key={sale.id} className="p-5 flex flex-col gap-4 bg-white/3 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col flex-1 pr-4">
                        <span className="font-bold text-white text-base leading-tight break-words">{sale.nombre_cliente}</span>
                        <span className="text-xs text-gray-400 mt-1 font-medium">{sale.fecha}</span>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 text-right">
                        <span className="text-sm text-gray-300 font-bold mb-0.5"><span className="text-[10px] text-gray-500 font-normal mr-1 uppercase">Total</span>S/ {parseFloat(sale.monto_total || 0).toFixed(2)}</span>
                        <span className="text-sm font-bold text-[#ff2a70] drop-shadow-[0_0_5px_rgba(255,42,112,0.3)]"><span className="text-[10px] text-[#ff2a70]/50 font-normal mr-1 uppercase">Comisión</span>S/ {parseFloat(sale.comision || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción móvil */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      {sale.url_pdf ? (
                        <div className="flex items-center gap-2">
                           <button
                             onClick={() => window.open(sale.url_pdf, '_blank')}
                             className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/10 hover:bg-[#ff2a70] hover:shadow-[0_0_15px_rgba(255,42,112,0.5)] rounded-lg transition-all border border-white/20 hover:border-transparent"
                           >
                             <ExternalLink size={14} />
                             Ver PDF
                           </button>
                           <button
                             onClick={() => handleDownloadPDF(sale.url_pdf, sale.nombre_cliente)}
                             className="flex items-center justify-center p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/20 rounded-lg transition-all border border-white/10"
                             title="Descargar PDF"
                           >
                             <Download size={16} />
                           </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs italic">Sin Comprobante</span>
                      )}

                      <button 
                        onClick={() => handleDelete(sale.id)}
                        className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 text-xs flex items-center gap-1.5 rounded-lg transition-all border border-transparent hover:border-red-500/20 font-medium"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
