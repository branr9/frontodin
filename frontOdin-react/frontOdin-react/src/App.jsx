// Equivale a app.routes.ts + app.html (<router-outlet>) de Angular.
import { Navigate, Route, Routes } from 'react-router-dom'

import Login from './paginas/Login/Login.jsx'
import Menu from './paginas/Menu/Menu.jsx'
import Radicacion from './paginas/Radicacion/Radicacion.jsx'
import GestionUsuarios from './paginas/GestionUsuarios/GestionUsuarios.jsx'
import GestionTramites from './paginas/GestionTramites/GestionTramites.jsx'
import ConsultaSeguimiento from './paginas/ConsultaSeguimiento/ConsultaSeguimiento.jsx'

export default function App() {
  return (
    <Routes>
      {/* { path: '', redirectTo: 'login' } */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      {/* Menu es el "layout": las rutas hijas se dibujan dentro de su <Outlet /> */}
      <Route path="/menu" element={<Menu />}>
        {/* { path: '', redirectTo: 'radicacion' } */}
        <Route index element={<Navigate to="radicacion" replace />} />
        <Route path="radicacion" element={<Radicacion />} />
        <Route path="gestionusuarios" element={<GestionUsuarios />} />
        <Route path="gestiontramites" element={<GestionTramites />} />
        <Route path="consultaseguimiento" element={<ConsultaSeguimiento />} />
      </Route>

      {/* Cualquier otra dirección vuelve al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
