import { StyledInput } from "./styles";

export function Input({ ...props }: React.JSX.IntrinsicElements["input"]) {
  return (
    <StyledInput
      {...props}
    />
  );
}
