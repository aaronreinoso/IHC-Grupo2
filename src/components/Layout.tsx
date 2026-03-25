import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  // Menú global simplificado
  const menuLinks = [
    { path: '/', name: 'Dashboard General' },
    { path: '/planes-prueba', name: 'Planes de Prueba' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider text-blue-400">UX Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Evaluación de Usabilidad</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md translate-x-1'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 text-xs text-slate-500 border-t border-slate-800 text-center">
          IHC - Grupo 2
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 relative">
        <Outlet /> 
      </main>
    </div>
  );
}