Resumen de componentes reutilizables

- CenteredCard (src/components/CenteredCard.tsx)
  - Contenedor centrado que envuelve un Paper con ancho máximo, padding y borde estándar.
  - Útil para formularios y bloques centrales (login, registro, recuperación, etc.).

- SectionTitle (src/components/SectionTitle.tsx)
  - Título de sección con tipografía consistente (variant h6, negrita, centrado y fuente de títulos).
  - Uso rápido para encabezados dentro de tarjetas.

- RecaptchaPanel (src/components/RecaptchaPanel.tsx)
  - Bloque de reCAPTCHA con rótulo “Verificación de seguridad” y escala en pantallas pequeñas.
  - Recibe siteKey, onChange/onExpired y ref opcional al componente ReCAPTCHA.

- SearchField (src/components/SearchField.tsx)
  - Campo de búsqueda con ícono de lupa como adornment inicial, basado en MUI TextField.
  - Ideal para listas filtrables (ej. usuarios en Admin).

- InfoSnackbar (src/components/InfoSnackbar.tsx)
  - Snackbar + Alert preconfigurado para mensajes de estado consistentes.
  - Props: open, message, severity, onClose, autoHideDuration.

Notas de uso
- Estos componentes no sustituyen automáticamente los existentes en vistas; sirven como base común para homogeneizar UI.
- Se pueden ir adoptándolos gradualmente en Login, Register, ResetPass, Admin, Perfil, etc.

