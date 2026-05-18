import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

type MenuLink = {
  path: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
};

interface FloatingLabelProps {
  title: string;
  description?: string;
  show: boolean;
  children: React.ReactNode;
}

const FloatingLabel: React.FC<FloatingLabelProps> = ({
  title,
  description,
  show,
  children,
}) => {
  return (
    <div className="group relative w-full overflow-visible">
      {children}

      {show && (
        <div
          className="
            pointer-events-none
            absolute
            left-[calc(100%+0.75rem)]
            top-1/2
            z-[9999]
            hidden
            w-72
            -translate-y-1/2
            whitespace-normal
            rounded-xl
            border
            border-slate-600
            bg-slate-950
            px-4
            py-3
            text-left
            shadow-2xl
            group-hover:block
          "
          role="tooltip"
        >
          <p className="text-sm font-bold text-white">
            {title}
          </p>

          {description && (
            <p className="mt-1 text-xs leading-5 text-slate-300">
              {description}
            </p>
          )}

          <span
            className="
              absolute
              left-[-6px]
              top-1/2
              h-3
              w-3
              -translate-y-1/2
              rotate-45
              border-b
              border-l
              border-slate-600
              bg-slate-950
            "
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

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

  const menuLinks: MenuLink[] = [
    {
      path: "/",
      name: "Dashboard General",
      desc: "Resumen, métricas globales y estado general de las pruebas.",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75V19.5A2.25 2.25 0 006.75 21.75h2.25m6 0h2.25A2.25 2.25 0 0019.5 19.5V9.75m-15 0L12 3.75m0 0l7.5 7.5"
          />
        </svg>
      ),
    },
    {
      path: "/planes-prueba",
      name: "Planes de Prueba",
      desc: "Crea, consulta y administra planes de evaluación de usabilidad.",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
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
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Cerrar menú de navegación"
        />
      )}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-40
          flex
          h-full
          flex-col
          bg-slate-900
          text-white
          shadow-xl
          overflow-visible
          transition-all
          duration-300
          ease-in-out
          md:static
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}
        aria-label="Navegación principal"
      >
        <div
          className={`
            flex
            items-center
            border-b
            border-slate-800
            p-5
            ${isCollapsed ? "justify-center px-3" : "justify-between"}
          `}
        >
          {!isCollapsed && (
            <div>
              <h1 className="whitespace-nowrap text-xl font-bold tracking-wider text-blue-400">
                UX Dashboard
              </h1>
              <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                Evaluación de Usabilidad
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="
              hidden
              rounded-xl
              border-2
              border-blue-400
              bg-slate-800
              p-3
              text-slate-300
              transition-colors
              hover:bg-slate-700
              hover:text-white
              focus:outline-none
              focus:ring-4
              focus:ring-blue-300
              md:flex
            "
            aria-label={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
            aria-expanded={!isCollapsed}
          >
            <svg
              className={`h-6 w-6 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-visible px-4 py-6">
          {menuLinks.map((link) => (
            <FloatingLabel
              key={link.path}
              title={link.name}
              description={link.desc}
              show={true}
            >
              <NavLink
                to={link.path}
                aria-label={`${link.name}. ${link.desc}`}
                className={({ isActive }) =>
                  `
                    flex
                    w-full
                    rounded-2xl
                    transition-all
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-400
                    ${
                      isCollapsed
                        ? "items-center justify-center p-3"
                        : "items-center px-4 py-4"
                    }
                    ${
                      isActive
                        ? "bg-blue-700 text-white font-semibold shadow-md"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `
                }
              >
                <span
                  className={`flex w-full items-center ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                >
                  {link.icon}

                  <span
                    className={`
                      ml-4
                      whitespace-nowrap
                      text-lg
                      font-semibold
                      transition-opacity
                      duration-200
                      ${isCollapsed ? "sr-only" : "block"}
                    `}
                  >
                    {link.name}
                  </span>
                </span>
              </NavLink>
            </FloatingLabel>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="border-t border-slate-800 p-4 text-center text-xs text-slate-500">
            IHC - Grupo 2
          </div>
        )}
      </aside>

      <div className="relative flex h-screen flex-1 flex-col overflow-hidden bg-gray-50">
        <header className="z-20 flex shrink-0 items-center border-b border-gray-200 bg-white p-4 shadow-sm md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="
              rounded-lg
              p-2
              text-slate-800
              transition-colors
              hover:bg-blue-50
              hover:text-blue-700
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileOpen}
          >
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="ml-4">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              UX Dashboard
            </h1>
            <p className="text-xs text-gray-500">
              Evaluación de Usabilidad
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}