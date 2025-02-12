export interface Token {
  name: string;
  price: number;
  amount: number;
}

export interface CollateralAsset extends Token {
  id: string;
  included: boolean;
}

export interface BorrowedAsset extends Token {
  id: string;
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
