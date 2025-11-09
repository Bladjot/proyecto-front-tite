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
const AdminUsers = Loadable(lazy(() => import("../views/admin/AdminUsers")));

// 👇 Perfil y subrutas
const Perfil = Loadable(lazy(() => import("../views/perfil/Perfil")));
const ModificarPerfil = Loadable(
  lazy(() => import("../views/perfil/ModificarPerfil"))
);
const DatosCuenta = Loadable(
  lazy(() => import("../views/perfil/DatosCuenta"))
);
const Preferencias = Loadable(
  lazy(() => import("../views/perfil/Preferencias"))
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
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
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
    children: [
      { path: "", element: <Perfil /> }, // Perfil principal
      { path: "modificar", element: <ModificarPerfil /> },
      { path: "cuenta", element: <DatosCuenta /> },
      { path: "preferencias", element: <Preferencias /> },
    ],
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
