  import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
  import type { UsuarioPerfil } from '../types/usuario';

  type AuthOutletContext = {
    userProfile: UsuarioPerfil | null;
    profileLoading: boolean;
  };

  type RoleGuardProps = {
    allowedRoles: string[];
  };

  export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
    const { userProfile, profileLoading } = useOutletContext<AuthOutletContext>();

    if (profileLoading) {
      return <div className="p-8 text-center">Verificando permisos...</div>;
    }

    if (!userProfile || !allowedRoles.includes(userProfile.rol || '')) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  }