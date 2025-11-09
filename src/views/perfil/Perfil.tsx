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
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../db/services/userService";
import { resolvePublicApiUrl } from "../../utils/media";
import { buildPreferencesObjectFromText, parsePreferencesText } from "../../utils/preferences";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Estado para secciones inline
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoFileRef = useRef<File | null>(null);
  const [bio, setBio] = useState("");
  const [currentBio, setCurrentBio] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
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
    const resolvedPrefsSource =
      (userData as any)?.preferencias ??
      (userData as any)?.preferences ??
      resolvedPrefs;
    const resolvedPrefsText = parsePreferencesText(resolvedPrefsSource);
    setCurrentPreferences(resolvedPrefsText);

    // Estados de edición
    const resolvedPhoto = resolvePublicApiUrl((userData as any).photo);
    if (!photoFileRef.current) {
      setPhoto(resolvedPhoto);
    }
    setCurrentPhoto(resolvedPhoto);
    setPhotoFile(null);
    setBio(String(resolvedBio || ""));
    setName((userData as any).name || "");
    setLastName((userData as any).lastName || "");
    const resolvedEmail = (details as any)?.email ?? (userData as any)?.email ?? "";
    setEmail(resolvedEmail);
    const resolvedTelefono =
      (details as any)?.telefono ??
      (details as any)?.phone ??
      (userData as any)?.telefono ??
      (userData as any)?.phone ??
      "";
    setPhone(resolvedTelefono);
    setPreferencesText(resolvedPrefsText);
  };

  useEffect(() => {
    refreshProfile().catch((err) => console.error("❌ Error cargando perfil:", err));
  }, []);

  useEffect(() => {
    photoFileRef.current = photoFile;
  }, [photoFile]);

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
          const resolvedPrefs =
            (userData as any)?.preferencias ??
            (userData as any)?.preferences ??
            (details as any)?.preferences ??
            (details as any)?.preferencias ??
            "";
          setCurrentBio(String(resolvedBio || ""));
          setCurrentPreferences(parsePreferencesText(resolvedPrefs));
          const resolvedPhoto = resolvePublicApiUrl((userData as any).photo);
          setCurrentPhoto(resolvedPhoto);
          if (!photoFileRef.current) {
            setPhoto(resolvedPhoto);
          }
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
      const preferencesPayload = buildPreferencesObjectFromText(preferencesText) ?? {};
      const response = await userService.saveProfileDetails({
        name,
        lastName,
        biografia: bio,
        foto: photoFile,
        preferencias: preferencesPayload,
      });

      const serverBio = (response as any)?.biografia;
      if (typeof serverBio === "string") {
        setCurrentBio(serverBio);
        setBio(serverBio);
      } else {
        setCurrentBio(bio);
      }

      const serverPhoto =
        typeof (response as any)?.fotoUrl === "string"
          ? String((response as any).fotoUrl)
          : typeof (response as any)?.foto === "string"
            ? resolvePublicApiUrl((response as any).foto)
            : "";
      if (serverPhoto) {
        setPhoto(serverPhoto);
        setCurrentPhoto(serverPhoto);
      }

      if (preferencesPayload) {
        const prefsText = parsePreferencesText(preferencesPayload);
        setCurrentPreferences(prefsText);
        setPreferencesText(prefsText);
      }

      setPhotoFile(null);

      setUser((prev: any) =>
        prev
          ? {
              ...prev,
              name,
              lastName,
              ...(serverPhoto ? { photo: serverPhoto } : {}),
              ...(preferencesPayload ? { preferencias: preferencesPayload } : {}),
            }
          : prev
      );

      // Re-cargar para asegurar mostrar lo último guardado (desde backend)
      await refreshProfile();

      alert("✅ Perfil actualizado con éxito");
    } catch (err) {
      console.error("❌ Error al actualizar perfil:", err);
      if (err instanceof Error && err.message.includes("No hay cambios")) {
        alert("⚠️ No hay cambios para guardar");
      } else {
        alert("❌ No se pudo actualizar el perfil");
      }
    }
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    if (password && password !== confirmPassword) {
      alert("⚠️ Las contraseñas no coinciden");
      return;
    }
    if (password && password.length < 6) {
      alert("⚠️ La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password && !currentPasswordInput) {
      alert("⚠️ Debes ingresar tu contraseña actual para cambiarla");
      return;
    }
    try {
      const response = await userService.saveProfileDetails({
        email,
        telefono: phone,
        ...(password
          ? {
              currentPassword: currentPasswordInput,
              newPassword: password,
            }
          : {}),
      });
      const responseEmail = typeof (response as any)?.email === "string" ? String((response as any).email) : null;
      const responsePhone =
        typeof (response as any)?.telefono === "string"
          ? String((response as any).telefono)
          : typeof (response as any)?.phone === "string"
            ? String((response as any).phone)
            : null;

      if (responseEmail) {
        setEmail(responseEmail);
      }
      if (responsePhone) {
        setPhone(responsePhone);
      }
      setUser((prev: any) =>
        prev
          ? {
              ...prev,
              ...(responseEmail ? { email: responseEmail } : {}),
              ...(responsePhone ? { phone: responsePhone, telefono: responsePhone } : {}),
            }
          : prev
      );
      alert("✅ Datos de cuenta actualizados con éxito");
      await refreshProfile();
      if (password) {
        setCurrentPasswordInput("");
      }
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
      const preferencesPayload = buildPreferencesObjectFromText(preferencesText) ?? {};
      await userService.saveProfileDetails({
        preferencias: preferencesPayload,
      });
      const prefsText = parsePreferencesText(preferencesPayload);
      setCurrentPreferences(prefsText);
      setPreferencesText(prefsText);
      setUser((prev: any) => (prev ? { ...prev, preferencias: preferencesPayload } : prev));
      await refreshProfile();
      alert("✅ Preferencias guardadas con éxito");
    } catch (err) {
      console.error("❌ Error al guardar preferencias:", err);
      if (err instanceof Error && err.message.includes("No hay cambios")) {
        alert("⚠️ No hay cambios para guardar");
      } else {
        alert("❌ No se pudieron guardar las preferencias");
      }
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
          <Avatar src={currentPhoto || undefined} sx={{ width: 80, height: 80, fontSize: 36 }}>
            🙂
          </Avatar>
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
              accept="image/png, image/jpeg, image/webp"
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  if (file.size > MAX_PHOTO_SIZE) {
                    alert("⚠️ La imagen debe pesar máximo 2MB");
                    return;
                  }
                  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
                    alert("⚠️ Formato no soportado. Usa JPG, PNG o WebP");
                    return;
                  }
                  setPhoto(URL.createObjectURL(file));
                  setPhotoFile(file);
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
          label="Contraseña actual"
          type="password"
          fullWidth
          margin="normal"
          value={currentPasswordInput}
          onChange={(e) => setCurrentPasswordInput(e.target.value)}
          helperText="Requerida solo si deseas cambiar tu contraseña"
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
