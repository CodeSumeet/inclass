import { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2 } from "lucide-react";

const ProtectedRoute: FC = () => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/auth/sign-in"
      replace
    />
  );
};

export default ProtectedRoute;
