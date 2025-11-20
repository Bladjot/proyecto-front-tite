import { Navigate, useLocation } from "react-router-dom";

export default function RegisterRedirect() {
  const location = useLocation();
  const search = location.search || "";
  return <Navigate to={`/auth/register${search}`} replace />;
}
