import { useSearchParams } from "next/navigation";
import { StyledMessageContainer, StyledSuccessMessage, StyledErrorMessage, StyledInfoMessage } from "./styles";

export function FormMessage() {
  const searchParams = useSearchParams();
  
  const success = searchParams.get("success");
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <StyledMessageContainer>
      {success && <StyledSuccessMessage>{success}</StyledSuccessMessage>}
      {error && <StyledErrorMessage>{error}</StyledErrorMessage>}
      {message && <StyledInfoMessage>{message}</StyledInfoMessage>}
    </StyledMessageContainer>
  );
}
