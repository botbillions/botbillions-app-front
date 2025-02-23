"use client";

import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { StyledSubmitButton } from "./styles";

type Props = ComponentProps<"button"> & {
  pendingText?: string;
  isPending?:boolean;
};

export function SubmitButton({
  children,
  pendingText,
  isPending,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <StyledSubmitButton
      {...props}
      type="submit"
      aria-disabled={pending}
    >
      {isPending ? pendingText : children}
    </StyledSubmitButton>
  );
}
