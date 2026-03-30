import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function NuevaVenta() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fecha: today,
    nombre_cliente: '',
    tipo_comprobante: 'Boleta',
    monto_total: '',
    nombre_archivo_pdf: ''
  });

  // Cálculo en tiempo real
  const comisionCalculada = formData.monto_total
    ? (parseFloat(formData.monto_total) * 0.01).toFixed(2)
    : '0.00';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setFormData({ ...formData, nombre_archivo_pdf: file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monto = parseFloat(formData.monto_total);
    if (isNaN(monto) || monto <= 0) {
      alert('Por favor, ingresa un monto válido mayor a 0.');
      return;
    }

    if (!pdfFile) {
      alert('Por favor, selecciona el archivo PDF del vuelo.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Subir PDF a Cloudinary
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      const formDataUpload = new FormData();
      formDataUpload.append('file', pdfFile);
      formDataUpload.append('upload_preset', uploadPreset);

      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: formDataUpload
      });

      if (!cloudinaryResponse.ok) {
        throw new Error('Error al subir el archivo a Cloudinary');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const pdfUrl = cloudinaryData.secure_url;

      // 2. Guardar los datos de la venta en Firestore
      await addDoc(collection(db, 'ventas'), {
        ...formData,
        monto_total: monto,
        comision: parseFloat(comisionCalculada),
        url_pdf: pdfUrl, // URL pública para descargar/ver
        createdAt: new Date().toISOString()
      });

      // Mostramos la ventana emergente hermosa por 3.5 segundos
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);

      setFormData({ fecha: today, nombre_cliente: '', tipo_comprobante: 'Boleta', monto_total: '', nombre_archivo_pdf: '' });
      setPdfFile(null);
      e.target.reset(); // Limpia el input visual de archivos
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      alert('Ocurrió un error al guardar la venta. Verifica tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-[2rem] border border-pink-100 shadow-sm shadow-pink-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nueva Venta</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Tipo de Comprobante</label>
            <select name="tipo_comprobante" value={formData.tipo_comprobante} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white transition-all">
              <option value="Boleta">Boleta</option>
              <option value="Factura">Factura</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Nombre del Cliente</label>
          <input type="text" name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange} required placeholder="Ej. Johan Tu Amor"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Monto Total (S/)</label>
            <input type="number" name="monto_total" value={formData.monto_total} onChange={handleChange} required placeholder="0.00" min="0" step="0.01"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-pink-600">Comisión (1%) - Automático</label>
            <input type="text" value={`S/ ${comisionCalculada}`} readOnly
              className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/50 text-pink-600 font-bold focus:outline-none cursor-not-allowed" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Subir PDF del vuelo</label>
          <input type="file" accept=".pdf" onChange={handleFileChange} required
            className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 transition-all cursor-pointer" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 rounded-xl transition-all shadow-md shadow-pink-200 active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isSubmitting ? 'Subiendo...' : 'Guardar Venta'}
        </button>
      </form>

      {/* Ventana Emergente de Éxito Personalizada */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white px-12 py-10 rounded-[2.5rem] shadow-2xl shadow-pink-200/80 border border-pink-100 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-pink-400 mb-2">
              <Heart className="animate-pulse" fill="currentColor" size={36} />
              <Heart className="animate-bounce" fill="currentColor" size={56} />
              <Heart className="animate-pulse" fill="currentColor" size={36} />
            </div>
            <h3 className="text-3xl font-extrabold text-gray-800 text-center tracking-tight">¡Te amo! ✨</h3>
            <p className="text-pink-500 font-medium text-lg text-center">
              Venta guardada exitosamente,<br />¡Bien hecho Amorcito!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
