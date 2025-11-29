Resumen de componentes reutilizables

- BrandLogo (src/components/BrandLogo.tsx)
  - Logotipo SVG de PulgaShop para headers o formularios.

- CenteredCard (src/components/CenteredCard.tsx)
  - Contenedor centrado con Paper, padding y ancho maximo. Util para formularios y bloques centrales.

- CircularLoader (src/components/CircularLoader.tsx)
  - Loader circular configurado con los colores del tema.

- GoogleAuthButton (src/components/GoogleAuthButton.tsx)
  - Boton preconfigurado para autenticacion con Google.

- InfoSnackbar (src/components/InfoSnackbar.tsx)
  - Snackbar + Alert para mensajes de estado. Props: open, message, severity, onClose, autoHideDuration.

- ModeView (src/components/ModeView.tsx)
  - Wrapper que alterna tema claro/oscuro en funcion de un toggle.

- RecaptchaPanel (src/components/RecaptchaPanel.tsx)
  - Bloque de reCAPTCHA con rotulo de verificacion y soporte de siteKey, onChange, onExpired y ref.

- SearchField (src/components/SearchField.tsx)
  - TextField con icono de lupa al inicio; util para listas filtrables.

- SectionTitle (src/components/SectionTitle.tsx)
  - Titulo de seccion (variant h6, negrita, centrado).

- InputLogin / InputPassWord (src/components/mui/InputLogin.tsx, src/components/mui/InputPassWord.tsx)
  - Campos de entrada estilizados con MUI para formularios de acceso.

- Spinner (src/components/spinner/Spinner.tsx)
  - Loader de pantalla completa con estilos en spinner.css.

- TopBar (src/components/layout/TopBar.tsx)
  - Barra superior con titulo, menu y avatar para vistas autenticadas.

- PulgashopFooter (src/components/layout/PulgashopFooter.tsx)
  - Footer general con enlaces y formulario de suscripcion; color de fondo #23C55E.

Notas de uso
- Estos componentes sirven como base comun para homogeneizar la UI. Se pueden adoptar gradualmente en Login, Register, ResetPass, Admin, Perfil, Home, etc.
