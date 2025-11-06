import { Box, Typography, TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { userService } from "../../db/services/userService";

function Preferencias() {
  const [value, setValue] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const details = await userService.getProfileDetails();
        setValue((details as any)?.preferences || (details as any)?.preferencias || "");
      } catch {
        setValue("");
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      await userService.saveProfileDetails({ preferences: value });
      alert("✅ Preferencias guardadas con éxito");
    } catch (err) {
      console.error("❌ Error al guardar preferencias:", err);
      alert("❌ No se pudieron guardar las preferencias");
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
      <Button variant="contained" sx={{ mt: 2, backgroundColor: "#1F4D5D" }} onClick={handleSave}>
        Guardar Preferencias
      </Button>
    </Box>
  );
}

export default Preferencias;
