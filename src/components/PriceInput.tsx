import React from 'react';
import { TextField, CircularProgress, Tooltip } from '@mui/material';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  useLivePrices: boolean;
  isLoading: boolean;
  hasError: boolean;
  assetName: string;
  disabled?: boolean;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  useLivePrices,
  isLoading,
  hasError,
  assetName,
  disabled
}) => {
  return (
    <Tooltip
      open={Boolean(useLivePrices && hasError && assetName)}
      title="Couldn't fetch price for this asset. Please enter it manually."
      placement="top"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.shadows[2],
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            color: 'error.main',
            p: 1,
            '& .MuiTooltip-arrow': {
              color: 'background.paper',
              '&::before': {
                border: '1px solid',
                borderColor: 'divider',
              }
            },
          }
        }
      }}
    >
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Price ($)"
        placeholder="0.00"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        InputProps={{
          endAdornment: useLivePrices && isLoading && (
            <CircularProgress size={20} />
          )
        }}
        error={Boolean(hasError)}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '40px',
            '& fieldset': {
              borderColor: useLivePrices && hasError ? 'error.main' : 'divider'
            },
            '&:hover fieldset': {
              borderColor: useLivePrices && hasError ? 'error.main' : 'primary.main'
            },
            '&.Mui-focused fieldset': {
              borderColor: useLivePrices && hasError ? 'error.main' : 'primary.main'
            },
            '& input::placeholder': {
              color: 'text.secondary',
              opacity: 1
            }
          },
          '& .MuiInputLabel-root': {
            color: useLivePrices && hasError ? 'error.main' : 'text.secondary'
          },
          opacity: useLivePrices ? 0.7 : 1
        }}
      />
    </Tooltip>
  );
};
