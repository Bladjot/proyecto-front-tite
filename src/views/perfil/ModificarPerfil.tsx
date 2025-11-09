import { Box, Typography, TextField, Button, Avatar } from "@mui/material";
import { useState, useEffect } from "react";
import { userService } from "../../db/services/userService";
import { resolvePublicApiUrl } from "../../utils/media";
import { buildPreferencesObjectFromText, parsePreferencesText } from "../../utils/preferences";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ModificarPerfil() {
  const [user, setUser] = useState<any>(null);
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [preferencesText, setPreferencesText] = useState("");

  const fetchProfile = async () => {
    try {
      const [userData, details] = await Promise.all([
        userService.getProfile(),
        userService.getProfileDetails().catch(() => ({} as any)),
      ]);
      setUser(userData);
      setPhoto(resolvePublicApiUrl(userData.photo));
      setPhotoFile(null);
      const resolvedBio = (details as any)?.bio ?? (details as any)?.biografia ?? "";
      setBio(String(resolvedBio || ""));
      const resolvedPrefsSource =
        (userData as any)?.preferencias ??
        (userData as any)?.preferences ??
        (details as any)?.preferencias ??
        (details as any)?.preferences;
      setPreferencesText(parsePreferencesText(resolvedPrefsSource));
    } catch (err) {
      console.error("❌ Error cargando perfil:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    try {
      const preferencesPayload = buildPreferencesObjectFromText(preferencesText);
      const response = await userService.saveProfileDetails({
        name: user.name,
        lastName: user.lastName,
        biografia: bio,
        foto: photoFile,
        preferencias: preferencesPayload,
      });
      const serverBio = (response as any)?.biografia;
      if (typeof serverBio === "string") {
        setBio(serverBio);
      }
      const serverPhoto =
        typeof (response as any)?.fotoUrl === "string"
          ? String((response as any).fotoUrl)
          : typeof (response as any)?.foto === "string"
            ? resolvePublicApiUrl((response as any).foto)
            : "";
      if (serverPhoto) {
        setPhoto(serverPhoto);
      }
      if (preferencesPayload) {
        setPreferencesText(parsePreferencesText(preferencesPayload));
      }
      setPhotoFile(null);
      await fetchProfile();
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

  if (!user) return <Typography>Cargando...</Typography>;

  return (
    <Box className="flex flex-col items-center min-h-screen bg-[#f3fff5] p-8">
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Modificar Perfil
      </Typography>

      {/* Foto de perfil */}
      <Avatar src={photo} sx={{ width: 120, height: 120, mb: 2 }}>
        🙂
      </Avatar>
      <Button variant="contained" component="label" sx={{ mb: 3 }}>
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

      {/* Nombre */}
      <TextField
        label="Nombre"
        fullWidth
        margin="normal"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />

      {/* Apellido */}
      <TextField
        label="Apellido"
        fullWidth
        margin="normal"
        value={user.lastName}
        onChange={(e) => setUser({ ...user, lastName: e.target.value })}
      />

      {/* Biografía */}
      <TextField
        label="Biografía"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      {/* Preferencias */}
      <TextField
        label="Preferencias"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        placeholder="Puedes escribir un JSON o texto libre"
        value={preferencesText}
        onChange={(e) => setPreferencesText(e.target.value)}
      />

      <Button variant="contained" sx={{ mt: 3, backgroundColor: "#1F4D5D" }} onClick={handleSave}>
        Guardar Cambios
      </Button>
    </Box>
  );
}

export default ModificarPerfil;
