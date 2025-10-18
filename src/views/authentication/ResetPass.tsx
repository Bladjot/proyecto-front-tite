import {
  AppBar,
  Toolbar,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputBase,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import brandLogo from "../../assets/brand/PulgaShop.jpg";
import { authService } from "../../db/services/authService";

function ResetPass() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "warning" | "success" | "info";
  }>({ open: false, message: "", severity: "info" });
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleResetPassword = async () => {
    if (!email) {
      return setSnack({ open: true, message: "Ingresa tu correo", severity: "warning" });
    }
    if (!isValidEmail(email)) {
      return setSnack({ open: true, message: "Formato de correo no válido", severity: "error" });
    }

    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSent(true);
      setSnack({
        open: true,
        message: "Te enviamos un correo con instrucciones",
        severity: "success",
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setSnack({ open: true, message: "No existe un usuario con ese email", severity: "error" });
      } else {
        setSnack({ open: true, message: "Error al enviar el correo", severity: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* -------- BARRA SUPERIOR (igual a Login/Registro) -------- */}
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar sx={{ gap: 2 }}>
          {/* Logo en barra superior */}
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

      {/* -------- CONTENIDO -------- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "calc(100vh - 64px)",
          pt: { xs: 6, sm: 25 },
          pb: { xs: 6, sm: 10 },
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 460,
            p: { xs: 3, sm: 3 },
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.25)",
            textAlign: "center",
          }}
        >
          {/* Logo pequeño */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Box component="img" src={brandLogo} alt="PulgaShop" sx={{ height: 50 }} />
          </Box>

          <Typography variant="h6" className="h-inter" fontWeight={700} sx={{ mb: 1 }}>
            Recupera tu contraseña
          </Typography>

          {!sent ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ingresa tu correo y te enviaremos instrucciones para restablecerla.
              </Typography>

              <TextField
                label="Correo"
                type="email"
                fullWidth
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={email.length > 0 && !isValidEmail(email)}
                helperText={
                  email.length > 0 && !isValidEmail(email)
                    ? "Ingresa un correo válido (ej: nombre@dominio.com)"
                    : " "
                }
                sx={{ "& .MuiInputBase-input": { py: 1.1 } }}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                onClick={handleResetPassword}
                sx={{ mt: 0.5, py: 1.1, textTransform: "none", fontWeight: 600 }}
              >
                {loading ? <CircularProgress size={22} /> : "Enviar email"}
              </Button>
            </>
          ) : (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 56, color: "primary.main", mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                ¡Correo enviado!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Te enviamos un mensaje a <strong>{email}</strong> con los pasos para
                restablecer tu contraseña.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate("/auth/login")}
                sx={{ py: 1.1, textTransform: "none", fontWeight: 600 }}
              >
                Volver a Iniciar sesión
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  mt: 1.5,
                  textTransform: "none",
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": { borderColor: "primary.dark", bgcolor: "rgba(43,191,92,0.05)" },
                }}
                onClick={() => {
                  setSent(false);
                  setTimeout(() => {}, 0);
                }}
              >
                Usar otro correo
              </Button>
            </>
          )}
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
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

export default ResetPass;
