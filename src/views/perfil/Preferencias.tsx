import { Box, Typography } from "@mui/material";

function Preferencias() {
  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold">
        Preferencias
      </Typography>
      <Typography sx={{ mt: 2 }}>
        Aquí podrás cambiar idioma, notificaciones y accesibilidad.
      </Typography>
    </Box>
  );
}

export default Preferencias;
