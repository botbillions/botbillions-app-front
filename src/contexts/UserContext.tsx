"use client";

import { userAuthenticated } from "@/services/actions/auth/supabase-actions";
import { User } from "@supabase/supabase-js";
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
    const authenticatedUser = await userAuthenticated();

    if (authenticatedUser) {
      setUser(authenticatedUser);
      setStatus("success");
    } else {
      setUser(null);
      setStatus("error");
    }

  };

  useEffect(() => {
    fetchUser();
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
