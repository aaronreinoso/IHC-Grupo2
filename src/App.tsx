import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PlanLayout from './components/PlanLayout';
// Asegúrate de importar tus componentes:
import Dashboard from './pages/Dashboard';
import PlanesPruebaList from './pages/PlanesPruebaList';
import PlanPrueba from './pages/PlanPrueba'; // <-- Asumo que este es tu formulario para crear/editar planes
import TareasList from './pages/TareasList';
import GuionModerador from './pages/GuionModerador';
import HallazgosMejoras from './pages/HallazgosMejoras';
import Observaciones from './pages/Observaciones';
import Participantes from './pages/Participantes';
// ... importaciones del resto de páginas (Tareas, Participantes, etc.)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. LAYOUT GLOBAL (Dashboard y Lista de Planes) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="planes-prueba" element={<PlanesPruebaList />} />
          
          {/* ¡AQUÍ ESTÁ LA CLAVE! 
              Estas rutas deben estar explícitas bajo el Layout global para que 
              React Router sepa que "nuevo" y "editar" no son un "planId" */}
          <Route path="planes-prueba/nuevo" element={<PlanPrueba />} />
          <Route path="planes-prueba/editar/:id" element={<PlanPrueba />} />
        </Route>

        {/* 2. LAYOUT CONTEXTUAL DEL PLAN (Menú lateral específico) */}
        <Route path="/planes-prueba/:planId" element={<PlanLayout />}>
          {/* Redirección automática al entrar al detalle del plan */}
          <Route index element={<Navigate to="tareas" replace />} />
          
          <Route path="resumen" element={<div className="p-8 text-2xl font-bold text-gray-700">Resumen del Plan (En construcción)</div>} />
          <Route path="tareas" element={<TareasList />} />
          <Route path="participantes" element={<Participantes />} />
          <Route path="guion" element={<GuionModerador />} />
          <Route path="observaciones" element={<Observaciones />} />
          <Route path="hallazgos" element={<HallazgosMejoras />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;