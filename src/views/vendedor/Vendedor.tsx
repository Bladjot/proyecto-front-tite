import { Box, Typography, Button, Stack, CircularProgress } from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUserRoles } from "../../utils/auth";
import { normaliseRoleValue, userService } from "../../db/services/userService";

function Vendedor() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState(() => getStoredUserRoles());
  const [syncing, setSyncing] = useState(false);
  const isVendedor = roles.includes("vendedor");

  const syncRolesFromApi = useCallback(async () => {
    try {
      setSyncing(true);
      const profile = await userService.getProfile();
      const resolvedRoles = Array.isArray(profile.roles)
        ? profile.roles.map((role) => normaliseRoleValue(role)).filter(Boolean)
        : [];
      setRoles(resolvedRoles);
      try {
        const storedRaw = localStorage.getItem("user");
        const stored = storedRaw ? JSON.parse(storedRaw) : {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            ...profile,
            roles: resolvedRoles,
          })
        );
      } catch (error) {
        console.warn("[vendedor] No se pudo sincronizar el usuario almacenado", error);
      }
    } catch (error) {
      console.error("[vendedor] No se pudo sincronizar roles:", error);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    setRoles(getStoredUserRoles());
    syncRolesFromApi();
    const interval = setInterval(syncRolesFromApi, 5000);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "user") {
        setRoles(getStoredUserRoles());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncRolesFromApi]);

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
        {syncing && <CircularProgress size={24} />}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
          <Button
            variant="contained"
            startIcon={<VerifiedOutlinedIcon />}
            onClick={() => navigate("/vendedor/acreditacion")}
          >
            Acredítate como vendedor
          </Button>
          <Button variant="outlined" onClick={() => navigate("/dashboard", { replace: true })}>
            Volver al menú principal
          </Button>
        </Stack>
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
        <Typography variant="body1" sx={{ mb: 3 }}>
          Aquí va el grupo de tienda.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/dashboard", { replace: true })}>
          Volver al menú
        </Button>
      </Box>
    </Box>
  );
}

export default Vendedor;
