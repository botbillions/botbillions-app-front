import { useSearchParams } from "next/navigation";
import { StyledErrorMessage, StyledInfoMessage, StyledMessageContainer, StyledSuccessMessage } from "./styles";

export function FormMessage() {
  const searchParams = useSearchParams();

  const success = searchParams.get("success") === 'true';
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  if (!message) return null;

  return (
    <StyledMessageContainer>
      {success && message && (
        <StyledSuccessMessage>{decodeURIComponent(message)}</StyledSuccessMessage>
      )}
      {error && message && (
        <StyledErrorMessage>{decodeURIComponent(message)}</StyledErrorMessage>
      )}
      {!success && !error && message && (
        <StyledInfoMessage>{decodeURIComponent(message)}</StyledInfoMessage>
      )}
    </StyledMessageContainer>
  );
}