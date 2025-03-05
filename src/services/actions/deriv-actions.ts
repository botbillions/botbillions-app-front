"use server"

import DerivAPI from '@deriv/deriv-api/dist/DerivAPI';
import { WebSocket } from 'ws';
const connection = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APPID}`);
const api = new DerivAPI({ connection });
const basic = api.basic;

export const userDerivSession = async (urlSearch: string) => {

  try {
    console.log("URL ==>", urlSearch);
    const pingResponse = await basic.ping();
    console.log('Ping response:', pingResponse);

    console.log()
    const params = new URLSearchParams(urlSearch);
    const derivData = {
      account: params.get('acct1') || '',
      token: params.get('token1') || '',
      currency: params.get('cur1') || ''
    };
    console.log(api)

    return derivData;
  } catch (error) {
    console.error('Error in userDerivSession:', error);
    throw error;
  } finally {
    connection.close();
  }
};