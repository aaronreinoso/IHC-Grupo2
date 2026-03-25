import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Importaciones del Miembro 1 (Planes de Prueba)
import PlanesPruebaList from './pages/PlanesPruebaList';
import PlanPrueba from './pages/PlanPrueba';

// Importaciones del Miembro 2 (Participantes y Guion del Moderador)
import Participantes from './pages/Participantes';
import GuionModerador from './pages/GuionModerador';
import TareasList from './pages/TareasList';
import TareaForm from './pages/TareaForm';
import HallazgosMejoras from './pages/HallazgosMejoras';
import Observaciones from './pages/Observaciones';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Padre que contiene el Sidebar y el contenedor principal */}
        <Route path="/" element={<Layout />}>
          
          {/* Dashboard (Miembro 4) */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Navegación jerárquica y predecible (Criterio IHC) */}
          <Route path="planes-prueba" element={<PlanesPruebaList />} />
          <Route path="planes-prueba/nuevo" element={<PlanPrueba />} />
          <Route path="planes-prueba/editar/:id" element={<PlanPrueba />} />
          
          {/* NUEVO: Rutas anidadas Maestro-Detalle para las Tareas */}
          <Route path="planes-prueba/:planId/tareas" element={<TareasList />} />
          <Route path="planes-prueba/:planId/tareas/nueva" element={<TareaForm />} />
          <Route path="planes-prueba/:planId/tareas/editar/:tareaId" element={<TareaForm />} />
          
          <Route path="participantes" element={<Participantes />} />
          <Route path="guion" element={<GuionModerador />} />
          
          <Route path="observaciones" element={<Observaciones />} />
          <Route path="hallazgos" element={<HallazgosMejoras />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}