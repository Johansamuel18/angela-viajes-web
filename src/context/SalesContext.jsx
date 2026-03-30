import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    // Nos suscribimos en tiempo real a la colección "ventas"
    const unsubscribe = onSnapshot(collection(db, 'ventas'), (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordenar localmente por fecha de más reciente a más antiguo
      salesData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setSales(salesData);
    });

    return () => unsubscribe(); // Limpiamos la suscripción al desmontar
  }, []);

  const deleteSale = async (id) => {
    if (window.confirm('¿Estás segura de eliminar esta venta?')) {
      try {
        await deleteDoc(doc(db, 'ventas', id));
      } catch (error) {
        console.error('Error al eliminar la venta:', error);
        alert('Hubo un error al eliminar. Inténtalo nuevamente.');
      }
    }
  };

  return (
    <SalesContext.Provider value={{ sales, deleteSale }}>
      {children}
    </SalesContext.Provider>
  );
};
