import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import type { UsuarioPerfil } from "../types/usuario.ts";

const DEV_BYPASS_KEY = "ihc-dev-bypass-auth";

type OutletContext = {
  userProfile: UsuarioPerfil | null;
  profileLoading: boolean;
};

export default function AuthGuard() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [bypassActive, setBypassActive] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const loadUserProfile = async (userId: string) => {
    setProfileLoading(true);

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, email, rol, avatar_url, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }

    setUserProfile((data as UsuarioPerfil | null) ?? null);
    setProfileLoading(false);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const requestedBypass =
      searchParams.get("bypassAuth") === "1" ||
      searchParams.get("skipLogin") === "1";

    if (requestedBypass) {
      try {
        window.localStorage.setItem(DEV_BYPASS_KEY, "1");
      } catch (_) {}

      setBypassActive(true);
      void navigate(location.pathname, { replace: true });
      setLoading(false);
      return;
    }

    const storedBypass = window.localStorage.getItem(DEV_BYPASS_KEY) === "1";
    if (storedBypass) {
      setBypassActive(true);
      setLoading(false);
      return;
    }

    // Revisar sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        await loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        void loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading)
    return <div className="p-8 text-center">Verificando sesión...</div>;

  // Si no hay sesión pero el bypass temporal está activo, permitir entrar.
  return session || bypassActive ? (
    <Outlet context={{ userProfile, profileLoading } satisfies OutletContext} />
  ) : (
    <Navigate to="/login" replace />
  );
}
