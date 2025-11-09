import { Box, Typography } from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import React from "react";

type RecaptchaPanelProps = {
  siteKey?: string;
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
  recaptchaRef?: React.RefObject<ReCAPTCHA>;
  title?: string;
};

export default function RecaptchaPanel({ siteKey, onChange, onExpired, recaptchaRef, title = "Verificación de seguridad" }: RecaptchaPanelProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, my: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {!siteKey ? (
        <Typography variant="body2" color="error.main" sx={{ width: '100%', textAlign: 'center' }}>
          Falta la clave VITE_RECAPTCHA_SITE_KEY en el .env
        </Typography>
      ) : (
        <Box sx={{ transform: { xs: 'scale(0.9)', sm: 'none' }, transformOrigin: 'center' }}>
          <ReCAPTCHA ref={recaptchaRef} sitekey={siteKey} onChange={onChange} onExpired={onExpired} />
        </Box>
      )}
    </Box>
  );
}

