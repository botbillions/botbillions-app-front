export interface UserDeriv {
  email: string;
  balance: string;
  loginid: string;
  account_type: "Virtual" | "Real";
  currency: string;
  token?: string;
}

export interface BotsDeriv {
  id: string;
  name: string;
  config: ConfigBotsDeriv;
}

export interface ConfigBotsDeriv {
  prompts: prompt[];
  trade_options: tradeOptions;
  welcome_message: string;
}

type tradeOptions = {
  symbol: string;
  currency: string;
  duration: number;
  contractType: string;
  durationUnit: string;
}

type prompt = {
  key: any;
  id: string;
  text: string;
  value?: string;
}