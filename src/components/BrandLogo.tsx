import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import brandLogo from "../assets/LOGO1.svg";

type Props = { height?: number; alt?: string; clickable?: boolean; to?: string };

export default function BrandLogo({ height = 42, alt = "PulgaShop", clickable = true, to = "/home" }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!clickable) return;
    navigate(to);
  };

  return (
    <Box
      component="img"
      src={brandLogo}
      alt={alt}
      sx={{ height, display: "block", borderRadius: 1, cursor: clickable ? "pointer" : "default" }}
      onClick={handleClick}
    />
  );
}
