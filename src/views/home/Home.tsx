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
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUserRoles } from "../../utils/auth";

type MenuOption = {
  label: string;
  path: string;
};

function Home() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const roles = useMemo(() => getStoredUserRoles(), []);
  const isAdmin = roles.includes("admin");

  const menuOptions = useMemo<MenuOption[]>(() => {
    const baseOptions: MenuOption[] = [
      { label: "Inicio", path: "/dashboard" },
      { label: "Perfil", path: "/perfil" },
      { label: "Vendedor", path: "/vendedor" },
    ];

    if (isAdmin) {
      baseOptions.push({ label: "Panel administrador", path: "/admin" });
    }

    return baseOptions;
  }, [isAdmin]);

  // 👇 Función para manejar clicks del menú
  const handleMenuClick = (option: MenuOption) => {
    setOpen(false); // cerrar el drawer
    navigate(option.path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("redirectTo");
    setOpen(false);
    navigate("/auth/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Botón menú hamburguesa (arriba derecha) */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{ position: "absolute", top: 20, right: 20 }}
      >
        <MenuIcon />
      </IconButton>

      {/* Drawer lateral derecho */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 200, bgcolor: "background.paper", height: "100%" }}>
          <List sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {menuOptions.map((option) => (
              <ListItem key={option.path} disablePadding>
                <ListItemButton onClick={() => handleMenuClick(option)}>
                  <ListItemText primary={option.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Box sx={{ flexGrow: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Cerrar sesión" sx={{ color: "error.main" }} />
              </ListItemButton>
            </ListItem>
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

      
    </Box>
  );
}

export default Home;
