"use client";

import { linkDerivAccount, userAuthenticated } from "@/services/actions/auth/supabase-actions";
import { CreateNewFormData, createNewFormSchema } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type UserDeriv = {
  email: string;
};

type UserContextType = {
  user: User | null;
  userDeriv: UserDeriv | null;
  fetchUser: () => Promise<void>;
  fetchUserDeriv: (urlSearch?: string) => Promise<void>;
  status: 'error' | 'success' | 'loading';
};

const UserContext = createContext<UserContextType | undefined>(undefined);
type Status = 'error' | 'success' | 'loading'

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.toString();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateNewFormData>({
    resolver: zodResolver(createNewFormSchema),
  });

  const [user, setUser] = useState<User | null>(null);
  const [userDeriv, setUserDeriv] = useState<UserDeriv | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const fetchUser = async () => {
    try {
      const authenticatedUser = await userAuthenticated();
      setUser(authenticatedUser);
      setStatus('success');
    } catch (err) {
      setStatus('error')
    }
  };

  const fetchUserDeriv = async () => {
    setStatus('loading')
    const derivCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("derivData="));
    const derivDataFromCookie = derivCookie ? JSON.parse(derivCookie.split("=")[1]) : null;

    if (derivDataFromCookie && derivDataFromCookie.email) {
      setUserDeriv({ email: derivDataFromCookie.email });
      return;
    }
    if (!urlSearch) {
      return;
    }

    const params = new URLSearchParams(urlSearch);
    const token = params.get("token1") || "";

    if (!token) {
      return;
    }

    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APPID}`);

    ws.onopen = () => {
      console.log("WebSocket conectado, enviando autorização...");
      ws.send(
        JSON.stringify({
          authorize: token,
          req_id: 1,
        })
      );
    };

    ws.onmessage = async (event) => {
      const response = JSON.parse(event.data);

      if (response.error) {
      } else {
        const email = response.authorize?.email || "email não encontrado";
        setUserDeriv({ email });
        document.cookie = `derivData=${JSON.stringify({ email })}; path=/; max-age=${60 * 60 * 24}`; // 1 dia

        await linkDerivAccount(email);
        setStatus('success')
      }
      ws.close();
    };

    ws.onerror = (err) => {
      setStatus('error');
      ws.close();
    };

    ws.onclose = () => {
    };
  };

  useEffect(() => {
    fetchUser();
    fetchUserDeriv();
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