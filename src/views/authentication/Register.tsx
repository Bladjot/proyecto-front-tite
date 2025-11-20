import { Box, Button, IconButton, Typography, TextField, Divider, Paper, Snackbar, Alert, CircularProgress, InputAdornment, Link, Checkbox, FormControlLabel } from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { isAxiosError } from "axios";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService, type AuthResponse } from "../../db/services/authService";
import { normaliseRut, sanitiseRutInput, isRutFormatValid } from "../../utils/rut";
import { resolvePostAuthRedirect } from "../../utils/auth";
// Importar Recaptcha
import ReCAPTCHA from "react-google-recaptcha";
import TopBar from "../../components/layout/TopBar";
import BottomBar from "../../components/layout/BottomBar";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
function Register() {
  const [rut, setRut] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [terms, setTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "warning" | "success" | "info";
  }>({ open: false, message: "", severity: "info" });
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [postGoogleRedirect, setPostGoogleRedirect] = useState<string | null>(null);

  useEffect(() => {
    const provider = searchParams.get("provider");
    const fromGoogle =
      (provider && provider.toLowerCase() === "google") ||
      searchParams.get("fromGoogle") === "1";
    if (!fromGoogle) return;

    const nombreParam = (searchParams.get("nombre") || "").trim();
    const apellidoParam = (searchParams.get("apellido") || "").trim();
    const correoParam = (searchParams.get("correo") || "").trim().toLowerCase();
    const redirectParam = searchParams.get("redirectTo");

    if (nombreParam) {
      setNombre((prev) => (prev ? prev : nombreParam));
    }
    if (apellidoParam) {
      setApellido((prev) => (prev ? prev : apellidoParam));
    }
    if (correoParam) {
      setCorreo((prev) => (prev ? prev : correoParam));
    }
    if (redirectParam && !/\/register\/?$/i.test(redirectParam)) {
      sessionStorage.setItem("postGoogleRedirect", redirectParam);
      setPostGoogleRedirect(redirectParam);
    }

    setSnack({
      open: true,
      message: "Completa tu registro agregando el RUT para finalizar el acceso con Google.",
      severity: "info",
    });
  }, [searchParamsKey]);

  useEffect(() => {
    if (postGoogleRedirect) return;
    const stored = sessionStorage.getItem("postGoogleRedirect");
    if (stored) {
      setPostGoogleRedirect(stored);
    }
  }, [postGoogleRedirect]);

  // Validaciones
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValidRut = (value: string) => isRutFormatValid(value);
  const isValidPassword = (v: string) => v.length >= 6;

  const handleRegister = async () => {
    const trimmedRut = rut.trim();
    const trimmedNombre = nombre.trim();
    const trimmedApellido = apellido.trim();
    const trimmedCorreo = correo.trim().toLowerCase();

    if (!trimmedRut || !trimmedNombre || !trimmedApellido || !trimmedCorreo || !contrasena || !confirmarContrasena) {
      return setSnack({ open: true, message: "Completa todos los campos requeridos", severity: "warning" });
    }
    if (!isValidRut(trimmedRut)) {
      return setSnack({
        open: true,
        message: "RUT inválido (usa el formato 12.345.678-9)",
        severity: "error",
      });
    }
    const normalisedRut = normaliseRut(trimmedRut);
    if (!isValidEmail(trimmedCorreo)) {
      return setSnack({ open: true, message: "Correo no válido", severity: "error" });
    }
    if (!isValidPassword(contrasena)) {
      return setSnack({
        open: true,
        message: "Contraseña inválida: mínimo 6 caracteres",
        severity: "error",
      });
    }
    if (contrasena !== confirmarContrasena) {
      return setSnack({ open: true, message: "Las contraseñas no coinciden", severity: "error" });
    }
    if (!terms) {
      return setSnack({ open: true, message: "Debes aceptar los términos de servicio", severity: "warning" });
    }
    if (!recaptchaToken) {
      return setSnack({ open: true, message: "Por favor, completa la verificación reCAPTCHA", severity: "warning" });
    }
    setLoading(true);
    try {
      const payload = {
        nombre: trimmedNombre,
        apellido: trimmedApellido,
        rut: normalisedRut,
        correo: trimmedCorreo,
        contrasena,
        recaptchaToken,
      };
      const response: AuthResponse = await authService.register(payload);
      const { user, access_token } = response || {};
      if (access_token) {
        localStorage.setItem("token", access_token);
        localStorage.setItem("isLoggedIn", "true");
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      setSnack({
        open: true,
        message: `Usuario ${user?.correo || trimmedCorreo} creado con éxito`,
        severity: "success",
      });
      const target = postGoogleRedirect
        ? resolvePostAuthRedirect(postGoogleRedirect, response?.user?.roles)
        : resolvePostAuthRedirect(response?.redirectTo, response?.user?.roles);
      sessionStorage.removeItem("postGoogleRedirect");
      localStorage.setItem("redirectTo", target);
      setTimeout(() => navigate(target, { replace: true }), 900);
    } catch (error: unknown) {
      const responseMessage =
        isAxiosError(error) && error.response?.data?.message !== undefined
          ? error.response.data.message
          : error instanceof Error
          ? error.message
          : "No se pudo crear el usuario";
      const apiMsg = Array.isArray(responseMessage)
        ? responseMessage.filter((msg): msg is string => typeof msg === "string").join(", ")
        : typeof responseMessage === "string"
        ? responseMessage
        : "No se pudo crear el usuario";
      setSnack({ open: true, message: `Error: ${apiMsg}`, severity: "error" });
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", overflowX: "hidden", display: "flex", flexDirection: "column" }}>
      <TopBar logoClickable={false} />

      {/* Contenido */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 520,
            p: { xs: 2, sm: 2 },
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.25)",
          }}
        >
          <Typography variant="h6" className="h-inter" fontWeight={700} textAlign="center">
            Registro
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          {/* Inputs con espaciado uniforme */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              label="RUT"
              placeholder="12.345.678-9"
              variant="outlined"
              size="small"
              fullWidth
              value={rut}
              onChange={(e) => setRut(sanitiseRutInput(e.target.value))}
              error={rut.trim().length > 0 && !isValidRut(rut)}
              helperText={
                rut.trim().length > 0 && !isValidRut(rut)
                  ? "Formato requerido: 12.345.678-9"
                  : " "
              }
              sx={{ "& .MuiInputBase-input": { py: 1.05 } }}
            />

            <TextField
              label="Nombre"
              variant="outlined"
              size="small"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              helperText=" "
              sx={{ "& .MuiInputBase-input": { py: 1.05 } }}
            />

            <TextField
              label="Apellido"
              variant="outlined"
              size="small"
              fullWidth
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              helperText=" "
              sx={{ "& .MuiInputBase-input": { py: 1.05 } }}
            />

            <TextField
              label="Correo"
              type="email"
              variant="outlined"
              size="small"
              fullWidth
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              error={correo.length > 0 && !isValidEmail(correo)}
              helperText={
                correo.length > 0 && !isValidEmail(correo)
                  ? "Ingresa un correo válido (ej: nombre@dominio.com)"
                  : " "
              }
              sx={{ "& .MuiInputBase-input": { py: 1.05 } }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              size="small"
              fullWidth
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="new-password"
              error={contrasena.length > 0 && !isValidPassword(contrasena)}
              helperText={
                contrasena.length > 0 && !isValidPassword(contrasena)
                  ? "Mínimo 6 caracteres"
                  : " "
              }
              sx={{ "& .MuiInputBase-input": { py: 1.05 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <RemoveRedEyeOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirmar contraseña"
              type={showRePassword ? "text" : "password"}
              variant="outlined"
              size="small"
              fullWidth
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              autoComplete="new-password"
              error={confirmarContrasena.length > 0 && confirmarContrasena !== contrasena}
              helperText={
                confirmarContrasena.length > 0 && confirmarContrasena !== contrasena ? "Las contraseñas no coinciden" : " "
              }
              sx={{ "& .MuiInputBase-input": { py: 1.05 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowRePassword((s) => !s)} edge="end">
                      {showRePassword ? <VisibilityOffOutlinedIcon /> : <RemoveRedEyeOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {/* ReCAPTCHA */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, mb: 0.5 }}>
            {!RECAPTCHA_SITE_KEY ? (
              <Alert severity="error" sx={{ width: '100%' }}>
                Falta la clave VITE_RECAPTCHA_SITE_KEY en el .env
              </Alert>
            ) : (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
              />
            )}
          </Box>
          {/* Checkbox centrado */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
            <FormControlLabel
              control={<Checkbox checked={terms} onChange={(e) => setTerms(e.target.checked)} />}
              label="Aceptar términos de servicio"
            />
          </Box>

          {/* Botón principal */}
          <Button
            variant="outlined"
            fullWidth
            disabled={loading}
            onClick={handleRegister}
            sx={{
              mt: 1.5,
              borderColor: "primary.main",
              color: "primary.main",
              textTransform: "none",
              "&:hover": { borderColor: "primary.dark", bgcolor: "rgba(43,191,92,0.05)" },
            }}
          >
            {loading ? <CircularProgress size={22} /> : "Crear cuenta"}
          </Button>

          {/* Link inferior */}
          <Box sx={{ mt: 1.25, textAlign: "center" }}>
            <Link component="button" variant="body2" underline="none" onClick={() => navigate("/auth/login")}>
              ¿Ya tienes una cuenta?
            </Link>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          elevation={2}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
      <BottomBar />
    </Box>
  );
}

export default Register;
