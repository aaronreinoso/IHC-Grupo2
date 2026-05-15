import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import Layout from "./components/Layout";
import PlanLayout from "./components/PlanLayout"; // <-- ¡Asegúrate de que esto exista!

// Importaciones del Miembro 1 (Planes de Prueba)
import PlanesPruebaList from "./pages/PlanesPruebaList";
import PlanPrueba from "./pages/PlanPrueba";

// Importaciones del Miembro 2 (Participantes y Guion del Moderador)
import Participantes from "./pages/Participantes";
import GuionModerador from "./pages/GuionModerador";
import TareasList from "./pages/TareasList";
import TareaForm from "./pages/TareaForm";
import HallazgosMejoras from "./pages/HallazgosMejoras";
import Observaciones from "./pages/Observaciones";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import AuthGuard from "./components/AuthGuard";
import GuestGuard from "./components/GuestGuard";
import RoleGuard from "./components/RoleGuard";

export default function App() {
  return (
    <BrowserRouter basename="/IHC-Grupo2">
      <Routes>
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/" element={<Login />} />

        <Route element={<AuthGuard />}>
          {/* LAYOUT GLOBAL (Dashboard y Lista de Planes) */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planes-prueba" element={<PlanesPruebaList />} />
            <Route path="/planes-prueba/editar/:id" element={<PlanPrueba />} />
            <Route element={<RoleGuard allowedRoles={['administrador']} />}>
              <Route path="/planes-prueba/nuevo" element={<PlanPrueba />} />
            </Route>
          </Route>

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
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
