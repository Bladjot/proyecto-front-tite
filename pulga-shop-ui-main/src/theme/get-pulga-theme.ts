import { createTheme, Theme } from "@mui/material";
import theme from "./theme.mui";

export const getPulgaTheme = (): Theme => {
  return createTheme(theme);
}
