import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "./Loadable";

/* ***Layouts**** */
const BlankLayout = Loadable(
  lazy(() => import("../layouts/blank-layout/BlankLayout"))
);
const AuthLayout = Loadable(lazy(() => import("../layouts/auth/AuthLayout")));

/* ***End Layouts**** */
const Error = Loadable(lazy(() => import("../views/authentication/Error")));

/* ****Pages***** */
const Home = Loadable(lazy(() => import("../views/home/Home")));
const Login = Loadable(lazy(() => import("../views/authentication/Login")));
const Register = Loadable(
  lazy(() => import("../views/authentication/Register"))
);
const ResetPass = Loadable(
  lazy(() => import("../views/authentication/ResetPass"))
);
const ResetPassword = Loadable(
  lazy(() => import("../views/authentication/ResetPassword"))
);
const GoogleCallback = Loadable(
  lazy(() => import("../views/authentication/GoogleCallback"))
);
const AdminUsers = Loadable(lazy(() => import("../views/admin/AdminUsers")));

// 👇 Perfil (solo vista principal)
const Perfil = Loadable(lazy(() => import("../views/perfil/Perfil")));
const RegisterRedirect = Loadable(
  lazy(() => import("./RegisterRedirect"))
);

const Vendedor = Loadable(lazy(() => import("../views/vendedor/Vendedor")));
const AcreditarVendedor = Loadable(
  lazy(() => import("../views/vendedor/AcreditarVendedor"))
);

/* ****End Pages***** */

const Router = [
  {
    path: "/error",
    element: <BlankLayout />,
    children: [{ path: "404", element: <Error /> }],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "", element: <Navigate to="/auth/login" /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ResetPass /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "google/callback", element: <GoogleCallback /> },
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
  },
  {
    path: "/register",
    element: <RegisterRedirect />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element: <Home />,
  },
  {
    path: "/perfil",
    element: <Perfil />,
  },
  {
    path: "/vendedor",
    children: [
      { path: "", element: <Vendedor /> },
      { path: "acreditacion", element: <AcreditarVendedor /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminUsers />,
  },
  {
    path: "/",
    element: <Navigate to="/home" />,
  },
  {
    path: "/error",
    element: <BlankLayout />,
    children: [
      { path: "*", element: <Navigate to="/error/404" /> },
      { path: "404", element: <Error /> },
    ],
  },
];

export default Router;
