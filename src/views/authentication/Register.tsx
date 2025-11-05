import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  Divider,
  Paper,
  InputBase,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Link,
  Checkbox,
  FormControlLabel,
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
// ⬇️ NUEVOS LOGOS
import brandLogo from "../../assets/brand/PulgaShop.jpg";
import googleLogo from "../../assets/auth/google.png";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
function Register() {
  const [rut, setRut] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
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

  // Validaciones
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValidRut = (v: string) => /^\d{7,8}-[\dkK]$/.test(v.replace(/\./g, "").trim());
  const isValidPassword = (v: string) => v.length >= 6;

  const handleRegister = async () => {
    const trimmedRut = rut.trim();
    const trimmedName = nombre.trim();
    const trimmedLastName = apellidos.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedRut || !trimmedName || !trimmedLastName || !trimmedEmail || !password || !repassword) {
      return setSnack({ open: true, message: "Completa todos los campos requeridos", severity: "warning" });
    }
    if (!isValidRut(trimmedRut)) {
      return setSnack({
        open: true,
        message: "RUT inválido (ej: 12.345.678-9 o 12345678-9)",
        severity: "error",
      });
    }
    if (!isValidEmail(trimmedEmail)) {
      return setSnack({ open: true, message: "Correo no válido", severity: "error" });
    }
    if (!isValidPassword(password)) {
      return setSnack({
        open: true,
        message: "Contraseña inválida: mínimo 6 caracteres",
        severity: "error",
      });
    }
    if (password !== repassword) {
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
        name: trimmedName,
        lastName: trimmedLastName,
        rut: trimmedRut,
        email: trimmedEmail,
        password,
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
        message: `Usuario ${user?.email || trimmedEmail} creado con éxito`,
        severity: "success",
      });
      const target =
        response?.redirectTo && response.redirectTo.trim().length > 0
          ? response.redirectTo
          : "/dashboard";
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", overflowX: "hidden" }}>
      {/* Barra superior */}
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar sx={{ gap: 2 }}>
          {/* ⬇️ Logo PulgaShop más grande (50px) */}
          <Box
            component="img"
            src={brandLogo}
            alt="PulgaShop"
            sx={{ height: 50, borderRadius: 1, bgcolor: "white", p: 0.5 }}
          />
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                width: { xs: "92%", sm: 520 },
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

      {/* Contenido */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "calc(100vh - 64px)",
          pt: { xs: 4, sm: 6 },
          pb: { xs: 4, sm: 6 },
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 520,
            p: { xs: 2.5, sm: 2.3 },
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.25)",
          }}
        >
          <Typography variant="h6" className="h-inter" fontWeight={700} textAlign="center">
            Registro
          </Typography>

          {/* Google arriba con ícono real */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => (window.location.href = "http://localhost:3000/api/auth/google")}
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
            Registrarse con Google
          </Button>

          <Divider sx={{ my: 1.5 }} />

          {/* Inputs con espaciado uniforme */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <TextField
              label="RUT"
              placeholder="12.345.678-9"
              variant="outlined"
              size="small"
              fullWidth
              value={rut}
              onChange={(e) => setRut(e.target.value.replace(/k/g, "K"))}
              error={rut.trim().length > 0 && !isValidRut(rut)}
              helperText={
                rut.trim().length > 0 && !isValidRut(rut)
                  ? "Formato válido: 12.345.678-9 o 12345678-9"
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
              label="Apellidos"
              variant="outlined"
              size="small"
              fullWidth
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              helperText=" "
              sx={{ "& .MuiInputBase-input": { py: 1.05 } }}
            />

            <TextField
              label="Correo"
              type="email"
              variant="outlined"
              size="small"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={email.length > 0 && !isValidEmail(email)}
              helperText={
                email.length > 0 && !isValidEmail(email)
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              error={password.length > 0 && !isValidPassword(password)}
              helperText={
                password.length > 0 && !isValidPassword(password)
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
              value={repassword}
              onChange={(e) => setRepassword(e.target.value)}
              autoComplete="new-password"
              error={repassword.length > 0 && repassword !== password}
              helperText={repassword.length > 0 && repassword !== password ? "Las contraseñas no coinciden" : " "}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 0.5 }}>
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
    </Box>
  );
}

export default Register;
