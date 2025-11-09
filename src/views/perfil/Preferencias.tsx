import { Box, Typography, TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { userService } from "../../db/services/userService";
import { buildPreferencesObjectFromText, parsePreferencesText } from "../../utils/preferences";

function Preferencias() {
  const [value, setValue] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await userService.getProfile();
        const rawPreferences = (profile as any)?.preferencias ?? (profile as any)?.preferences;
        setValue(parsePreferencesText(rawPreferences));
      } catch {
        setValue("");
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      const preferencesPayload = buildPreferencesObjectFromText(value) ?? {};
      await userService.saveProfileDetails({ preferencias: preferencesPayload });
      setValue(parsePreferencesText(preferencesPayload));
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
    <Box p={4} maxWidth={900} mx="auto">
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Preferencias
      </Typography>
      <TextField
        label="Escribe cualquier información que desees guardar"
        placeholder="Notas, configuraciones personales, o lo que quieras..."
        fullWidth
        multiline
        minRows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>
        Guardar Preferencias
      </Button>
    </Box>
  );
}

export default Preferencias;
