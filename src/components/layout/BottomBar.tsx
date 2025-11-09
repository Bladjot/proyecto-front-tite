import { Box, Typography } from "@mui/material";

export default function BottomBar() {
  const year = new Date().getFullYear();
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        py: 1,
        px: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="caption">
        Pulga Shop • Contacto: +56 9 1234 5678 • © {year} Todos los derechos reservados
      </Typography>
    </Box>
  );
}

