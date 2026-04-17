import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  // Estados para controlar la responsividad
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Cerrar el menú móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Manejar el redimensionamiento de pantalla automáticamente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // 768px es el salto a móvil (md en Tailwind)
        setIsCollapsed(false); // En móvil nunca está "colapsado", se oculta entero
      } else {
        setIsMobileOpen(false); // En PC apagamos el modo móvil
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Ejecutar al inicio
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Menú global (Le quité el mr-2 a los iconos para poder centrarlos bien cuando se colapsa. El margen ahora se lo da el texto)
  const menuLinks = [
    {
      path: "/",
      name: "Dashboard General",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75V19.5A2.25 2.25 0 006.75 21.75h2.25m6 0h2.25A2.25 2.25 0 0019.5 19.5V9.75m-15 0L12 3.75m0 0l7.5 7.5" />
        </svg>
      ),
      desc: "Resumen y métricas globales.",
    },
    {
      path: "/planes-prueba",
      name: "Planes de Prueba",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25V4.5A2.25 2.25 0 0111.25 2.25h1.5A2.25 2.25 0 0115 4.5v.75" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75A2.25 2.25 0 016.75 4.5h10.5a2.25 2.25 0 012.25 2.25v12A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-12z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5h6m-6 3h6m-6 3h3" />
        </svg>
      ),
      desc: "Gestión y consulta de planes.",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* OVERLAY OSCURO PARA MÓVIL: Se sobrepone sin empujar tu contenido */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      {/* SIDEBAR ORIGINAL CON LÓGICA RESPONSIVA */}
      <aside 
        className={`bg-slate-900 text-white flex flex-col shadow-xl z-40 transition-all duration-300 ease-in-out
          fixed md:static inset-y-0 left-0 h-full
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? "justify-center px-4" : "justify-between"}`}>
          {/* Títulos: se ocultan al colapsar */}
          <div className={`transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}>
            <h1 className="text-xl font-bold tracking-wider text-blue-400 whitespace-nowrap">
              UX Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1 whitespace-nowrap">
              Evaluación de Usabilidad
            </p>
          </div>

          {/* Botón de Colapsar (Solo visible en PC) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Alternar menú"
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              title={isCollapsed ? link.name : ""} // Muestra el nombre al pasar el mouse si está recogido
              className={({ isActive }) =>
                `flex flex-col rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 
                ${isCollapsed ? "items-center justify-center p-3" : "items-start px-4 py-3"}
                ${isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md md:translate-x-1 md:scale-105"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className={`flex items-center w-full ${isCollapsed ? "justify-center" : ""}`}>
                {link.icon}
                <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}>
                  {link.name}
                </span>
              </span>
              <span className={`text-xs text-slate-400 leading-tight mt-1 ml-9 transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}>
                {link.desc}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer del menú */}
        <div className={`p-4 text-xs text-slate-500 border-t border-slate-800 text-center whitespace-nowrap transition-opacity ${isCollapsed ? "hidden" : "block"}`}>
          IHC - Grupo 2
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
        
        {/* BARRA SUPERIOR MÓVIL (Solo aparece en pantallas pequeñas para poder abrir el menú) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center shadow-sm z-20 shrink-0">
          <button 
            onClick={() => setIsMobileOpen(true)} 
            className="text-slate-800 hover:text-blue-600 focus:outline-none p-1"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-4 font-bold text-lg text-slate-800 tracking-tight">UX Dashboard</h1>
        </header>

        {/* EL CONTENIDO DE TU APP (El Outlet) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}