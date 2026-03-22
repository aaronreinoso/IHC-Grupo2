import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PlanPrueba from './pages/PlanPrueba';
import TareasGuion from './pages/TareasGuion';
import Observaciones from './pages/Observaciones';
import HallazgosMejoras from './pages/HallazgosMejoras';

function App() {
  return (
    <BrowserRouter>
      {/* Aquí luego agregaremos un componente <Layout> para el menú lateral */}
      <div style={{ padding: '20px' }}> 
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plan-prueba" element={<PlanPrueba />} />
          <Route path="/tareas" element={<TareasGuion />} />
          <Route path="/observaciones" element={<Observaciones />} />
          <Route path="/hallazgos" element={<HallazgosMejoras />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;