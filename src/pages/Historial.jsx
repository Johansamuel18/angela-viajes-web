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
    <div className="space-y-6">
      {/* Sección Cabecera y Controles */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Ventas</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Buscador de Cliente */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm transition-all"
            />
          </div>

          {/* Filtro por Mes */}
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 w-full sm:w-auto rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">Todos los meses</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          {/* Botón Excel */}
          <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium whitespace-nowrap">
            <FileSpreadsheet size={18} className="text-green-600" />
            Excel
          </button>
        </div>
      </div>

      {/* Interfaz de Tabla Responsiva */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse font-medium">
            Cargando historial de ventas...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-pink-50/50 text-gray-600 border-b border-pink-100">
                <tr>
                  <th className="px-4 md:px-6 py-4 font-medium">Fecha</th>
                  <th className="px-4 md:px-6 py-4 font-medium">Cliente</th>
                  <th className="px-4 md:px-6 py-4 font-medium">Monto</th>
                  <th className="px-4 md:px-6 py-4 font-semibold text-pink-600 bg-pink-50/50">Comisión (1%)</th>
                  <th className="px-4 md:px-6 py-4 font-medium">Comprobante</th>
                  <th className="px-4 md:px-6 py-4 font-medium text-center">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                      No se encontraron ventas para esta búsqueda o fecha.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-gray-600">
                        {sale.fecha}
                      </td>
                      <td className="px-4 md:px-6 py-4 font-medium text-gray-800">
                        {sale.nombre_cliente}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-600">
                        S/ {parseFloat(sale.monto_total || 0).toFixed(2)}
                      </td>
                      <td className="px-4 md:px-6 py-4 font-bold text-pink-500 bg-pink-50/30">
                        S/ {parseFloat(sale.comision || 0).toFixed(2)}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {/* Botones de visualización PDF */}
                        {sale.url_pdf ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.open(sale.url_pdf, '_blank')}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors border border-transparent shadow-sm"
                            >
                              <ExternalLink size={14} />
                              Ver PDF
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(sale.url_pdf, sale.nombre_cliente)}
                              className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-pink-600 bg-gray-50 hover:bg-pink-50 rounded-lg transition-colors border border-gray-100 shadow-sm"
                              title="Descargar PDF"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Sin PDF</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Eliminar venta"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
