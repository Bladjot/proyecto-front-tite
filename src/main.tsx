import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import Spinner from "./components/spinner/Spinner";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline, StyledEngineProvider } from "@mui/material";
import theme from "./style/theme.mui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* injectFirst: MUI se inyecta antes para convivir mejor con Tailwind */}
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {/* Aplica tipografías base y usa palette.background.default */}
        <CssBaseline />
        <Suspense fallback={<Spinner />}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Suspense>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>
);
