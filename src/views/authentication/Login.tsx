import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../db/services/authService";
import logo from "../../assets/EII_logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("⚠️ Ingresa correo y contraseña");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await authService.login(email, password);
      setMessage("✅ Inicio de sesión exitoso");

      // Guardar token
      localStorage.setItem("token", response.access_token);

      setTimeout(() => navigate("/home"), 1000);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setMessage("❌ Credenciales incorrectas");
      } else {
        setMessage("❌ Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f3fff5]">
      {/* Panel lateral izquierdo */}
      <Box
        sx={{
          width: 250,
          bgcolor: "#d9fbe0",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <img alt="logo" src={logo} style={{ height: 70, margin: "0 auto" }} />
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            sx={{ mt: 2 }}
          >
            Bienvenido
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Inicia sesión para continuar
          </Typography>
        </Box>

        {/* Accesibilidad */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <span role="img" aria-label="lectura">
            🔊
          </span>
          <Typography fontSize={14}>Modo lectura</Typography>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Iniciar sesión
          </Typography>

          {/* Campo email */}
          <FormControl variant="standard">
            <InputLabel shrink>Email</InputLabel>
            <TextField
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
          </FormControl>

          {/* Campo contraseña */}
          <FormControl variant="standard">
            <InputLabel shrink>Contraseña</InputLabel>
            <TextField
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <RemoveRedEyeOutlinedIcon />
                    )}
                  </IconButton>
                ),
              }}
            />
          </FormControl>

          {/* Botón login */}
          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={handleLogin}
            sx={{
              bgcolor: "#1F4D5D",
              "&:hover": { bgcolor: "#21484A" },
              textTransform: "none",
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Ingresar"}
          </Button>

          {/* Mensajes */}
          {message && (
            <Typography
              fontSize={14}
              fontWeight={500}
              textAlign="center"
              sx={{ mt: 1 }}
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              mt: 1,
            }}
          >
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
        </Box>

        {/* Accesibilidad abajo derecha */}
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            right: 20,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography fontSize={14}>Daltonismo</Typography>
          <span>🔘</span>
        </Box>
      </Box>
    </div>
  );
}

export default Login;
