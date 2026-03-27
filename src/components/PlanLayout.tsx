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
    const handler = () => fetchData();
    window.addEventListener('plan-refresh', handler);
    return () => window.removeEventListener('plan-refresh', handler);
  }, [planId, location.pathname]);

  // Enlaces específicos para el contexto del plan
  const planLinks = [
    { path: `/planes-prueba/${planId}/tareas`, name: 'Tareas del Test', enabled: true },
    { path: `/planes-prueba/${planId}/participantes`, name: 'Participantes', enabled: true },
    { path: `/planes-prueba/${planId}/observaciones`, name: 'Registro de Observación', enabled: hasTarea && hasParticipante },
    { path: `/planes-prueba/${planId}/hallazgos`, name: 'Hallazgos y Mejoras', enabled: hasTarea && hasParticipante },
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
                  `block px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md translate-x-1'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ) : (
              <span
                key={link.path}
                className="block px-4 py-3 rounded-lg bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed select-none"
                title="Debes agregar al menos una tarea y un participante para habilitar esta sección"
              >
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