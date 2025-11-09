import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../db/services/userService";
import { isRutFormatValid, sanitiseRutInput } from "../../utils/rut";
import TopBar from "../../components/layout/TopBar";
import BottomBar from "../../components/layout/BottomBar";

function AcreditarVendedor() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [rutEmpresa, setRutEmpresa] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedStore = storeName.trim();
    const trimmedContact = contactNumber.trim();
    const trimmedRut = rutEmpresa.trim();

    if (!trimmedStore || !trimmedContact || !trimmedRut) {
      setFeedback({ type: "error", message: "Todos los campos son obligatorios." });
      return;
    }

    if (!isRutFormatValid(trimmedRut)) {
      setFeedback({ type: "error", message: "El RUT debe tener el formato 12.345.678-9." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await userService.createVendorAccreditation({
        storeName: trimmedStore,
        contactNumber: trimmedContact,
        companyRut: sanitiseRutInput(trimmedRut),
      });
      setFeedback({
        type: "success",
        message: "Solicitud enviada. Nuestro equipo revisará tu acreditación.",
      });
      setStoreName("");
      setContactNumber("");
      setRutEmpresa("");
      setTimeout(() => navigate("/vendedor", { replace: true }), 1500);
    } catch (error: unknown) {
      console.error("❌ Error creando solicitud de vendedor:", error);
      const message =
        (error as any)?.response?.data?.message ??
        (error instanceof Error ? error.message : "No se pudo enviar la solicitud");
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar
        rightSlot={
          <Button variant="outlined" color="inherit" onClick={() => navigate("/dashboard", { replace: true })} sx={{ textTransform: "none" }}>
            Volver al menú
          </Button>
        }
      />
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", px: 2, py: 6 }}>
      <Paper
        sx={{
          width: "100%",
          maxWidth: 520,
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: 4,
        }}
      >
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Solicitud de acreditación
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completa los datos de tu tienda para que podamos validar tu calidad de vendedor.
            </Typography>
          </Box>

          <TextField
            label="Nombre de tienda"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Número de contacto"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            helperText="Incluye código de país, por ejemplo +56 9 1234 5678"
            required
            fullWidth
          />

          <TextField
            label="RUT empresa"
            value={rutEmpresa}
            onChange={(e) => setRutEmpresa(e.target.value)}
            helperText="Formato esperado: 12.345.678-9"
            required
            fullWidth
          />

          {feedback && (
            <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              fullWidth
              onClick={() => navigate("/vendedor", { replace: true })}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              startIcon={<SendIcon />}
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
      </Box>
      <BottomBar />
    </Box>
  );
}

export default AcreditarVendedor;
