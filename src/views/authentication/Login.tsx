import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  CircularProgress,
  Divider,
  Paper,
  InputBase,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { isAxiosError } from "axios";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService, type AuthResponse } from "../../db/services/authService";
// Importar Recaptcha
import ReCAPTCHA from "react-google-recaptcha";
import { resolvePostAuthRedirect } from "../../utils/auth";

// IMPORTS DE LOGOS
import brandLogo from "../../assets/brand/PulgaShop.jpg";
import googleLogo from "../../assets/auth/google.png";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  // Snackbar / Pop-up
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "warning" | "success" | "info";
  }>({ open: false, message: "", severity: "error" });

  const navigate = useNavigate();

  // Validaciones
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPassword = (v: string) => v.length >= 6;

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("⚠️ Ingresa correo y contraseña");
      setSnack({ open: true, message: "Ingresa correo y contraseña", severity: "warning" });
      return;
    }
    if (!isValidEmail(email)) {
      setMessage("⚠️ Formato de correo no válido");
      setSnack({ open: true, message: "Formato de correo no válido", severity: "error" });
      return;
    }
    if (!isValidPassword(password)) {
      setMessage("⚠️ Contraseña inválida (mínimo 6 caracteres)");
      setSnack({
        open: true,
        message: "Contraseña inválida: mínimo 6 caracteres",
        severity: "error",
      });
      return;
    }
    if (!recaptchaToken) {
      setMessage("⚠️ Por favor, completa la verificación reCAPTCHA");
      setSnack({ open: true, message: "Completa la verificación", severity: "warning" });
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const response: AuthResponse = await authService.login(email, password, recaptchaToken);
      setMessage("✅ Inicio de sesión exitoso");
      setSnack({ open: true, message: "Inicio de sesión exitoso", severity: "success" });
      if (response?.access_token) {
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("isLoggedIn", "true");
      }
      if (response?.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      const target = resolvePostAuthRedirect(response?.redirectTo, response?.user?.roles);
      localStorage.setItem("redirectTo", target);
      setTimeout(() => navigate(target, { replace: true }), 800);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setMessage("❌ Credenciales incorrectas");
        setSnack({ open: true, message: "Credenciales incorrectas", severity: "error" });
      } else {
        setMessage("❌ Error al iniciar sesión");
        setSnack({ open: true, message: "Error al iniciar sesión", severity: "error" });
      }
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* BARRA SUPERIOR */}
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar sx={{ gap: 2 }}>
          {/* ⬇️ Reemplazamos por logo PulgaShop */}
          <Box
            component="img"
            src={brandLogo}
            alt="PulgaShop"
            sx={{ height: 50, borderRadius: 1, bgcolor: "white", p: 0.5 }}
          />
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                width: { xs: "100%", sm: 520 },
                bgcolor: "white",
                borderRadius: 1.5,
                px: 1,
                py: 0.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon fontSize="small" />
              <InputBase placeholder="Buscar..." sx={{ flex: 1, fontSize: 14 }} />
            </Box>
          </Box>
          <IconButton edge="end" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* CONTENIDO */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "calc(100vh - 64px)",
          pt: { xs: 6, sm: 10 },
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 430,
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.25)",
          }}
        >
          <Typography variant="h6" className="h-inter" fontWeight={700} textAlign="center">
            Completa tus datos para iniciar sesión
          </Typography>

          {/* ⬇️ Botón Google con ícono alineado (punto verde) */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              // Construye la URL del backend usando la variable de entorno VITE_API_BASE_URL
              // Si no está definida, usa una ruta relativa para que el proxy de Vite funcione.
              const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? "";
              const base = API_BASE.trim().replace(/\/$/, "");
              const url = base ? `${base}/api/auth/google` : "/api/auth/google";
              window.location.href = url;
            }}
            sx={{
              mt: 2,
              textTransform: "none",
              bgcolor: "white",
              borderColor: "#d0d0d0",
              color: "#444",
              "&:hover": { bgcolor: "#f5f5f5" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Box component="img" src={googleLogo} alt="Google" sx={{ width: 18, height: 18 }} />
            Continue with Google
          </Button>

          <Divider sx={{ my: 2 }} />

          {/* Email */}
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            fullWidth
            error={email.length > 0 && !isValidEmail(email)}
            helperText={
              email.length > 0 && !isValidEmail(email)
                ? "Ingresa un correo válido (ej: nombre@dominio.com)"
                : " "
            }
            sx={{ mb: 1.5, "& .MuiInputBase-input": { py: 1.1 } }}
          />

          {/* Contraseña */}
          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="small"
            fullWidth
            autoComplete="current-password"
            error={password.length > 0 && !isValidPassword(password)}
            helperText={
              password.length > 0 && !isValidPassword(password)
                ? "Mínimo 6 caracteres"
                : " "
            }
            sx={{ mb: 1.5, "& .MuiInputBase-input": { py: 1.1 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <RemoveRedEyeOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Captcha verificación */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, my: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Verificación de seguridad
            </Typography>
            
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

          {/* Botón principal */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            onClick={handleLogin}
            sx={{ py: 1.2, fontWeight: 600, textTransform: "none" }}
          >
            {loading ? <CircularProgress size={24} /> : "Ingresar"}
          </Button>

          {/* Mensaje de estado */}
          {message && (
            <Typography
              fontSize={14}
              fontWeight={500}
              textAlign="center"
              sx={{ mt: 1.5 }}
              color={
                message.startsWith("✅")
                  ? "green"
                  : message.startsWith("⚠️")
                  ? "orange"
                  : "red"
              }
            >
              {message}
            </Typography>
          )}

          {/* Links */}
          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 14, mt: 2 }}>
            <Typography
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/auth/register")}
            >
              Crear cuenta
            </Typography>
            <Typography
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/auth/forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar (pop-up) */}
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

      {/* Accesibilidad */}
      <Box sx={{ position: "fixed", left: 16, bottom: 16, fontSize: 14, color: "text.secondary" }}>
        🔊 Modo lectura
      </Box>
      <Box sx={{ position: "fixed", right: 16, bottom: 16, fontSize: 14, color: "text.secondary" }}>
        Daltonismo ⭕
      </Box>
    </Box>
  );
}

export default Login;
