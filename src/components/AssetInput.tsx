import React from 'react';
import { TextField } from '@mui/material';

interface AssetInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const AssetInput: React.FC<AssetInputProps> = ({
  value,
  onChange,
  placeholder = "Enter asset name"
}) => {
  return (
    <TextField
      fullWidth
      size="small"
      label="Asset"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
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
