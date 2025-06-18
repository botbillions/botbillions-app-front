// src/models/deriv.ts (ou onde estiver) - COMPLETO E ATUALIZADO

export interface UserDeriv {
  email: string;
  balance: number;
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

// Interface para a estratégia
export type BotStrategy = {
  type: 'martingale';
  multiplier: number;
} | null;

export interface ConfigBotsDeriv {
  strategy: BotStrategy; // <-- ADICIONADO
  prompts: prompt[];
  trade_options: tradeOptions;
  welcome_message: string;
}

type tradeOptions = {
  symbol: string;
  contractType: string;
  duration: number;
  durationUnit: string;
  currency: string;
};

type prompt = {
  id: string;
  text: string;
  value?: string; // Valor preenchido pelo usuário
};

export interface Operation {
  id: string;
  result: 'win' | 'loss';
  profit: number;
  stake: number; // Valor da entrada
  timestamp: string;
}

export interface OperationState {
  isRunning: boolean;
  operations: Operation[];
  totalProfit: number;
  winRate: number;
}