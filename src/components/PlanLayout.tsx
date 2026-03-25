import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';

export default function PlanLayout() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  // Enlaces específicos para el contexto del plan
  const planLinks = [
    { path: `/planes-prueba/${planId}/resumen`, name: 'Resumen del Plan' },
    { path: `/planes-prueba/${planId}/tareas`, name: 'Tareas del Test' },
    { path: `/planes-prueba/${planId}/participantes`, name: 'Participantes' },
    //{ path: `/planes-prueba/${planId}/guion`, name: 'Guion del Moderador' },
    { path: `/planes-prueba/${planId}/observaciones`, name: 'Registro de Observación' },
    { path: `/planes-prueba/${planId}/hallazgos`, name: 'Hallazgos y Mejoras' },
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