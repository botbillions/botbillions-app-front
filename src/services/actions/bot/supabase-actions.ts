"use server"

import { createClient } from "@/utils/supabase/server";

export const getBotList = async () =>{
  const supabase = await createClient();

  const {data:bots,error} = await supabase.from('bot-configs').select('id,name,config');

  if(error){
    console.error("Não foi possível listar bots:", error.message);
    return null;
  }

  return bots;
}