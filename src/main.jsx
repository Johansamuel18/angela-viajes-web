import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.jsx' /* Ajusta esta ruta si App.jsx está dentro de src/ (ej: './App.jsx') */
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)