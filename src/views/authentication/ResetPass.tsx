import { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import logo from "../../assets/EII_logo.png";
import { authService } from "../../db/services/authService";

// Estilos personalizados con styled para el botón
const ResetButton = styled(Button)(() => ({
  backgroundColor: "#1F4D5D",
  color: "#FFFFFF",
  "&:hover": {
    backgroundColor: "#21484A",
  },
  textTransform: "none",
}));

const ResetPass = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      setMessage("⚠️ Por favor, introduce tu email.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await authService.resetPassword(email);
      console.log("Respuesta backend:", response);

      setMessage("✅ Se envió un correo con instrucciones para resetear tu contraseña.");
    } catch (error: any) {
      console.error("❌ Error reset pass:", error.response?.data || error.message);

      if (error.response?.status === 404) {
        setMessage("❌ No existe un usuario con ese email.");
      } else {
        setMessage("❌ Error al enviar el correo. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#EBEBEB",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        className="bg-white rounded-xl shadow-xl p-8 pt-6 max-w-[500px] md:p-12 md:pt-8"
        sx={{
          maxWidth: { xs: "95%", sm: 500 },
        }}
      >
        {/* Logo */}
        <Box width="100%" className="flex flex-col justify-center items-center mb-4 md:mb-5">
          <img alt="logo" className="h-15 sm:h-20" src={logo} />
        </Box>

        <Typography
          variant="h5"
          component="h2"
          align="center"
          sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: "1.3rem", sm: "1.5rem" } }}
        >
          Reinicia tu contraseña
        </Typography>

        <Typography
          variant="body1"
          align="center"
          sx={{ mb: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}
        >
          Te enviaremos un email con instrucciones para restablecer tu contraseña.
        </Typography>

        {/* Input email */}
        <TextField
          label="Email asociado"
          type="email"
          fullWidth
          margin="normal"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "& fieldset": { borderColor: "#EBEBEB" },
              "&:hover fieldset": { borderColor: "#21484A" },
              "&.Mui-focused fieldset": { borderColor: "#1F4D5D" },
            },
          }}
        />

        {/* Botón */}
        <Box mt={1} display="flex" justifyContent="center">
          <ResetButton
            variant="contained"
            disabled={loading}
            onClick={handleResetPassword}
            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
          >
            {loading ? "Enviando..." : "Enviar email"}
          </ResetButton>
        </Box>

        {/* Mensaje */}
        {message && (
          <Typography
            align="center"
            sx={{ mt: 2 }}
            color={
              message.startsWith("✅") ? "green" : message.startsWith("⚠️") ? "orange" : "red"
            }
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResetPass;
