"use client";

import { useEffect, useState } from "react";

import * as S from "./styles";

const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};
export const deleteCookie = (name: string) => {
  // Verifica se o cookie existe
  if (document.cookie.split("; ").find(row => row.startsWith(name + "="))) {
    // Define a expiração para o passado, removendo-o
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const Cookie = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = getCookie("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    };
  }, []);

  const handleAcceptCookie = () => {
    setCookie("cookie-consent", "granted", 365);
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "default", {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <S.Wrapper>
      <S.CookieContent>
        <S.CookieText>
          Este site usa cookies para garantir que você obtenha a melhor
          experiência.
        </S.CookieText>
        <S.CookieButton onClick={handleAcceptCookie}>Entendi</S.CookieButton>
      </S.CookieContent>
    </S.Wrapper>
  );
};

export default Cookie;
