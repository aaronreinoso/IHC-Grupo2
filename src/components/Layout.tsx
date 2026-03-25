import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  // Lista de todas las rutas del sistema para generar el menú dinámicamente
  const menuLinks = [
    { path: '/', name: 'Dashboard Inicio' },
    { path: '/planes-prueba', name: 'Plan de Prueba' },
    { path: '/tareas', name: 'Tareas del Test' },
    { path: '/participantes', name: 'Participantes' },
    { path: '/guion', name: 'Guion del Moderador' },
    { path: '/observaciones', name: 'Registro de Observación' },
    { path: '/hallazgos', name: 'Hallazgos y Mejoras' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar (Menú Lateral) */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider text-blue-400">UX Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Evaluación de Usabilidad</p>
        </div>
        
        {/* Navegación accesible */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md translate-x-1' // Feedback visual de pestaña activa (IHC)
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 text-xs text-slate-500 border-t border-slate-700 text-center">
          IHC - Grupo 2
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* <Outlet /> es el "hueco" donde React Router inyectará las páginas */}
        <Outlet /> 
      </main>
    </div>
  );
}