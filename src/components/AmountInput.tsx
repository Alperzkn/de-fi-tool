import React from 'react';
import { TextField } from '@mui/material';

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  disabled
}) => {
  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      label="Amount"
      placeholder="0.00"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      disabled={disabled}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: '40px',
          '& fieldset': {
            borderColor: 'divider'
          },
          '&:hover fieldset': {
            borderColor: 'primary.main'
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main'
          },
          '& input::placeholder': {
            color: 'text.secondary',
            opacity: 1
          }
        }
      }}
    />
  );
};
