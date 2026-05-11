import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSuperadmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperadmin?: boolean;
}) {
  const { user, isLoading, isAdmin, isSuperadmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-400">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperadmin && !isSuperadmin) {
    return <Navigate to="/admin" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/client" replace />;
  }

  return <>{children}</>;
}
