interface Account {
  account_type: string;
  created_at: number;
  currency: string;
  is_disabled: number;
  is_virtual: number;
  landing_company_name: string;
  loginid: string;
  trading: Record<string, unknown>;
}

interface LocalCurrency {
  fractional_digits: number;
}

interface UserDeriv {
  account_list: Account[];
  balance: number;
  country: string;
  currency: string;
  email: string;
  fullname: string;
  is_virtual: number;
  landing_company_fullname: string;
  landing_company_name: string;
  local_currencies: Record<string, LocalCurrency>;
  loginid: string;
  preferred_language: string;
  scopes: string[];
  trading: Record<string, unknown>;
  upgradeable_landing_companies: string[];
  user_id: number;
}
