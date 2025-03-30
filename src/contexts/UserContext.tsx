"use client";

import type { UserDeriv } from "@/models/deriv";
import { linkDerivAccount, userAuthenticated } from "@/services/actions/auth/supabase-actions";
import { addUserData } from "@/hooks/usesDeriv";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  user: User | null;
  fetchUser: () => Promise<void>;
  status: "error" | "success" | "loading";
};

const UserContext = createContext<UserContextType | undefined>(undefined);
type Status = "error" | "success" | "loading";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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
    authStateChange();
  }, []);

  return (
    <UserContext.Provider value={{ user, status, fetchUser }}>
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