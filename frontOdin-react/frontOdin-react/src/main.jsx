// Equivale a main.ts + app.config.ts de Angular.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Bootstrap global, igual que en angular.json ("styles")
import 'bootstrap/dist/css/bootstrap.min.css'
// Registra la etiqueta <model-viewer> para el modelo 3D del login
import '@google/model-viewer'

import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter equivale a provideRouter(routes) */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
