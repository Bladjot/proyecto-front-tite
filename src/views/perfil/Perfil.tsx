import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
  } from "@mui/material";
  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { userService } from "../../db/services/userService";
  
  function Perfil() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const data = await userService.getProfile();
          setUser(data);
        } catch (err) {
          console.error("❌ Error cargando perfil:", err);
        }
      };
      fetchProfile();
    }, []);
  
    const handleMenuClick = (option: string) => {
      if (option === "Perfil") navigate("/perfil");
      else if (option === "Vendedor") navigate("/vendedor");
      else console.log(`Opción ${option} en construcción`);
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
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2, textAlign: "center" }}
            >
              Configuraciones
            </Typography>
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
          }}
        >
          {/* Header con datos de usuario */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 50,
              }}
            >
              👤
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
  
          <Divider sx={{ width: "80%", mb: 4 }} />
  
          {/* Botones centrales */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
              maxWidth: 600,
              width: "100%",
            }}
          >
            <Paper
              elevation={3}
              sx={{ p: 3, textAlign: "center", cursor: "pointer" }}
              onClick={() => navigate("/perfil/modificar")}
            >
              <Typography variant="h6">Modificar perfil</Typography>
              <Typography variant="body2" color="text.secondary">
                Cambio de foto, biografía, nombre
              </Typography>
            </Paper>
  
            <Paper
              elevation={3}
              sx={{ p: 3, textAlign: "center", cursor: "pointer" }}
              onClick={() => navigate("/perfil/cuenta")}
            >
              <Typography variant="h6">Datos de cuenta</Typography>
              <Typography variant="body2" color="text.secondary">
                Cambio de correo, contraseña, teléfono
              </Typography>
            </Paper>
  
            <Paper
              elevation={3}
              sx={{ p: 3, textAlign: "center", cursor: "pointer" }}
              onClick={() => navigate("/perfil/direccion")}
            >
              <Typography variant="h6">Dirección</Typography>
              <Typography variant="body2" color="text.secondary">
                País, ciudad, dirección, código postal
              </Typography>
            </Paper>
  
            <Paper
              elevation={3}
              sx={{ p: 3, textAlign: "center", cursor: "pointer" }}
              onClick={() => navigate("/perfil/preferencias")}
            >
              <Typography variant="h6">Preferencias</Typography>
              <Typography variant="body2" color="text.secondary">
                Idioma, notificaciones, accesibilidad
              </Typography>
            </Paper>
          </Box>
        </Box>
      </div>
    );
  }
  
  export default Perfil;
  