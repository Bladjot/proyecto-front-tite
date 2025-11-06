import { Box, Typography, Button } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUserRoles } from "../../utils/auth";

function Vendedor() {
  const navigate = useNavigate();
  const roles = useMemo(() => getStoredUserRoles(), []);
  const isVendedor = roles.includes("vendedor");

  if (!isVendedor) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f5f5f5",
          textAlign: "center",
          gap: 2,
          px: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          No estás acreditado como vendedor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Solicita el rol correspondiente para acceder a esta sección.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/dashboard", { replace: true })}>
          Volver al menú principal
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          p: 4,
          borderRadius: "12px",
          bgcolor: "white",
          boxShadow: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Panel de Vendedor
        </Typography>
        <Typography variant="body1">
          Aquí podrás gestionar tus productos, ventas y reportes.
        </Typography>
      </Box>
    </Box>
  );
}

export default Vendedor;
