import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  // Menú global simplificado

  const menuLinks = [
    {
      path: "/",
      name: "Dashboard General",
      icon: (
        <svg
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
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75V19.5A2.25 2.25 0 006.75 21.75h2.25m6 0h2.25A2.25 2.25 0 0019.5 19.5V9.75m-15 0L12 3.75m0 0l7.5 7.5"
          />
        </svg>
      ),
      desc: "Resumen y métricas globales.",
    },
    {
      path: "/planes-prueba",
      name: "Planes de Prueba",
      icon: (
        <svg
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
            d="M9 5.25V4.5A2.25 2.25 0 0111.25 2.25h1.5A2.25 2.25 0 0115 4.5v.75"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 6.75A2.25 2.25 0 016.75 4.5h10.5a2.25 2.25 0 012.25 2.25v12A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-12z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 10.5h6m-6 3h6m-6 3h3"
          />
        </svg>
      ),
      desc: "Gestion y consulta de planes.",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider text-blue-400">
            UX Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluación de Usabilidad
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-start px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-md translate-x-1 scale-105"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="flex items-center w-full">
                {link.icon}
                {link.name}
              </span>
              <span className="text-xs text-slate-400 leading-tight mt-1 ml-7">
                {link.desc}
              </span>
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
