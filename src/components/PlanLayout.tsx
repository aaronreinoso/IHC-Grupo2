import { NavLink, Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

type PlanLink = {
  path: string;
  name: string;
  enabled: boolean;
  description: string;
  disabledReason?: string;
  icon: React.ReactNode;
};

interface FloatingLabelProps {
  text: string;
  description?: string;
  show: boolean;
  children: React.ReactNode;
}

const FloatingLabel: React.FC<FloatingLabelProps> = ({
  text,
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
          <p className="text-sm font-bold text-white">{text}</p>

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

export default function PlanLayout() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [hasTarea, setHasTarea] = useState(false);
  const [hasParticipante, setHasParticipante] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!planId) return;

      const { count: tareasCount } = await supabase
        .from("tareas")
        .select("*", { count: "exact", head: true })
        .eq("prueba_id", planId);

      setHasTarea((tareasCount || 0) > 0);

      const { count: sesionesCount } = await supabase
        .from("sesiones")
        .select("*", { count: "exact", head: true })
        .eq("prueba_id", planId);

      setHasParticipante((sesionesCount || 0) > 0);
    }

    fetchData();

    const handler = () => {
      fetchData();
    };

    window.addEventListener("plan-refresh", handler);

    return () => window.removeEventListener("plan-refresh", handler);
  }, [planId, location.pathname]);

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

  const lockedReason =
    "Esta sección se habilita cuando el plan tenga al menos una tarea y un participante.";

  const planLinks: PlanLink[] = [
    {
      path: `/planes-prueba/${planId}/tareas`,
      name: "Tareas del Test",
      enabled: true,
      description:
        "Crea y organiza las tareas que realizará el usuario durante la prueba de usabilidad.",
      icon: (
        <svg
          className="w-6 h-6"
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
            d="M9 5.25H7.5A2.25 2.25 0 0 0 5.25 7.5v9A2.25 2.25 0 0 0 7.5 18.75h9A2.25 2.25 0 0 0 18.75 16.5v-9A2.25 2.25 0 0 0 16.5 5.25H15m-6 0a2.25 2.25 0 1 1 4.5 0m-4.5 0a2.25 2.25 0 0 0 4.5 0m-7.5 6h6m-6 3h4.5"
          />
        </svg>
      ),
    },
    {
      path: `/planes-prueba/${planId}/participantes`,
      name: "Participantes",
      enabled: true,
      description:
        "Registra y consulta las personas que participarán en la evaluación del producto.",
      icon: (
        <svg
          className="w-6 h-6"
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
            d="M18 18.72a8.97 8.97 0 0 0 3.74-1.272A4.5 4.5 0 0 0 18 9.75m0 8.97v-.22a5.25 5.25 0 0 0-5.25-5.25H9.75A5.25 5.25 0 0 0 4.5 18.5v.22m13.5 0A11.96 11.96 0 0 1 12 20.25c-2.183 0-4.23-.584-6-1.53m12-8.97a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Zm6.75 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm-13.5 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      ),
    },
    {
      path: `/planes-prueba/${planId}/observaciones`,
      name: "Registro de Observación",
      enabled: hasTarea && hasParticipante,
      description:
        "Anota lo que ocurre durante la prueba: errores, dificultades, tiempo y comportamiento del usuario.",
      disabledReason: lockedReason,
      icon: (
        <svg
          className="w-6 h-6"
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
            d="M19.5 14.25v-8.25a2.25 2.25 0 0 0-2.25-2.25H8.25A2.25 2.25 0 0 0 6 6v12a2.25 2.25 0 0 0 2.25 2.25h6.75M16.5 18.75h6m-6-3h6m-6 6h6"
          />
        </svg>
      ),
    },
    {
      path: `/planes-prueba/${planId}/hallazgos`,
      name: "Hallazgos y Mejoras",
      enabled: hasTarea && hasParticipante,
      description:
        "Revisa los problemas encontrados y convierte las observaciones en oportunidades de mejora.",
      disabledReason: lockedReason,
      icon: (
        <svg
          className="w-6 h-6"
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
            d="M12 18v-1.5m0 0a4.5 4.5 0 1 0-4.5-4.5c0 1.61.846 3.02 2.118 3.814.24.15.382.41.382.693V18m2 0H10m2 0h2.25m-4.5 3h4.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Cerrar menú del plan"
        />
      )}

      <aside
        className={`
          bg-slate-800
          text-white
          flex
          flex-col
          shadow-xl
          z-40
          transition-all
          duration-300
          ease-in-out
          fixed
          md:static
          inset-y-0
          left-0
          h-full
          overflow-visible
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
        aria-label="Navegación del plan de prueba"
      >
        <div
          className={`
            p-6
            border-b
            border-slate-700
            flex
            flex-col
            ${isCollapsed ? "items-center px-2" : "items-start"}
          `}
        >
          <div className="flex w-full justify-between items-center mb-4">
            <FloatingLabel
              text="Volver a planes"
              description="Regresa al listado principal para elegir, crear o revisar otros planes de prueba."
              show={true}
            >
              <button
                onClick={() => navigate("/planes-prueba")}
                className={`
                  flex
                  items-center
                  rounded-lg
                  text-sm
                  text-slate-300
                  hover:text-white
                  hover:bg-slate-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-400
                  transition-colors
                  ${isCollapsed ? "justify-center w-full p-2" : "px-2 py-2"}
                `}
                aria-label="Volver a planes de prueba"
              >
                <svg
                  className={`w-5 h-5 ${isCollapsed ? "" : "mr-2"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>

                <span className={`${isCollapsed ? "sr-only" : "block"}`}>
                  Volver
                </span>
              </button>
            </FloatingLabel>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="
                hidden
                md:flex
                p-1.5
                rounded-lg
                bg-slate-700
                hover:bg-slate-600
                text-slate-300
                hover:text-white
                transition-colors
                focus:outline-none
                focus:ring-2
                focus:ring-blue-400
              "
              aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
              aria-expanded={!isCollapsed}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${
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

          <div
            className={`transition-opacity duration-200 w-full ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            <h1 className="text-xl font-bold tracking-wider text-blue-400 whitespace-nowrap">
              Detalle del Plan
            </h1>
            <p className="text-xs text-slate-400 mt-1 whitespace-nowrap">
              Gestión de recursos
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-visible">
          {planLinks.map((link) => {
            const tooltipDescription = link.enabled
              ? link.description
              : link.disabledReason || link.description;

            return link.enabled ? (
              <FloatingLabel
                key={link.path}
                text={link.name}
                description={tooltipDescription}
                show={true}
              >
                <NavLink
                  to={link.path}
                  aria-label={`${link.name}. ${link.description}`}
                  className={({ isActive }) =>
                    `
                      flex
                      w-full
                      rounded-lg
                      transition-all
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-400
                      ${
                        isCollapsed
                          ? "items-center justify-center p-3"
                          : "items-start px-4 py-3"
                      }
                      ${
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-md md:translate-x-1"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }
                    `
                  }
                >
                  <span
                    className={`flex items-center w-full ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                  >
                    {link.icon}

                    <span
                      className={`
                        ml-3
                        whitespace-nowrap
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
            ) : (
              <FloatingLabel
                key={link.path}
                text={link.name}
                description={tooltipDescription}
                show={true}
              >
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={`${link.name}. Bloqueado. ${link.disabledReason}`}
                  className={`
                    flex
                    w-full
                    rounded-lg
                    bg-slate-700
                    text-slate-400
                    opacity-80
                    cursor-not-allowed
                    select-none
                    border
                    border-slate-600
                    ${
                      isCollapsed
                        ? "items-center justify-center p-3"
                        : "items-start px-4 py-3"
                    }
                  `}
                >
                  <span
                    className={`flex items-center w-full ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                  >
                    {link.icon}

                    <span
                      className={`
                        ml-3
                        whitespace-nowrap
                        transition-opacity
                        duration-200
                        ${isCollapsed ? "sr-only" : "block"}
                      `}
                    >
                      {link.name}
                    </span>
                  </span>
                </button>
              </FloatingLabel>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center shadow-sm z-20 shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="
              text-slate-800
              hover:text-blue-700
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              rounded-lg
              p-2
            "
            aria-label="Abrir navegación del plan"
            aria-expanded={isMobileOpen}
          >
            <svg
              className="w-7 h-7"
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

          <h1 className="ml-4 font-bold text-lg text-slate-800 tracking-tight">
            Detalle del Plan
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}