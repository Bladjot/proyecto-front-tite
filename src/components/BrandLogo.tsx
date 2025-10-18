import { Box } from "@mui/material";
import brandLogo from "../assets/brand/PulgaShop.jpg";

type Props = { height?: number; alt?: string };

export default function BrandLogo({ height = 42, alt = "PulgaShop" }: Props) {
  return (
    <Box
      component="img"
      src={brandLogo}
      alt={alt}
      sx={{ height, display: "block", borderRadius: 1 }}
    />
  );
}
