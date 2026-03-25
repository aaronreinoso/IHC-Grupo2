import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import Layout from './components/Layout';
import PlanLayout from './components/PlanLayout'; // <-- ¡Asegúrate de que esto exista!

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
        
        {/* ==========================================
            1. LAYOUT GLOBAL (Menú principal)
        ========================================== */}
        <Route path="/" element={<Layout />}>
          
          <Route index element={<Dashboard />} />
          
          {/* Rutas Base de Planes de Prueba */}
          <Route path="planes-prueba" element={<PlanesPruebaList />} />
          <Route path="planes-prueba/nuevo" element={<PlanPrueba />} />
          <Route path="planes-prueba/editar/:id" element={<PlanPrueba />} />
          
        </Route>

        {/* ==========================================
            2. LAYOUT DEL PLAN (Menú lateral secundario)
        ========================================== */}
        <Route path="/planes-prueba/:planId" element={<PlanLayout />}>
          
          {/* Si entran al plan directo, redirigimos a "tareas" */}
          <Route index element={<Navigate to="tareas" replace />} />
          
          {/* <Route path="resumen" element={<div className="p-8 text-2xl font-bold text-gray-700">Resumen del Plan (En construcción)</div>} /> */}
          
          {/* Rutas de Tareas */}
          <Route path="tareas" element={<TareasList />} />
          <Route path="tareas/nueva" element={<TareaForm />} />
          <Route path="tareas/editar/:tareaId" element={<TareaForm />} />
          
          {/* Resto de Rutas del Plan */}
          <Route path="participantes" element={<Participantes />} />
          <Route path="guion" element={<GuionModerador />} />
          <Route path="observaciones" element={<Observaciones />} />
          <Route path="hallazgos" element={<HallazgosMejoras />} />
          
        </Route>

      </Routes>
    </BrowserRouter>
  );
}