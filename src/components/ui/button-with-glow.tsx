
import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";

interface ButtonWithGlowProps extends ButtonProps {}

export const ButtonWithGlow: React.FC<ButtonWithGlowProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <Button
      className={`relative group overflow-hidden ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-urban-blue/20 to-violet/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
    </Button>
  );
};
