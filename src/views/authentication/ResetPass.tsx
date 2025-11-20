import { Box, Paper, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TopBar from "../../components/layout/TopBar";
import BottomBar from "../../components/layout/BottomBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";
import { authService } from "../../db/services/authService";

function ResetPass() {
  const [correo, setCorreo] = useState("");
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
    if (!correo) {
      return setSnack({ open: true, message: "Ingresa tu correo", severity: "warning" });
    }
    if (!isValidEmail(correo)) {
      return setSnack({ open: true, message: "Formato de correo no válido", severity: "error" });
    }

    setLoading(true);
    try {
      await authService.requestPasswordReset(correo);
      setSent(true);
      setSnack({
        open: true,
        message: "Te enviamos un correo con instrucciones",
        severity: "success",
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setSnack({ open: true, message: "No existe un usuario con ese correo", severity: "error" });
      } else {
        setSnack({ open: true, message: "No se pudo enviar el correo de recuperación", severity: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <TopBar logoClickable={false} />

      {/* -------- CONTENIDO -------- */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 460,
            p: { xs: 2.5, sm: 2.5 },
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.25)",
            textAlign: "center",
          }}
        >
          {/* Logo pequeño */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <BrandLogo height={50} clickable={false} />
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
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                error={correo.length > 0 && !isValidEmail(correo)}
                helperText={
                  correo.length > 0 && !isValidEmail(correo)
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
                {loading ? <CircularProgress size={22} /> : "Enviar correo"}
              </Button>
            </>
          ) : (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 56, color: "primary.main", mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                ¡Correo enviado!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Te enviamos un mensaje a <strong>{correo}</strong> con los pasos para
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
      <BottomBar />
    </Box>
  );
}

export default ResetPass;
