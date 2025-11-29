import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PulgashopFooter from "../../components/layout/PulgashopFooter";
import TopBar from "../../components/layout/TopBar";
import {
  authService,
  type AuthUser,
  type GoogleCallbackResponse,
} from "../../db/services/authService";
import { resolvePostAuthRedirect } from "../../utils/auth";

type Status = "loading" | "redirecting" | "error";

const buildUserFromProfile = (
  profile: GoogleCallbackResponse["profile"]
): AuthUser | null => {
  if (!profile?.correo) return null;

  return {
    id: "",
    correo: profile.correo,
    nombre: profile.nombre ?? "",
    apellido: profile.apellido ?? "",
    rut: undefined,
    telefono: undefined,
    roles: [],
    permisos: [],
    activo: undefined,
    foto: profile.picture,
    creado_en: undefined,
    actualizado_en: undefined,
  };
};

export default function GoogleCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const statusMessage = useMemo(() => {
    if (status === "redirecting") return "Listo, redirigiendo a tu cuenta...";
    if (status === "error") return "No se pudo completar el acceso con Google.";
    return "Procesando autenticación con Google...";
  }, [status]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const state = params.get("state");
    const googleError = params.get("error");

    if (googleError) {
      setStatus("error");
      setErrorMessage(
        googleError === "access_denied"
          ? "Se canceló el inicio de sesión con Google."
          : `Google devolvió un error (${googleError}).`
      );
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage(
        "Falta el código de autorización. Intenta iniciar sesión con Google nuevamente."
      );
      return;
    }

    const handleCallback = async () => {
      try {
        const data = await authService.googleCallback({ code, state });

        if (data.requiresRegistration) {
          const registerPath = "/auth/register";
          const postRegisterRedirect =
            data.redirectTo && !/\/register\/?$/i.test(data.redirectTo) ? data.redirectTo : null;
          if (postRegisterRedirect) {
            sessionStorage.setItem("postGoogleRedirect", postRegisterRedirect);
          }

          const search = new URLSearchParams();
          search.set("fromGoogle", "1");
          if (postRegisterRedirect) search.set("redirectTo", postRegisterRedirect);
          if (data.profile?.correo) search.set("correo", data.profile.correo);
          if (data.profile?.nombre) search.set("nombre", data.profile.nombre);
          if (data.profile?.apellido) search.set("apellido", data.profile.apellido);

          navigate(`${registerPath}?${search.toString()}`, { replace: true });
          return;
        }

        if (!data.access_token) {
          throw new Error(
            data.message || "No se recibió token de acceso desde el backend."
          );
        }

        const userFromProfile = buildUserFromProfile(data.profile);
        const resolvedUser = data.user ?? userFromProfile ?? undefined;

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("isLoggedIn", "true");
        if (resolvedUser) {
          localStorage.setItem("user", JSON.stringify(resolvedUser));
        }

        const target = resolvePostAuthRedirect(
          data.redirectTo ?? "/home",
          resolvedUser?.roles
        );
        localStorage.setItem("redirectTo", target);

        setStatus("redirecting");
        navigate(target, { replace: true });
      } catch (error: unknown) {
        const apiMessage =
          isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : error instanceof Error
              ? error.message
              : "No se pudo completar el inicio de sesión con Google.";

        setStatus("error");
        setErrorMessage(
          Array.isArray(apiMessage) ? apiMessage.join(", ") : String(apiMessage)
        );
      }
    };

    handleCallback();
  }, [location.search, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar logoClickable={false} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 2.5, sm: 3 },
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.2)",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700} className="h-inter">
            Accediendo con Google
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {statusMessage}
          </Typography>

          <Box sx={{ mt: 2.5, mb: 1.5 }}>
            {status === "error" ? (
              <Alert severity="error" sx={{ textAlign: "left" }}>
                {errorMessage || "Ocurrió un problema al validar con Google."}
              </Alert>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            )}
          </Box>

          {status === "error" && (
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1, textTransform: "none" }}
              onClick={() => navigate("/auth/login", { replace: true })}
            >
              Volver al inicio de sesión
            </Button>
          )}
        </Paper>
      </Box>

      <PulgashopFooter />
    </Box>
  );
}
