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

      await addDoc(collection(db, 'ventas'), {
        ...formData,
        monto_total: monto,
        comision: parseFloat(comisionCalculada),
        url_pdf: pdfUrl,
        createdAt: new Date().toISOString()
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);

      setFormData({ fecha: today, nombre_cliente: '', tipo_comprobante: 'Boleta', monto_total: '', nombre_archivo_pdf: '' });
      setPdfFile(null);
      e.target.reset(); 
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      alert('Ocurrió un error al guardar la venta. Verifica tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full bg-black/20 border border-white/20 text-white placeholder-gray-400 focus:border-[#ff2a70] focus:ring-1 focus:ring-[#ff2a70] outline-none transition-all rounded-xl py-3 px-4";
  const labelStyles = "text-sm font-medium text-gray-300 block mb-2";

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 tracking-tight text-center md:text-left">Registrar Nueva Venta</h2>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className={labelStyles}>Fecha</label>
            <input 
              type="date" 
              name="fecha" 
              value={formData.fecha} 
              onChange={handleChange} 
              required
              className={inputStyles + " [color-scheme:dark]"} 
            />
          </div>

          <div>
            <label className={labelStyles}>Tipo de Comprobante</label>
            <select 
              name="tipo_comprobante" 
              value={formData.tipo_comprobante} 
              onChange={handleChange}
              className={inputStyles + " [&>option]:bg-[#1a0512] [&>option]:text-white"}
            >
              <option value="Boleta">Boleta</option>
              <option value="Factura">Factura</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelStyles}>Nombre del Cliente</label>
          <input 
            type="text" 
            name="nombre_cliente" 
            value={formData.nombre_cliente} 
            onChange={handleChange} 
            required 
            placeholder="Ej. Johan Tu Amor"
            className={inputStyles} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className={labelStyles}>Monto Total (S/)</label>
            <input 
              type="number" 
              name="monto_total" 
              value={formData.monto_total} 
              onChange={handleChange} 
              required 
              placeholder="0.00" 
              min="0" 
              step="0.01"
              className={inputStyles} 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#ff2a70] block mb-2">Comisión (1%) - Automático</label>
            <input 
              type="text" 
              value={`S/ ${comisionCalculada}`} 
              readOnly
              className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-400 outline-none rounded-xl py-3 px-4 cursor-not-allowed font-semibold transition-all" 
            />
          </div>
        </div>

        <div>
          <label className={labelStyles}>Subir PDF del vuelo</label>
          <div className="relative group flex items-center bg-black/20 border border-white/20 rounded-xl overflow-hidden transition-all focus-within:border-[#ff2a70] focus-within:ring-1 focus-within:ring-[#ff2a70]">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="bg-white/10 px-4 py-3 border-r border-white/10 text-white font-medium z-0 flex-shrink-0">
              Elegir archivo
            </div>
            <div className="px-4 py-3 text-gray-400 truncate flex-1 z-0">
              {formData.nombre_archivo_pdf || 'No se eligió ningún archivo'}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-8 bg-[#ff2a70] shadow-[0_0_20px_rgba(255,42,112,0.6)] text-white font-bold rounded-xl py-4 transition-all hover:bg-[#ff1461] hover:shadow-[0_0_25px_rgba(255,42,112,0.8)] active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isSubmitting ? 'Subiendo...' : 'Guardar Venta'}
        </button>
      </form>

      {/* Ventana Emergente de Éxito Personalizada */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-2xl px-12 py-10 rounded-[2.5rem] shadow-[0_0_40px_rgba(255,42,112,0.3)] border border-white/20 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-[#ff2a70] mb-2">
              <Heart className="animate-pulse" fill="currentColor" size={36} />
              <Heart className="animate-bounce drop-shadow-[0_0_15px_rgba(255,42,112,0.8)]" fill="currentColor" size={56} />
              <Heart className="animate-pulse" fill="currentColor" size={36} />
            </div>
            <h3 className="text-3xl font-extrabold text-white text-center tracking-tight drop-shadow-md">¡Te amo! ✨</h3>
            <p className="text-gray-200 mt-2 font-medium text-lg text-center">
              Venta guardada exitosamente,<br />¡Bien hecho Amorcito!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
