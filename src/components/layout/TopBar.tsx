import { AppBar, Toolbar, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import BrandLogo from "../BrandLogo";

type TopBarProps = {
  onMenuClick?: () => void;
  rightSlot?: React.ReactNode;
  logoClickable?: boolean;
};

export default function TopBar({ onMenuClick, rightSlot, logoClickable = true }: TopBarProps) {
  return (
    <AppBar position="static" elevation={0} color="primary">
      <Toolbar sx={{ gap: 2 }}>
        <BrandLogo height={40} clickable={logoClickable} />
        <Box sx={{ flex: 1 }} />
        {rightSlot}
        {onMenuClick && (
          <IconButton edge="end" color="inherit" aria-label="menu" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}
