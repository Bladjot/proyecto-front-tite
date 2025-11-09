import { Box, Paper, PaperProps } from "@mui/material";
import React from "react";

type CenteredCardProps = {
  children: React.ReactNode;
  maxWidth?: number;
  paperProps?: PaperProps;
};

export default function CenteredCard({ children, maxWidth = 480, paperProps }: CenteredCardProps) {
  return (
    <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.25)",
        }}
        {...paperProps}
      >
        {children}
      </Paper>
    </Box>
  );
}

