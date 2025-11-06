import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  TextField,
  Button,
  Avatar,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../db/services/userService";

function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Estado para secciones inline
  const [photo, setPhoto] = useState("");
  const [bio, setBio] = useState("");
  const [currentBio, setCurrentBio] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferencesText, setPreferencesText] = useState("");
  const [currentPreferences, setCurrentPreferences] = useState("");

  // Helper para sincronizar con backend y poblar estados de edición y de visualización
  const refreshProfile = async () => {
    const [userData, details] = await Promise.all([
      userService.getProfile(),
      userService.getProfileDetails().catch(() => ({} as any)),
    ]);

    setUser(userData);

    // Resolver desde endpoint de detalles
    const resolvedBio = (details as any)?.bio ?? (details as any)?.biografia ?? "";
    const resolvedPrefs = (details as any)?.preferences ?? (details as any)?.preferencias ?? "";

    // Estados actuales (lo que viene del backend)
    setCurrentBio(String(resolvedBio || ""));
    setCurrentPreferences(String(resolvedPrefs || ""));

    // Estados de edición
    setPhoto((userData as any).photo || "");
    setBio(String(resolvedBio || ""));
    setName((userData as any).name || "");
    setLastName((userData as any).lastName || "");
    setEmail((userData as any).email || "");
    setPhone((userData as any).phone || "");
    setPreferencesText(String(resolvedPrefs || ""));
  };

  useEffect(() => {
    refreshProfile().catch((err) => console.error("❌ Error cargando perfil:", err));
  }, []);

  // Auto-actualización periódica del panel de información actual (sin pisar campos en edición)
  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        try {
          const [userData, details] = await Promise.all([
            userService.getProfile(),
            userService.getProfileDetails().catch(() => ({} as any)),
          ]);
          setUser(userData);
          const resolvedBio = (details as any)?.bio ?? (details as any)?.biografia ?? "";
          const resolvedPrefs = (details as any)?.preferences ?? (details as any)?.preferencias ?? "";
          setCurrentBio(String(resolvedBio || ""));
          setCurrentPreferences(String(resolvedPrefs || ""));
        } catch (e) {
          console.warn("⚠️ Auto-refresh de perfil falló:", e);
        }
      })();
    }, 10000); // cada 10s
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = (option: string) => {
    if (option === "Perfil") navigate("/perfil");
    else if (option === "Vendedor") navigate("/vendedor");
    else console.log(`Opción ${option} en construcción`);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      // 1) Guardar biografía y preferencias (acción principal, PATCH)
      await userService.saveProfileDetails({ bio, preferences: preferencesText });

      // 2) Mejor esfuerzo para nombre/apellido (no hace fallar la acción principal)
      if (user && user._id) {
        try {
          await userService.updateUser(user._id, { name, lastName });
        } catch (e) {
          console.warn("No se pudo actualizar nombre/apellido:", e);
        }
      }

      // Re-cargar para asegurar mostrar lo último guardado (desde backend)
      await refreshProfile();

      alert("✅ Perfil actualizado con éxito");
    } catch (err) {
      console.error("❌ Error al actualizar perfil:", err);
      alert("❌ No se pudo actualizar el perfil");
    }
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    if (password && password !== confirmPassword) {
      alert("⚠️ Las contraseñas no coinciden");
      return;
    }
    try {
      const updated = await userService.updateUser(user._id, {
        email,
        phone,
        ...(password ? { password } : {}),
      });
      alert("✅ Datos de cuenta actualizados con éxito");
      setUser(updated);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("❌ Error al actualizar datos de cuenta:", err);
      alert("❌ No se pudo actualizar los datos");
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    try {
      await userService.saveProfileDetails({ preferences: preferencesText });
      await refreshProfile();
      alert("✅ Preferencias guardadas con éxito");
    } catch (err) {
      console.error("❌ Error al guardar preferencias:", err);
      alert("❌ No se pudieron guardar las preferencias");
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f3fff5]">
      {/* Sidebar lateral izquierdo */}
      <Box
        sx={{
          width: 220,
          bgcolor: "#d9fbe0",
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: "center" }}>
            Configuraciones
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ mb: 2, backgroundColor: "#1F4D5D" }}
            onClick={() => navigate("/home")}
            fullWidth
          >
            Menú principal
          </Button>
          <List>
            {["Perfil", "Vendedor", "X", "X"].map((text, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMenuClick(text)}>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          gap: 4,
        }}
      >
        {/* Header con datos de usuario */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            width: "100%",
            maxWidth: 900,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            🙂
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {user ? `${user.name} ${user.lastName}` : "Cargando..."}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ width: "100%", maxWidth: 900 }} />

        {/* Información actual: Bio y Preferencias (siempre desde backend) */}
        <Paper sx={{ p: 3, width: "100%", maxWidth: 900 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Información actual
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Biografía
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {currentBio?.trim() ? currentBio : "Sin información"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Preferencias
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {currentPreferences?.trim() ? currentPreferences : "Sin información"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Sección: Modificar perfil */}
        <Paper sx={{ p: 3, width: "100%", maxWidth: 900 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Modificar perfil
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <Avatar src={photo} sx={{ width: 72, height: 72 }} />
            <Button variant="outlined" component="label">
              Subir nueva foto
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0];
                    setPhoto(URL.createObjectURL(file));
                  }
                }}
              />
            </Button>
          </Box>
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Apellido"
            fullWidth
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Biografía"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <Button variant="contained" sx={{ mt: 2, backgroundColor: "#1F4D5D" }} onClick={handleSaveProfile}>
            Guardar Cambios
          </Button>
        </Paper>

        {/* Sección: Datos de cuenta */}
        <Paper sx={{ p: 3, width: "100%", maxWidth: 900 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Datos de cuenta
          </Typography>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Teléfono"
            type="tel"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Nueva contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirmar contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button variant="contained" sx={{ mt: 2, backgroundColor: "#1F4D5D" }} onClick={handleSaveAccount}>
            Guardar Cambios
          </Button>
        </Paper>

        {/* Sección: Preferencias */}
        <Paper sx={{ p: 3, width: "100%", maxWidth: 900, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Preferencias
          </Typography>
          <TextField
            label="Escribe cualquier información que desees guardar"
            placeholder="Notas, configuraciones personales, o lo que quieras..."
            fullWidth
            multiline
            minRows={4}
            value={preferencesText}
            onChange={(e) => setPreferencesText(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ mt: 2, backgroundColor: "#1F4D5D" }}
            onClick={handleSavePreferences}
          >
            Guardar Preferencias
          </Button>
        </Paper>
      </Box>
    </div>
  );
}

export default Perfil;
