import { NavLink, Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PlanLayout() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de datos (Lógica original)
  const [hasTarea, setHasTarea] = useState(false);
  const [hasParticipante, setHasParticipante] = useState(false);

  // Estados de Responsividad y UI (Tu aporte)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Consultar si existen tareas y participantes (Lógica original)
  useEffect(() => {
    async function fetchData() {
      if (!planId) return;
      const { count: tareasCount } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('prueba_id', planId);
      setHasTarea((tareasCount || 0) > 0);
      
      const { count: sesionesCount } = await supabase
        .from('sesiones')
        .select('*', { count: 'exact', head: true })
        .eq('prueba_id', planId);
      setHasParticipante((sesionesCount || 0) > 0);
    }
    fetchData();
    
    const handler = () => {
      console.log("Refrescando datos por cambio en tareas...");
      fetchData();
    };
    window.addEventListener('plan-refresh', handler);
    return () => window.removeEventListener('plan-refresh', handler);
  }, [planId, location.pathname]);

  // Responsividad: Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Responsividad: Manejar redimensionamiento
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
      } else {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const planLinks = [
    { 
      path: `/planes-prueba/${planId}/tareas`, 
      name: 'Tareas del Test', 
      enabled: true, 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25H7.5A2.25 2.25 0 0 0 5.25 7.5v9A2.25 2.25 0 0 0 7.5 18.75h9A2.25 2.25 0 0 0 18.75 16.5v-9A2.25 2.25 0 0 0 16.5 5.25H15m-6 0a2.25 2.25 0 1 1 4.5 0m-4.5 0a2.25 2.25 0 0 0 4.5 0m-7.5 6h6m-6 3h4.5"/></svg> 
    },
    { 
      path: `/planes-prueba/${planId}/participantes`, 
      name: 'Participantes', 
      enabled: true, 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a8.97 8.97 0 0 0 3.74-1.272A4.5 4.5 0 0 0 18 9.75m0 8.97v-.22a5.25 5.25 0 0 0-5.25-5.25H9.75A5.25 5.25 0 0 0 4.5 18.5v.22m13.5 0A11.96 11.96 0 0 1 12 20.25c-2.183 0-4.23-.584-6-1.53m12-8.97a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Zm6.75 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm-13.5 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>
    },
    { 
      path: `/planes-prueba/${planId}/observaciones`, 
      name: 'Registro de Observación', 
      enabled: hasTarea && hasParticipante, 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-8.25a2.25 2.25 0 0 0-2.25-2.25H8.25A2.25 2.25 0 0 0 6 6v12a2.25 2.25 0 0 0 2.25 2.25h6.75M16.5 18.75h6m-6-3h6m-6 6h6"/></svg> 
    },
    { 
      path: `/planes-prueba/${planId}/hallazgos`, 
      name: 'Hallazgos y Mejoras', 
      enabled: hasTarea && hasParticipante, 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-1.5m0 0a4.5 4.5 0 1 0-4.5-4.5c0 1.61.846 3.02 2.118 3.814.24.15.382.41.382.693V18m2 0H10m2 0h2.25m-4.5 3h4.5"/></svg> 
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* OVERLAY OSCURO PARA MÓVIL */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Cerrar menú del plan"
        />
      )}

      {/* SIDEBAR CONTEXTUAL DEL PLAN (Misma lógica que el Layout principal) */}
      <aside 
        className={`bg-slate-800 text-white flex flex-col shadow-xl z-40 transition-all duration-300 ease-in-out
          fixed md:static inset-y-0 left-0 h-full
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        <div className={`p-6 border-b border-slate-700 flex flex-col ${isCollapsed ? "items-center px-2" : "items-start"}`}>
          
          {/* Fila superior: Botón de Volver y Botón de Colapsar */}
          <div className="flex w-full justify-between items-center mb-4">
            <button 
              onClick={() => navigate('/planes-prueba')}
              className={`flex items-center text-sm text-slate-300 hover:text-white transition-colors ${isCollapsed ? "justify-center w-full" : ""}`}
              title="Volver a Planes"
            >
              <svg className={`w-5 h-5 ${isCollapsed ? "" : "mr-2"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span className={`${isCollapsed ? "hidden" : "block"}`}>Volver</span>
            </button>
            
            {/* Botón para colapsar (Solo PC) */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              aria-label="Alternar menú"
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className={`transition-opacity duration-200 w-full ${isCollapsed ? "hidden" : "block"}`}>
            <h1 className="text-xl font-bold tracking-wider text-blue-400 whitespace-nowrap">Detalle del Plan</h1>
            <p className="text-xs text-slate-400 mt-1 whitespace-nowrap">Gestión de recursos</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {planLinks.map((link) => (
            link.enabled ? (
              <NavLink
                key={link.path}
                to={link.path}
                title={isCollapsed ? link.name : ""}
                className={({ isActive }) =>
                  `flex flex-col rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 
                  ${isCollapsed ? "items-center justify-center p-3" : "items-start px-4 py-3"}
                  ${isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md md:translate-x-1'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <span className={`flex items-center w-full ${isCollapsed ? "justify-center" : ""}`}>
                  {link.icon}
                  <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}>
                    {link.name}
                  </span>
                </span>
              </NavLink>
            ) : (
              <span
                key={link.path}
                className={`flex flex-col rounded-lg bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed select-none
                  ${isCollapsed ? "items-center justify-center p-3" : "items-start px-4 py-3"}
                `}
                title={isCollapsed ? "Deshabilitado" : "Agrega al menos una tarea y un participante para habilitar"}
              >
                <span className={`flex items-center w-full ${isCollapsed ? "justify-center" : ""}`}>
                  {link.icon}
                  <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}>
                    {link.name}
                  </span>
                </span>
              </span>
            )
          ))}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
        
        {/* BARRA SUPERIOR MÓVIL PARA PLANES */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center shadow-sm z-20 shrink-0">
          <button 
            onClick={() => setIsMobileOpen(true)} 
            className="text-slate-800 hover:text-blue-600 focus:outline-none p-1"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-4 font-bold text-lg text-slate-800 tracking-tight">Detalle del Plan</h1>
        </header>

        {/* Aquí se inyectarán las páginas (Tareas, Participantes, etc.) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet /> 
        </main>
      </div>

    </div>
  );
}