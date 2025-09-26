import {
    Box,
    Typography,
    TextField,
    Button,
  } from "@mui/material";
  import { useState, useEffect } from "react";
  import { userService } from "../../db/services/userService";
  
  function DatosCuenta() {
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const data = await userService.getProfile();
          setUser(data);
          setEmail(data.email || "");
          setPhone(data.phone || "");
        } catch (err) {
          console.error("❌ Error cargando datos de cuenta:", err);
        }
      };
      fetchProfile();
    }, []);
  
    const handleSave = async () => {
      if (!user) return;
  
      if (password && password !== confirmPassword) {
        alert("⚠️ Las contraseñas no coinciden");
        return;
      }
  
      try {
        const updated = await userService.updateUser(user._id, {
          email,
          phone,
          ...(password ? { password } : {}), // 👈 solo si se cambia
        });
  
        alert("✅ Datos de cuenta actualizados con éxito");
        setUser(updated);
      } catch (err) {
        console.error("❌ Error al actualizar datos de cuenta:", err);
        alert("❌ No se pudo actualizar los datos");
      }
    };
  
    if (!user) return <Typography>Cargando...</Typography>;
  
    return (
      <Box className="flex flex-col items-center min-h-screen bg-[#f3fff5] p-8">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Datos de Cuenta
        </Typography>
  
        {/* Correo */}
        <TextField
          label="Correo electrónico"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
  
        {/* Teléfono */}
        <TextField
          label="Teléfono"
          type="tel"
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
  
        {/* Contraseña */}
        <TextField
          label="Nueva contraseña"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
  
        {/* Confirmación */}
        <TextField
          label="Confirmar contraseña"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
  
        <Button
          variant="contained"
          sx={{ mt: 3, backgroundColor: "#1F4D5D" }}
          onClick={handleSave}
        >
          Guardar Cambios
        </Button>
      </Box>
    );
  }
  
  export default DatosCuenta;
  