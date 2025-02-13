export interface Token {
  name: string;
  amount: number;
  price: number;
}

export interface CollateralAsset extends Token {
  id: string;
  included: boolean;
}

export interface BorrowedAsset extends Token {
  id: string;
}

export interface Config {
  collaterals: CollateralAsset[];
  borrowedAssets: BorrowedAsset[];
  borrow: Token;
  multiplier: number;
}

export interface PriceData {
  [key: string]: {
    usd: number;
  };
}

export interface EditingItem {
  id: string;
  type: 'collateral' | 'borrowed';
  values: {
    amount: number;
    price: number;
  };
}

export interface EditingCell {
  id: string;
  field: 'amount' | 'price';
  type: 'collateral' | 'borrowed';
}

export interface FeedbackForm {
  email: string;
  message: string;
  submitting: boolean;
  success: boolean;
  error: string;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}
