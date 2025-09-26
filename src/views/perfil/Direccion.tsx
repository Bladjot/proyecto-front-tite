import { Box, Typography } from "@mui/material";

function Direccion() {
  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold">
        Dirección
      </Typography>
      <Typography sx={{ mt: 2 }}>
        Aquí podrás gestionar tu país, ciudad y dirección principal.
      </Typography>
    </Box>
  );
}

export default Direccion;
