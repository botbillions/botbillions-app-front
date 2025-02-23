import React from "react";
import { StyledLabel } from "./styles";

export function Label({
  children,
  ...props
}: { children: React.ReactNode } & React.JSX.IntrinsicElements["label"]) {
  return (
    <StyledLabel {...props}>
      {children}
    </StyledLabel>
  );
}
