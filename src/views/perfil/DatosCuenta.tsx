import {
    Box,
    Typography,
    TextField,
    Button,
  } from "@mui/material";
  import { useState, useEffect, useMemo } from "react";
  import { userService } from "../../db/services/userService";
  
  function DatosCuenta() {
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Demo sin backend para /perfil/cuenta
    const isDemoMode = useMemo(() => {
      try {
        const noToken = !localStorage.getItem("token");
        const qs = typeof window !== "undefined" ? window.location.search : "";
        const queryFlag = qs.includes("demoPerfil=true") || qs.includes("demoPerfil=1");
        return noToken || queryFlag;
      } catch {
        return true;
      }
    }, []);
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          if (isDemoMode) {
            const demo = {
              _id: "u-demo",
              name: "Usuario",
              lastName: "Demo",
              email: "usuario@demo.local",
              phone: "+56 9 5555 5555",
            } as any;
            setUser(demo);
            setEmail(demo.email);
            setPhone(demo.phone);
            return;
          }
          const data = await userService.getProfile();
          setUser(data);
          setEmail(data.email || "");
          setPhone(data.phone || "");
        } catch (err) {
          console.error("❌ Error cargando datos de cuenta:", err);
        }
      };
      fetchProfile();
    }, [isDemoMode]);
  
    const handleSave = async () => {
      if (!user) return;

      if (password && password !== confirmPassword) {
        alert("⚠️ Las contraseñas no coinciden");
        return;
      }

      try {
        if (isDemoMode) {
          setUser((prev: any) => (prev ? { ...prev, email, phone } : prev));
          alert("✅ Datos de cuenta actualizados (demo)");
        } else {
          const updated = await userService.updateUser(user._id, {
            email,
            phone,
            ...(password ? { password } : {}),
          });
          alert("✅ Datos de cuenta actualizados con éxito");
          setUser(updated);
        }
      } catch (err) {
        console.error("❌ Error al actualizar datos de cuenta:", err);
        alert("❌ No se pudo actualizar los datos");
      }
    };
  
    if (!user) return <Typography>Cargando...</Typography>;
  
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", bgcolor: "background.default", p: 8 }}>
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
          sx={{ mt: 3 }}
          onClick={handleSave}
        >
          Guardar Cambios
        </Button>
      </Box>
    );
  }
  
  export default DatosCuenta;
  
