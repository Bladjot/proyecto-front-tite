import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import InputLogin from "../../components/mui/InputLogin";
import InputPassWord from "../../components/mui/InputPassWord";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import imagenregister from "../../assets/login/default.png";
import logo from "../../assets/EII_logo.png";
import { useNavigate } from "react-router-dom";
import { userService } from "../../db/services/userService"; // 👈 conexión al backend

function Register() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Validar formato de email
  const isValidEmail = (mail: string) => /\S+@\S+\.\S+/.test(mail);

  const handleRegister = async () => {
    if (!nombre || !apellido || !email || !password || !repassword) {
      setMessage("⚠️ Todos los campos son obligatorios");
      return;
    }
    if (!isValidEmail(email)) {
      setMessage("⚠️ Ingresa un correo electrónico válido");
      return;
    }
    if (password !== repassword) {
      setMessage("⚠️ Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setMessage("⚠️ La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const newUser = {
        name: nombre,
        lastName: apellido,
        email,
        password,
        roles: ["cliente"], // opcional
        permisos: [],       // opcional
        isActive: true      // opcional
      };

      const response = await userService.createUser(newUser); // FRONT → BACK
      setMessage(`✅ Usuario ${response.email || response.name} creado con éxito`);

      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error: any) {
      // 👇 Mostrar detalle del backend en consola y pantalla
      console.error("❌ Error creando usuario:", error.response?.data || error.message);

      if (error.response?.data?.message) {
        // Si el backend devuelve un array de errores de validación
        if (Array.isArray(error.response.data.message)) {
          setMessage("❌ " + error.response.data.message.join(", "));
        } else {
          setMessage("❌ " + error.response.data.message);
        }
      } else {
        setMessage("❌ No se pudo crear el usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row justify-center items-center">
      {/* Imagen lateral */}
      <div className="hidden lg:flex justify-center items-center w-[40%] xl:w-[40%] 2xl:w-[50%] ">
        <img
          src={imagenregister}
          alt="Imagen GPI"
          className="object-cover h-full w-full"
          style={{ maxHeight: "600px", maxWidth: "fit-content" }}
        />
      </div>

      {/* Formulario */}
      <div className="flex flex-col items-center justify-center w-full md:w-[100%] lg:w-[60%] xl:w-[60%] 2xl:w-[50%] bg-white overflow-auto py-8 flex-1 min-h-screen">
        <Box
          width="100%"
          className="flex flex-col justify-center items-center max-w-[540px] gap-4"
          p={4}
        >
          <Box className="flex flex-col justify-center items-center gap-4">
            <Typography
              fontSize={22}
              lineHeight={"32px"}
              letterSpacing={"3px"}
              fontWeight={600}
              className="uppercase le"
            >
              Registro
            </Typography>
          </Box>

          <Box className="flex flex-col w-full max-w-[600px] flex-1 gap-4">
            <FormControl variant="standard">
              <InputLabel shrink>Nombres</InputLabel>
              <InputLogin
                id="nombres"
                type="text"
                autoComplete="off"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </FormControl>

            <FormControl variant="standard">
              <InputLabel shrink>Apellidos</InputLabel>
              <InputLogin
                id="apellidos"
                type="text"
                autoComplete="off"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </FormControl>

            <FormControl variant="standard">
              <InputLabel shrink>Correo electrónico</InputLabel>
              <InputLogin
                id="usuario"
                type="email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl variant="standard">
              <InputLabel shrink>Contraseña</InputLabel>
              <InputPassWord
                id="passwordLogin"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    style={{ marginRight: "10px" }}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <RemoveRedEyeOutlinedIcon />
                    )}
                  </IconButton>
                }
              />
            </FormControl>

            <FormControl variant="standard">
              <InputLabel shrink>Repite contraseña</InputLabel>
              <InputPassWord
                id="repasswordLogin"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                required
                value={repassword}
                onChange={(e) => setRepassword(e.target.value)}
                endAdornment={
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    style={{ marginRight: "10px" }}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <RemoveRedEyeOutlinedIcon />
                    )}
                  </IconButton>
                }
              />
            </FormControl>
          </Box>

          {/* Botón de registro normal */}
          <Button
            variant="outlined"
            sx={{ width: "100%" }}
            disabled={loading}
            onClick={handleRegister}
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </Button>

          {/* Botón de registro con Google */}
          <Button
            variant="contained"
            color="secondary"
            sx={{ width: "100%", mt: 2 }}
            onClick={() => {
              window.location.href = "http://localhost:3000/api/auth/google";
            }}
          >
            Registrarse con Google
          </Button>

          {/* Mensajes de estado */}
          {message && (
            <Typography
              fontSize={14}
              fontWeight={500}
              textAlign="center"
              sx={{ mt: 2 }}
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

          <Box className="flex flex-col justify-center items-center gap-2">
            <Link
              fontSize={14}
              fontWeight={500}
              textAlign="center"
              onClick={() => navigate("/auth/login")}
              sx={{ cursor: "pointer" }}
              underline="none"
            >
              ¿Ya tienes una cuenta de docente?
            </Link>
          </Box>

          <Box
            width="100%"
            className=" flex flex-col justify-center items-center mt-3 lg:hidden"
          >
            <img alt="logo" className="h-20" src={logo} />
          </Box>
        </Box>
      </div>
    </div>
  );
}

export default Register;
