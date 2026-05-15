import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function GuestGuard() {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setHasSession(Boolean(data.session));
      setLoading(false);
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Verificando sesión...</div>;
  }

  return hasSession ? <Navigate to="/dashboard" replace /> : <Outlet />;
}