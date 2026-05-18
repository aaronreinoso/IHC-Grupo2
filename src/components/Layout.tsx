import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Modal from "./Modal";
import type { UsuarioPerfil } from "../types/usuario.ts";

const DEV_BYPASS_KEY = "ihc-dev-bypass-auth";

type MenuLink = {
  path: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
};

type OutletContext = {
  userProfile: UsuarioPerfil | null;
  profileLoading: boolean;
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

const getAvatarFallback = (userProfile: UsuarioPerfil | null) => {
  const source = userProfile?.nombre || userProfile?.email || "U";

  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
};

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const outletContext = useOutletContext<OutletContext | undefined>();
  const userProfile = outletContext?.userProfile ?? null;
  const profileLoading = outletContext?.profileLoading ?? false;
  const avatarFallback = getAvatarFallback(userProfile);
  const avatarUrl = userProfile?.avatar_url || "";

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      window.localStorage.removeItem(DEV_BYPASS_KEY);
      window.sessionStorage.removeItem(DEV_BYPASS_KEY);
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
      setShowSignOutModal(false);
      navigate("/login", { replace: true });
    }
  };

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
        <div className={`border-b border-slate-800 p-5 ${isCollapsed ? "px-3" : ""}`}>
          <div className={`flex items-center gap-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed && (
              <div className="min-w-0">
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

          {!isCollapsed && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 ring-1 ring-slate-700">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userProfile?.nombre || "Avatar de usuario"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-blue-300">{avatarFallback}</span>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {profileLoading ? "Cargando perfil..." : userProfile?.nombre || userProfile?.email || "Usuario autenticado"}
                </p>
                <p className="truncate text-xs uppercase tracking-[0.2em] text-slate-500">
                  {userProfile?.rol || "evaluador"}
                </p>
              </div>
            </div>
          )}
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

        <div className={`border-t border-slate-800 p-4 ${isCollapsed ? "flex justify-center" : ""}`}>
          <button
            type="button"
            onClick={() => setShowSignOutModal(true)}
            className={`
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-slate-800
              px-3
              py-2
              text-sm
              font-semibold
              text-slate-100
              transition-colors
              hover:bg-slate-700
              ${isCollapsed ? "justify-center" : "w-full justify-center"}
            `}
            aria-label="Cerrar sesión"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-7.5A2.25 2.25 0 003.75 5.25v13.5A2.25 2.25 0 006 21h7.5a2.25 2.25 0 002.25-2.25V15" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12h9m0 0-3-3m3 3-3 3" />
            </svg>
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>

          {!isCollapsed && (
            <p className="mt-3 text-center text-xs text-slate-500 whitespace-nowrap">IHC - Grupo 2</p>
          )}
        </div>
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

          <div className="ml-4 flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-blue-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userProfile?.nombre || "Avatar de usuario"} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold">{avatarFallback}</span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-slate-800">
                UX Dashboard
              </h1>
              <p className="truncate text-xs text-gray-500">
                {profileLoading ? "Cargando perfil..." : userProfile?.nombre || userProfile?.email || "Usuario"}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet context={{ userProfile, profileLoading } satisfies OutletContext} />
        </main>
      </div>

      <Modal
        open={showSignOutModal}
        onClose={() => {
          if (!signingOut) {
            setShowSignOutModal(false);
          }
        }}
        title="Confirmar cierre de sesión"
      >
        <p className="mb-6 text-sm leading-6 text-slate-600">
          ¿Está seguro de cerrar sesión?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowSignOutModal(false)}
            disabled={signingOut}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {signingOut ? "Cerrando..." : "Aceptar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}