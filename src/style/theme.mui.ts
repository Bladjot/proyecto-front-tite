import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette { pearl: Palette["primary"]; }
  interface PaletteOptions { pearl?: PaletteOptions["primary"]; }
}
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides { pearl: true; }
}

const theme = createTheme({
  palette: {
    // Verde de la barra superior
    primary: {
      main: "#2BBF5C", // verde vibrante principal
      light: "#4CD47A", // más claro (hover, etc.)
      dark: "#259B4C",  // más oscuro
      contrastText: "#ffffff",
    },
    // Verde del botón principal (puedes mantenerlo igual al primary)
    secondary: {
      main: "#2BBF5C",
      light: "#4CD47A",
      dark: "#259B4C",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F1FFF4", // fondo claro tipo registro
    },
  },
  typography: {
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif",
    button: { fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
           borderRadius: "10px",
          padding: "10px 16px",
          height: "45px",
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;
