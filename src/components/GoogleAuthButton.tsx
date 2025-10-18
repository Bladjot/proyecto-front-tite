import { Box, Button, ButtonProps } from "@mui/material";
import googleLogo from "../assets/auth/google.png";

type Props = {
  label?: string;
} & Omit<ButtonProps, "startIcon" | "children">;

export default function GoogleAuthButton({
  label = "Continuar con Google",
  ...btnProps
}: Props) {
  return (
    <Button
      variant="outlined"
      {...btnProps}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        textTransform: "none",
        bgcolor: "white",
        borderColor: "#d0d0d0",
        color: "#444",
        "&:hover": { bgcolor: "#f5f5f5" },
        ...btnProps.sx,
      }}
    >
      <Box
        component="img"
        src={googleLogo}
        alt="Google"
        sx={{ width: 18, height: 18 }}
      />
      {label}
    </Button>
  );
}
