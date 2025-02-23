import type { CSSProperties } from "styled-components";
import * as S from "./styles";

interface BtnActionProps {
  name: string
  icon?: boolean;
  src?: string;
  alt?: string;
  link?: string;
  outlined?: string;
  fitContent?: boolean;
  style?: CSSProperties | undefined
}


const BtnAction = ({name,link,icon,src,alt, outlined,fitContent,style}:BtnActionProps) => {
  return (
    <S.Wrapper 
      fitContent={fitContent ? "fitContent" : undefined}
      outlined={outlined ? "outlined" : undefined} 
      href={link ?? "#"} 
      style={style}
    >
      
      {icon && (
        <S.ButtonIcon 
          src={src}
          alt={alt}
        />)
      }
      <S.ButtonText>
        {name}
      </S.ButtonText>
    </S.Wrapper>
  )
}

export default BtnAction