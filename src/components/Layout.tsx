import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Modal from "./Modal";
import type { UsuarioPerfil } from "../types/usuario";

type MenuLink = {
  path: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
};

type FloatingLabelProps = {
  title: string;
  description?: string;
  show: boolean;
  children: React.ReactNode;
};

const FloatingLabel = ({ title, description, show, children }: FloatingLabelProps) => {
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
          <p className="text-sm font-bold text-white">{title}</p>

          {description && (
            <p className="mt-1 text-xs leading-5 text-slate-300">{description}</p>
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

type OutletContext = {
  userProfile: UsuarioPerfil | null;
  profileLoading: boolean;
};

const getAvatarFallback = (userProfile: UsuarioPerfil | null) => {
  const source = userProfile?.nombre || userProfile?.email || 'U';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U';
};

export default function Layout() {
  // Estados para controlar la responsividad
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, profileLoading } = useOutletContext<OutletContext>();
  const avatarFallback = getAvatarFallback(userProfile);
  const avatarUrl = userProfile?.avatar_url || '';

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
    setShowSignOutModal(false);
    navigate('/login', { replace: true });
  };

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
  const menuLinks: MenuLink[] = [
    {
      path: "/dashboard",
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
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75V19.5A2.25 2.25 0 006.75 21.75h2.25m6 0h2.25A2.25 2.25 0 0019.5 19.5V9.75m-15 0L12 3.75m0 0l7.5 7.5" />
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
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25V4.5A2.25 2.25 0 0111.25 2.25h1.5A2.25 2.25 0 0115 4.5v.75" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75A2.25 2.25 0 016.75 4.5h10.5a2.25 2.25 0 012.25 2.25v12A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-12z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5h6m-6 3h6m-6 3h3" />
        </svg>
      ),
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
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? "justify-center px-4" : "justify-between"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-full bg-slate-800 ring-1 ring-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userProfile?.nombre || 'Avatar de usuario'} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-blue-300">{avatarFallback}</span>
              )}
            </div>

            {/* Títulos: se ocultan al colapsar */}
            <div className={`transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-xl font-bold tracking-wider text-blue-400 whitespace-nowrap">
                UX Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1 whitespace-nowrap">
                Evaluación de Usabilidad
              </p>
              <p className="text-xs text-slate-500 mt-2 whitespace-nowrap">
                {userProfile?.nombre || userProfile?.email || 'Usuario autenticado'}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mt-1 whitespace-nowrap">
                {userProfile?.rol || 'evaluador'}
              </p>
            </div>
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

        <nav className="flex-1 space-y-2 overflow-visible px-4 py-6">
          {menuLinks.map((link) => (
            <FloatingLabel
              key={link.path}
              title={link.name}
              description={link.desc}
              show={isCollapsed}
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

        {/* Footer del menú */}
        <div className={`p-4 border-t border-slate-800 transition-opacity ${isCollapsed ? "hidden" : "block"}`}>
          <button
            type="button"
            onClick={() => setShowSignOutModal(true)}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 transition-colors"
          >
            Cerrar sesión
          </button>
          <p className="mt-3 text-center text-xs text-slate-500 whitespace-nowrap">IHC - Grupo 2</p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
        
        {/* BARRA SUPERIOR MÓVIL (Solo aparece en pantallas pequeñas para poder abrir el menú) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center shadow-sm z-20 shrink-0 justify-between gap-3">
          <button 
            onClick={() => setIsMobileOpen(true)} 
            className="text-slate-800 hover:text-blue-600 focus:outline-none p-1"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3 ml-auto text-right">
            <div className="h-9 w-9 rounded-full bg-slate-900 text-blue-200 flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userProfile?.nombre || 'Avatar de usuario'} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold">{avatarFallback}</span>
              )}
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 tracking-tight">UX Dashboard</h1>
              <p className="text-[11px] text-slate-500">{userProfile?.nombre || userProfile?.email || 'Usuario'}</p>
            </div>
          </div>
        </header>

        {/* EL CONTENIDO DE TU APP (El Outlet) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet context={{ userProfile, profileLoading }} />
        </main>
      </div>

      <Modal
        open={showSignOutModal}
        onClose={() => {
          if (signingOut) {
            return;
          }

          setShowSignOutModal(false);
        }}
        title="Confirmar cierre de sesión"
      >
        <div style={{ marginBottom: 24, fontSize: '16px', color: '#444' }}>
          ¿Está seguro de cerrar sesión?
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: 32 }}>
          <button
            type="button"
            onClick={() => setShowSignOutModal(false)}
            disabled={signingOut}
            style={{
              fontWeight: 'bold',
              padding: '10px 20px',
              background: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: signingOut ? 'not-allowed' : 'pointer',
              opacity: signingOut ? 0.7 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              fontWeight: 'bold',
              padding: '10px 20px',
              background: '#e53935',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: signingOut ? 'not-allowed' : 'pointer',
              opacity: signingOut ? 0.7 : 1,
            }}
          >
            {signingOut ? 'Cerrando...' : 'Aceptar'}
          </button>
        </div>
      </Modal>

    </div>
  );
}