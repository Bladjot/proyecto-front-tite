import { Typography, TypographyProps } from "@mui/material";
import React from "react";

type SectionTitleProps = TypographyProps & {
  children: React.ReactNode;
};

export default function SectionTitle({ children, ...rest }: SectionTitleProps) {
  return (
    <Typography variant="h6" fontWeight={700} textAlign="center" className="h-inter" {...rest}>
      {children}
    </Typography>
  );
}

