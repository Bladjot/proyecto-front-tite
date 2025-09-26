import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
  } from "@mui/material";
  import { useState, useEffect } from "react";
  import { userService } from "../../db/services/userService";
  
  function ModificarPerfil() {
    const [user, setUser] = useState<any>(null);
    const [photo, setPhoto] = useState("");
    const [bio, setBio] = useState("");
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const data = await userService.getProfile();
          setUser(data);
          setPhoto(data.photo || "");
          setBio(data.bio || "");
        } catch (err) {
          console.error("❌ Error cargando perfil:", err);
        }
      };
      fetchProfile();
    }, []);
  
    const handleSave = async () => {
      if (!user) return;
  
      try {
        const updated = await userService.updateUser(user._id, {
          name: user.name,
          lastName: user.lastName,
          bio,
          photo,
        });
        alert("✅ Perfil actualizado con éxito");
        setUser(updated);
      } catch (err) {
        console.error("❌ Error al actualizar perfil:", err);
        alert("❌ No se pudo actualizar el perfil");
      }
    };
  
    if (!user) return <Typography>Cargando...</Typography>;
  
    return (
      <Box className="flex flex-col items-center min-h-screen bg-[#f3fff5] p-8">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Modificar Perfil
        </Typography>
  
        {/* Foto de perfil */}
        <Avatar src={photo} sx={{ width: 120, height: 120, mb: 2 }} />
        <Button variant="contained" component="label" sx={{ mb: 3 }}>
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
  
  export default ModificarPerfil;
  