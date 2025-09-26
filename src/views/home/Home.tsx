import {
  Box,
  Typography,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // 👇 Función para manejar clicks del menú
  const handleMenuClick = (option: string) => {
    setOpen(false); // cerrar el drawer
    if (option === "Perfil") {
      navigate("/perfil");
    } else if (option === "Vendedor") {
      navigate("/vendedor");
    } else {
      console.log(`Opción ${option} en construcción`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3fff5]">
      {/* Botón menú hamburguesa (arriba derecha) */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{ position: "absolute", top: 20, right: 20 }}
      >
        <MenuIcon />
      </IconButton>

      {/* Drawer lateral derecho */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 200, bgcolor: "#d9fbe0", height: "100%" }}>
          <List>
            {["Perfil", "Vendedor", "X", "X"].map((text, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => handleMenuClick(text)}>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Título */}
      <Typography variant="h3" fontWeight={700} sx={{ mt: 4, mb: 6 }}>
        Menú
      </Typography>

      {/* Cuadro central */}
      <Paper
        elevation={3}
        sx={{
          width: 300,
          height: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">En construcción...</Typography>
      </Paper>

      {/* Accesibilidad abajo izquierda */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 20,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <span role="img" aria-label="lectura">🔊</span>
        <Typography fontSize={14}>Modo lectura</Typography>
      </Box>

      {/* Accesibilidad abajo derecha */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography fontSize={14}>Daltonismo</Typography>
        <span style={{ marginLeft: "4px" }}>🔘</span>
      </Box>
    </div>
  );
}

export default Home;
