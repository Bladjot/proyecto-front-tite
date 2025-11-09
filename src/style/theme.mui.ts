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
    // Verde principal (revertido al definido originalmente)
    primary: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    // Mismo tono para secondary como al inicio
    secondary: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f7fa",
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
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
