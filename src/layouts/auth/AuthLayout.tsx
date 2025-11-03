import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const normaliseRedirect = (redirectTo?: string | null) =>
  redirectTo && redirectTo.trim().length > 0 ? redirectTo : null;

const safeParseUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.warn("[auth] No se pudo parsear el usuario almacenado", error);
    return null;
  }
};

function AuthLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!loggedIn) return;

      const storedRedirect = normaliseRedirect(localStorage.getItem("redirectTo"));
      if (storedRedirect) {
        navigate(storedRedirect, { replace: true });
        return;
      }

      const storedUser = safeParseUser();
      const roles = Array.isArray(storedUser?.roles)
        ? storedUser.roles.map((role: string) => role.toLowerCase())
        : [];
      const target = roles.includes("admin") ? "/admin" : "/dashboard";
      navigate(target, { replace: true });
    };

    setTimeout(() => {
      checkLoginStatus();
      setIsLoading(false);
    }, 300);
  }, [navigate]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return <Outlet />;
}

export default AuthLayout;
