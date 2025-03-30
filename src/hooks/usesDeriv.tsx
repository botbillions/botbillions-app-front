"use client";

import type { UserDeriv } from "@/models/deriv";
import type { Dispatch, SetStateAction } from "react";
import { linkDerivAccount } from "../services/actions/auth/supabase-actions";

const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APPID}`);

type Status = "error" | "success" | "loading";

interface IUsesDerivProps {
  token: string;
  setStatus: Dispatch<SetStateAction<Status>>;
  setUserDeriv: Dispatch<SetStateAction<UserDeriv | null>>
}

export const usesDeriv = ({token,setStatus,setUserDeriv}:IUsesDerivProps) => {
  const addUserData = async () => {
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
      const account_type: "Virtual" | "Real" = response.authorize?.is_virtual === 1 ? "Virtual" : "Real";
      const currency = response.authorize?.currency;
  
      const derivData = { email, balance, loginid, account_type, currency };
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
  }

  return {
    addUserData
  }
}