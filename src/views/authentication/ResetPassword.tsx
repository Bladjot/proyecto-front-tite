import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";
import PulgashopFooter from "../../components/layout/PulgashopFooter";
import TopBar from "../../components/layout/TopBar";
import { authService } from "../../db/services/authService";

const MIN_PASSWORD_LENGTH = 6;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "warning" | "success" | "info";
  }>({ open: false, message: "", severity: "info" });

  const isValidPassword = (v: string) => v.trim().length >= MIN_PASSWORD_LENGTH;

  const handleSubmit = async () => {
    if (!token) {
      return setSnack({
        open: true,
        message: "No encontramos un token de recuperación. Solicita un nuevo correo.",
        severity: "error",
      });
    }
    if (!isValidPassword(nuevaContrasena)) {
      return setSnack({
        open: true,
        message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        severity: "warning",
      });
    }
    if (nuevaContrasena !== confirmacion) {
      return setSnack({
        open: true,
        message: "Las contraseñas no coinciden.",
        severity: "warning",
      });
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, nuevaContrasena });
      setSuccess(true);
      setSnack({
        open: true,
        message: "Contraseña actualizada. Ya puedes iniciar sesión.",
        severity: "success",
      });
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 400) {
          setSnack({
            open: true,
            message: "El enlace es inválido o expiró. Solicita uno nuevo.",
            severity: "error",
          });
        } else if (status === 404) {
          setSnack({
            open: true,
            message: "No encontramos una cuenta asociada a este enlace.",
            severity: "error",
          });
        } else {
          setSnack({
            open: true,
            message: "No pudimos restablecer la contraseña. Inténtalo nuevamente.",
            severity: "error",
          });
        }
      } else {
        setSnack({
          open: true,
          message: "Ocurrió un error al restablecer la contraseña.",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!token) {
      return (
        <>
          <Typography variant="h6" className="h-inter" fontWeight={700} sx={{ mb: 1 }}>
            Necesitamos un enlace válido
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            El enlace para restablecer tu contraseña es inválido o está incompleto. Solicita un nuevo correo de
            recuperación para continuar.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/auth/forgot-password")}
            sx={{ py: 1.1, textTransform: "none", fontWeight: 600 }}
          >
            Enviar nuevo correo
          </Button>
        </>
      );
    }

    if (success) {
      return (
        <>
          <CheckCircleOutlineIcon sx={{ fontSize: 56, color: "primary.main", mb: 1 }} />
          <Typography variant="h6" className="h-inter" fontWeight={700} sx={{ mb: 1 }}>
            ¡Tu contraseña fue actualizada!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ya puedes iniciar sesión con tu nueva contraseña.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/auth/login")}
            sx={{ py: 1.1, textTransform: "none", fontWeight: 600 }}
          >
            Ir al inicio de sesión
          </Button>
        </>
      );
    }

    return (
      <>
        <LockResetOutlinedIcon sx={{ fontSize: 44, color: "primary.main", mb: 0.5 }} />
        <Typography variant="h6" className="h-inter" fontWeight={700} sx={{ mb: 1 }}>
          Define una nueva contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          El enlace es válido por tiempo limitado. Usa una contraseña segura que recuerdes.
        </Typography>

        <TextField
          label="Nueva contraseña"
          type={showPassword ? "text" : "password"}
          fullWidth
          size="small"
          value={nuevaContrasena}
          onChange={(e) => setNuevaContrasena(e.target.value)}
          error={nuevaContrasena.length > 0 && !isValidPassword(nuevaContrasena)}
          helperText={
            nuevaContrasena.length > 0 && !isValidPassword(nuevaContrasena)
              ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`
              : " "
          }
          sx={{ "& .MuiInputBase-input": { py: 1.1 }, mb: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirmar contraseña"
          type={showPassword ? "text" : "password"}
          fullWidth
          size="small"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          error={confirmacion.length > 0 && confirmacion !== nuevaContrasena}
          helperText={
            confirmacion.length > 0 && confirmacion !== nuevaContrasena
              ? "Debe coincidir con la nueva contraseña"
              : " "
          }
          sx={{ "& .MuiInputBase-input": { py: 1.1 }, mb: 1.5 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          onClick={handleSubmit}
          sx={{ py: 1.1, textTransform: "none", fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={22} /> : "Guardar nueva contraseña"}
        </Button>
        <Button
          variant="text"
          fullWidth
          sx={{ mt: 1, textTransform: "none", fontWeight: 600 }}
          onClick={() => navigate("/auth/forgot-password")}
        >
          ¿Problemas con el enlace? Solicita otro
        </Button>
      </>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <TopBar logoClickable={false} />

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
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <BrandLogo height={50} clickable={false} />
          </Box>

          {renderContent()}
        </Paper>
      </Box>

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
      <PulgashopFooter />
    </Box>
  );
}

export default ResetPassword;
