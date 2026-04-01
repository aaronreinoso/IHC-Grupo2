import { NavLink, Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';


export default function PlanLayout() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  // Estado para saber si hay tareas y participantes
  const [hasTarea, setHasTarea] = useState(false);
  const [hasParticipante, setHasParticipante] = useState(false);

  // Consultar si existen tareas y participantes para el plan actual
  const location = useLocation();
  useEffect(() => {
    async function fetchData() {
      if (!planId) return;
      // Consultar tareas asociadas al plan (prueba)
      const { count: tareasCount } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('prueba_id', planId);
      setHasTarea((tareasCount || 0) > 0);
      // Consultar sesiones asociadas al plan (participantes asignados a la prueba)
      const { count: sesionesCount } = await supabase
        .from('sesiones')
        .select('*', { count: 'exact', head: true })
        .eq('prueba_id', planId);
      setHasParticipante((sesionesCount || 0) > 0);
    }
    fetchData();
    // Escuchar evento personalizado para refrescar
    const handler = () => {
    console.log("Refrescando datos por cambio en tareas...");
    fetchData();
  };
    window.addEventListener('plan-refresh', handler);
    return () => window.removeEventListener('plan-refresh', handler);
  }, [planId, location.pathname]);

  // Enlaces específicos para el contexto del plan
  const planLinks = [
    { path: `/planes-prueba/${planId}/tareas`, name: 'Tareas del Test', enabled: true, icon: <svg
      className="mr-2 w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5.25H7.5A2.25 2.25 0 0 0 5.25 7.5v9A2.25 2.25 0 0 0 7.5 18.75h9A2.25 2.25 0 0 0 18.75 16.5v-9A2.25 2.25 0 0 0 16.5 5.25H15m-6 0a2.25 2.25 0 1 1 4.5 0m-4.5 0a2.25 2.25 0 0 0 4.5 0m-7.5 6h6m-6 3h4.5"
      />
    </svg> },
    { path: `/planes-prueba/${planId}/participantes`, name: 'Participantes', enabled: true, icon: <svg
      className="mr-2 w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a8.97 8.97 0 0 0 3.74-1.272A4.5 4.5 0 0 0 18 9.75m0 8.97v-.22a5.25 5.25 0 0 0-5.25-5.25H9.75A5.25 5.25 0 0 0 4.5 18.5v.22m13.5 0A11.96 11.96 0 0 1 12 20.25c-2.183 0-4.23-.584-6-1.53m12-8.97a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Zm6.75 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm-13.5 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>},
    { path: `/planes-prueba/${planId}/observaciones`, name: 'Registro de Observación', enabled: hasTarea && hasParticipante, icon: <svg
      className="mr-2 w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-8.25a2.25 2.25 0 0 0-2.25-2.25H8.25A2.25 2.25 0 0 0 6 6v12a2.25 2.25 0 0 0 2.25 2.25h6.75M16.5 18.75h6m-6-3h6m-6 6h6"
      />
    </svg> },
    { path: `/planes-prueba/${planId}/hallazgos`, name: 'Hallazgos y Mejoras', enabled: hasTarea && hasParticipante, icon: <svg
      className="mr-2 w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-1.5m0 0a4.5 4.5 0 1 0-4.5-4.5c0 1.61.846 3.02 2.118 3.814.24.15.382.41.382.693V18m2 0H10m2 0h2.25m-4.5 3h4.5"
      />
    </svg> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar contextual del Plan */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-700">
          <button 
            onClick={() => navigate('/planes-prueba')}
            className="flex items-center text-sm text-slate-300 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Volver a Planes
          </button>
          <h1 className="text-xl font-bold tracking-wider text-blue-400">Detalle del Plan</h1>
          <p className="text-xs text-slate-400 mt-1">Gestión de recursos</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {planLinks.map((link) => (
            link.enabled ? (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center block px-2 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md translate-x-1'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ) : (
              <span
                key={link.path}
                className="flex items-center block px-2 py-3 rounded-lg bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed select-none"
                title="Debes agregar al menos una tarea y un participante para habilitar esta sección"
              >
                {link.icon}
                {link.name}
              </span>
            )
          ))}
        </nav>
      </aside>

      {/* Área de Contenido Principal del Plan */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Aquí se inyectarán las páginas (Tareas, Participantes, etc.) */}
        <Outlet /> 
      </main>
    </div>
  );
}