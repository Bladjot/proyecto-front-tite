import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { resolvePostAuthRedirect, safeParseStoredUser } from "../../utils/auth";

function AuthLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!loggedIn) return;

      const storedRedirect = localStorage.getItem("redirectTo");
      const storedUser = safeParseStoredUser();
      const target = resolvePostAuthRedirect(storedRedirect, storedUser?.roles);
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
