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
  strategy: any;
  prompts: prompt[];
  trade_options: tradeOptions;
  welcome_message: string;
}

type tradeOptions = {
  type: string;
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

export interface Operation {
  result: any;
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  profit?: number;
}

export interface OperationState {
  isRunning: boolean;
  operations: Operation[];
  totalProfit: number;
  winRate: number;
}