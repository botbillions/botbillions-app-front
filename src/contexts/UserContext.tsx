"use client";

import { linkDerivAccount, userAuthenticated } from "@/services/actions/auth/supabase-actions";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type UserDeriv = {
  email: string;
  balance: string;
  loginid: string;
};

type UserContextType = {
  user: User | null;
  userDeriv: UserDeriv | null;
  fetchUser: () => Promise<void>;
  fetchUserDeriv: (urlSearch?: string) => Promise<void>;
  status: "error" | "success" | "loading";
};

const UserContext = createContext<UserContextType | undefined>(undefined);
type Status = "error" | "success" | "loading";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.toString();
  const [user, setUser] = useState<User | null>(null);
  const [userDeriv, setUserDeriv] = useState<UserDeriv | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const fetchUser = async () => {
    setStatus("loading");
    try {
      const authenticatedUser = await userAuthenticated();
      setUser(authenticatedUser);
      setStatus(authenticatedUser ? "success" : "error");
    } catch (err) {
      setUser(null);
      setStatus("error");
    }
  };

  const fetchUserDeriv = async (urlSearchParam?: string) => {
    setStatus("loading");

    // Lê o cookie
    const derivCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("derivData="));
    const derivDataFromCookie = derivCookie ? JSON.parse(derivCookie.split("=")[1]) : null;

    if (derivDataFromCookie && derivDataFromCookie.email) {
      setUserDeriv({
        email: derivDataFromCookie.email,
        balance: derivDataFromCookie.balance,
        loginid: derivDataFromCookie.loginid // Consistente com o cookie
      });
      setStatus("success");
      return;
    }

    if (!urlSearchParam && !urlSearch) {
      setStatus("success");
      return;
    }

    const params = new URLSearchParams(urlSearchParam || urlSearch);
    const token = params.get("token1") || "";

    if (!token) {
      setStatus("success");
      return;
    }

    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APPID}`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          authorize: token,
          req_id: 1,
        })
      );
    };

    ws.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      console.log("Resposta completa da API:", response);

      if (response.error) {
        setStatus("error");
        ws.close();
        return;
      }

      const email = response.authorize?.email || "email não encontrado";
      const balance = response.authorize?.balance?.toString() || "balance não encontrado";
      const loginid = response.authorize?.loginid || "loginid não encontrado";

      const derivData = { email, balance, loginid };
      setUserDeriv(derivData);
      document.cookie = `derivData=${JSON.stringify(derivData)}; path=/; max-age=${60 * 60 * 24}`;
      await linkDerivAccount(email);
      setStatus("success");
      ws.close();
    };

    ws.onerror = (err) => {
      setStatus("error");
      ws.close();
    };
  };

  const authStateChange = async () => {
    const supabase = await createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null);
        setStatus("success");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setStatus("success");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }

  useEffect(() => {
    fetchUser();
    fetchUserDeriv();
    authStateChange();
  }, []);

  return (
    <UserContext.Provider value={{ user, status, userDeriv, fetchUser, fetchUserDeriv }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};