import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SalesProvider } from './src/context/SalesContext';
import Layout from './src/components/Layout';
import Dashboard from './src/pages/Dashboard';
import NuevaVenta from './src/pages/NuevaVenta';
import Historial from './src/pages/Historial';

function App() {
  return (
    <SalesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="nueva-venta" element={<NuevaVenta />} />
            <Route path="historial" element={<Historial />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SalesProvider>
  );
}

export default App;
