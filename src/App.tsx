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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Padre que contiene el Sidebar y el contenedor principal */}
        <Route path="/" element={<Layout />}>
          
          {/* Dashboard (Miembro 4) */}
          <Route index element={
            <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-10">
              <h2 className="text-3xl font-bold text-gray-400">Dashboard Principal</h2>
              <p className="text-gray-500 mt-2">Módulo en construcción (Miembro 4)</p>
            </div>
          } />
          
          {/* Navegación jerárquica y predecible (Criterio IHC) */}
          <Route path="planes-prueba" element={<PlanesPruebaList />} />
          <Route path="planes-prueba/nuevo" element={<PlanPrueba />} />
          <Route path="planes-prueba/editar/:id" element={<PlanPrueba />} />
          
          <Route path="/tareas" element={<TareasList />} />
          <Route path="/tarea" element={<TareaForm />} />
          <Route path="/tarea/:id" element={<TareaForm />} />
          
          <Route path="participantes" element={<Participantes />} />
          <Route path="guion" element={<GuionModerador />} />
          
          <Route path="observaciones" element={<Observaciones />} />
          <Route path="hallazgos" element={<HallazgosMejoras />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}