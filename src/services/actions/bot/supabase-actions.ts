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

export const getBot = async (id:string) =>{
  const supabase = await createClient();

  const {data:bot,error} = await supabase.from('bot-configs').select('id,name,config').eq('id',id).single();

  if(error){
    console.error("Não foi possível listar bots:", error.message);
    return null;
  }

  return bot;
}