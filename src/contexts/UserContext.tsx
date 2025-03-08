"use client";

import { useLogin } from "@/hooks/useLogin";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect } from "react";

type UserDeriv = {
  email: string;
};

type UserContextType = {
  user: User | null;
  userDeriv: UserDeriv | null;
  fetchUser: () => Promise<void>;
  fetchUserDeriv: (urlSearch?: string) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.toString();

  const { fetchUser, fetchUserDeriv, user, userDeriv } = useLogin(urlSearch);

  useEffect(() => {
    fetchUser();
    fetchUserDeriv();
  }, []);

  return (
    <UserContext.Provider value={{ user, userDeriv, fetchUser, fetchUserDeriv }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar o contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};