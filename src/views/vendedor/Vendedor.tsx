import { Box, Typography } from "@mui/material";

function Vendedor() {
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
