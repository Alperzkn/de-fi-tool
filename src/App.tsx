import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline, 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Slider, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Snackbar,
  Alert, AlertTitle,
  Grid,
  Card,
  CardContent,
  Switch,
  Chip,
  Fade
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { Add as AddIcon } from '@mui/icons-material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CircleIcon from '@mui/icons-material/Circle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

interface Token {
  name: string;
  price: number;
  amount: number;
}

interface CollateralAsset extends Token {
  id: string;
  included: boolean;
}

interface BorrowedAsset extends Token {
  id: string;
}

const getInitialConfig = () => {
  const defaultConfig = {
    collaterals: [],
    borrowedAssets: [],
    borrow: { name: '', price: 0, amount: 0 },
    multiplier: 0.8,
  };

  try {
    const savedConfig = localStorage.getItem('defiConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      // Validate the structure of saved config
      if (
        Array.isArray(parsedConfig.collaterals) &&
        Array.isArray(parsedConfig.borrowedAssets) &&
        typeof parsedConfig.multiplier === 'number' &&
        typeof parsedConfig.borrow === 'object'
      ) {
        return parsedConfig;
      }
    }
  } catch (error) {
    console.error('Error loading saved configuration:', error);
  }

  return defaultConfig;
};

// Create a dark theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
            },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const getBackgroundColor = (percentage: number): string => {
  if (percentage <= 0.3) return '#00A76F20';
  if (percentage <= 0.5) return '#FFAB0020';
  if (percentage <= 0.7) return '#FF563020';
  if (percentage <= 0.85) return '#FF563040';
  return '#FF563060';
};

const getGradientStyle = (percentage: number) => {
  const color = getBackgroundColor(percentage);
  return {
    background: `linear-gradient(135deg, 
      #161C24 0%, 
      ${color} 50%,
      #161C24 100%
    )`,
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
  };
};

const truncateAddress = (address: string) => {
  if (address.length <= 20) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
};

const getCryptoIcon = (symbol: string) => {
  const normalizedSymbol = symbol.toLowerCase();
  
  // Special case for SUI
  if (normalizedSymbol === 'sui') {
    return (
      <WaterDropIcon 
        sx={{ 
          color: '#6FBCF0',
          fontSize: 24,
          filter: 'drop-shadow(0 0 8px #6FBCF040)',
          marginRight: 1
        }} 
      />
    );
  }

  try {
    const iconPath = `/crypto-icons/${normalizedSymbol}.svg`;
    return (
      <Box
        component="img"
        src={iconPath}
        alt={`${symbol} icon`}
        sx={{
          width: 24,
          height: 24,
          marginRight: 1,
          verticalAlign: 'middle'
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.onerror = null;
        }}
      />
    );
  } catch (e) {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 1,
          fontSize: '12px',
          color: 'white',
          verticalAlign: 'middle'
        }}
      >
        {symbol.charAt(0).toUpperCase()}
      </Box>
    );
  }
};

const walletAddresses = [
  {
    chain: 'Ethereum',
    address: '0xa1Aa157d23BD0Af178e3f6E9bc8A800A12AAe007',
    color: '#627EEA',
    symbol: 'eth'
  },
  {
    chain: 'BNB Chain',
    address: '0xa1Aa157d23BD0Af178e3f6E9bc8A800A12AAe007',
    color: '#F3BA2F',
    symbol: 'bnb'
  },
  {
    chain: 'Solana',
    address: '3Hk6H3VaomTCDQVHtL4EPuSZcfzUSiGMzEegRBc8XEYW',
    color: '#00FFA3',
    symbol: 'sol'
  },
  {
    chain: 'Sui',
    address: '0x8bc2671fdd1fc6ffeea05252b243ac9df27646b89c1edcc502ae4004a701c4cc',
    color: '#6FBCF0',
    symbol: 'sui'
  }
];

function App() {
  const [collaterals, setCollaterals] = useState<CollateralAsset[]>(getInitialConfig().collaterals);
  const [borrowedAssets, setBorrowedAssets] = useState<BorrowedAsset[]>(getInitialConfig().borrowedAssets);
  const [borrow, setBorrow] = useState<Token>(getInitialConfig().borrow);
  const [multiplier, setMultiplier] = useState(getInitialConfig().multiplier);
  const [newAsset, setNewAsset] = useState<Omit<CollateralAsset, 'id'>>({
    name: '',
    price: 0,
    amount: 0,
    included: true,
  });

  const handleCollateralEdit = (id: string, field: 'amount' | 'price', value: number) => {
    if (value < 0) return; // Prevent negative values
    
    setCollaterals(prevCollaterals =>
      prevCollaterals.map(collateral =>
        collateral.id === id ? { ...collateral, [field]: value } : collateral
      )
    );
  };

  const handleBorrowedEdit = (id: string, field: 'amount' | 'price', value: number) => {
    if (value < 0) return; // Prevent negative values

    setBorrowedAssets(prevAssets => {
      const assetToUpdate = prevAssets.find(a => a.id === id);
      if (!assetToUpdate) return prevAssets;

      const otherAssets = prevAssets.filter(a => a.id !== id);
      const otherAssetsValue = otherAssets.reduce((sum, asset) => sum + (asset.amount * asset.price), 0);
      const maxBorrowValue = totalCollateralValue * multiplier - otherAssetsValue;

      if (field === 'price') {
        const newPrice = value;
        const maxAmount = maxBorrowValue / newPrice;
        const newAmount = Math.min(assetToUpdate.amount, maxAmount);
        
        return [
          ...otherAssets,
          {
            ...assetToUpdate,
            price: newPrice,
            amount: newAmount
          }
        ];
      } else { // field === 'amount'
        const maxAmount = maxBorrowValue / assetToUpdate.price;
        // For amount, allow any value up to maxAmount (can be reduced freely)
        const newAmount = Math.min(value, maxAmount);

        return [
          ...otherAssets,
          {
            ...assetToUpdate,
            amount: newAmount
          }
        ];
      }
    });
  };

  const handleEditStart = (id: string, field: 'amount' | 'price', type: 'collateral' | 'borrowed') => {
    setEditingCell({ id, field, type });
  };

  const handleEditComplete = (value: string) => {
    if (!editingCell) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    // Allow any non-negative value for collateral
    if (editingCell.type === 'collateral') {
      if (numValue < 0) return;
      handleCollateralEdit(editingCell.id, editingCell.field, numValue);
    } else {
      // For borrowed assets, validate against max amount if trying to increase
      const asset = borrowedAssets.find(a => a.id === editingCell.id);
      if (!asset) return;

      if (editingCell.field === 'amount') {
        const currentAmount = asset.amount;
        const maxAmount = calculateMaxBorrowAmount(editingCell.id, asset.price);
        
        // Allow reduction of amount always, but cap increases at maxAmount
        if (numValue > currentAmount && numValue > maxAmount) {
          handleBorrowedEdit(editingCell.id, 'amount', maxAmount);
        } else {
          handleBorrowedEdit(editingCell.id, 'amount', numValue);
        }
      } else {
        handleBorrowedEdit(editingCell.id, 'price', numValue);
      }
    }
    setEditingCell(null);
  };

  // Save configuration whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('defiConfig', JSON.stringify({ collaterals, borrowedAssets, borrow, multiplier }));
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }, [collaterals, borrowedAssets, borrow, multiplier]);

  const addCollateral = () => {
    if (newAsset.name) {
      setCollaterals([
        ...collaterals,
        {
          ...newAsset,
          id: Date.now().toString(),
        },
      ]);
      // Reset the new asset form
      setNewAsset({
        name: '',
        price: 0,
        amount: 0,
        included: true,
      });
    }
  };

  const removeCollateral = (id: string) => {
    setCollaterals(prevCollaterals => prevCollaterals.filter(c => c.id !== id));
  };

  const updateCollateral = (id: string, updates: Partial<CollateralAsset>) => {
    setCollaterals(
      collaterals.map((c) => {
        if (c.id === id) {
          // Capitalize token name if it's being updated
          if ('name' in updates) {
            updates.name = updates.name?.toUpperCase();
          }
          return { ...c, ...updates };
        }
        return c;
      })
    );
  };

  const handleTokenNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setToken: React.Dispatch<React.SetStateAction<Token>>,
    token: Token
  ) => {
    setToken({ ...token, name: e.target.value.toUpperCase() });
  };

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<Token>>,
    current: Token
  ) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    setter({ ...current, price: value });
  };

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement> | Event,
    setter: React.Dispatch<React.SetStateAction<Token>>,
    current: Token
  ) => {
    const value = (e.target as HTMLInputElement).value === '' ? 0 : parseFloat((e.target as HTMLInputElement).value);
    setter({ ...current, amount: value });
  };

  const handleMultiplierChange = (event: Event, newValue: number | number[]) => {
    setMultiplier(newValue as number);
  };

  // Calculate total collateral value and amount
  const totalCollateralValue = collaterals
    .filter(c => c.included)
    .reduce((sum, c) => sum + c.amount * c.price, 0);

  const totalCollateralAmount = collaterals
    .filter(c => c.included)
    .reduce((sum, c) => sum + c.amount, 0);

  const totalBorrow = borrowedAssets
    .reduce((sum, asset) => sum + asset.amount * asset.price, 0);

  const equity = totalCollateralValue - totalBorrow;

  // Calculate breakeven price
  // Formula: (borrow amount * borrow price) / (risk multiplier * collateral amount)
  const breakevenPrice = totalCollateralAmount > 0 && multiplier > 0
    ? (totalBorrow) / (multiplier * totalCollateralAmount)
    : 0;

  const borrowPercentage = totalBorrow / (totalCollateralValue * multiplier);

  // Format number with commas and decimal places
  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const addBorrowedAsset = () => {
    if (borrow.name) {
      setBorrowedAssets([
        ...borrowedAssets,
        {
          ...borrow,
          id: Date.now().toString(),
        },
      ]);
      // Reset the borrow form
      setBorrow({
        name: '',
        price: 0,
        amount: 0,
      });
    }
  };

  const removeBorrowedAsset = (id: string) => {
    setBorrowedAssets(prevAssets => prevAssets.filter(a => a.id !== id));
  };

  // Calculate total borrowed value
  const totalBorrowedValue = borrowedAssets.reduce((sum, asset) => sum + (asset.amount * asset.price), 0);

  // Calculate remaining borrowing power
  const remainingBorrowPower = Math.max(0, (totalCollateralValue * multiplier) - totalBorrowedValue);

  // Add editing state
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: 'amount' | 'price';
    type: 'collateral' | 'borrowed';
  } | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditComplete((e.target as HTMLInputElement).value);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
  };

  // Common styles for editable cells
  const editableCellStyles = {
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(145, 158, 171, 0.08)',
    },
    textAlign: 'right',
    padding: '8px 16px',
  };

  const calculateMaxBorrowAmount = (assetId: string, price: number): number => {
    const otherAssets = borrowedAssets.filter(a => a.id !== assetId);
    const otherAssetsValue = otherAssets.reduce((sum, asset) => sum + (asset.amount * asset.price), 0);
    return Math.max(0, (totalCollateralValue * multiplier - otherAssetsValue) / price);
  };

  // Render an editable cell
  const EditableCell = ({ 
    id, 
    field, 
    value, 
    type,
    disabled = false,
    format = (v: number) => v.toFixed(field === 'amount' ? 4 : 2),
    prefix = field === 'price' ? '$' : '',
  }: {
    id: string;
    field: 'amount' | 'price';
    value: number;
    type: 'collateral' | 'borrowed';
    disabled?: boolean;
    format?: (value: number) => string;
    prefix?: string;
  }) => {
    const isEditing = editingCell?.id === id && editingCell?.field === field;
    const asset = type === 'borrowed' ? borrowedAssets.find(a => a.id === id) : null;
    const maxAmount = asset && field === 'amount' ? calculateMaxBorrowAmount(id, asset.price) : Infinity;
    const currentAmount = asset?.amount || 0;

    const getTooltipContent = () => {
      if (type === 'borrowed') {
        if (field === 'amount') {
          if (disabled) {
            return (
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                  Cannot borrow more due to insufficient collateral
                </Typography>
              </Box>
            );
          }
          const maxFormatted = maxAmount.toFixed(4);
          return (
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <span style={{ fontWeight: 500 }}>Current borrowed:</span> {format(value)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <span style={{ fontWeight: 500 }}>Maximum borrowable:</span> {maxFormatted}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Double-click to edit
              </Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <span style={{ fontWeight: 500 }}>Current price:</span> ${format(value)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Double-click to edit
            </Typography>
          </Box>
        );
      } else {
        // Collateral tooltips
        if (field === 'amount') {
          return (
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <span style={{ fontWeight: 500 }}>Deposited amount:</span> {format(value)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Double-click to edit
              </Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <span style={{ fontWeight: 500 }}>Current price:</span> ${format(value)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Double-click to edit
            </Typography>
          </Box>
        );
      }
    };
    
    return (
      <Tooltip 
        title={getTooltipContent()}
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'background.paper',
              boxShadow: (theme) => theme.shadows[2],
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              color: 'text.primary',
              maxWidth: 'none',
            }
          }
        }}
      >
        <TableCell
          align="right"
          onDoubleClick={() => !disabled && handleEditStart(id, field, type)}
          sx={{
            ...editableCellStyles,
            cursor: disabled ? 'not-allowed' : 'pointer',
            '&:hover': disabled ? {} : editableCellStyles['&:hover'],
          }}
        >
          {isEditing ? (
            <Box sx={{ position: 'relative' }}>
              <TextField
                autoFocus
                defaultValue={value}
                type="number"
                size="small"
                onBlur={(e) => handleEditComplete(e.target.value)}
                onKeyDown={handleKeyDown}
                inputProps={{
                  min: 0,
                  step: field === 'amount' ? 0.0001 : 0.01,
                  style: { textAlign: 'right' },
                }}
                sx={{
                  width: '120px',
                  '& .MuiInputBase-root': {
                    backgroundColor: 'background.paper',
                    height: '32px',
                  },
                }}
              />
              {type === 'borrowed' && field === 'amount' && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: 0,
                    color: 'text.secondary',
                  }}
                >
                  Max: {maxAmount.toFixed(4)}
                </Typography>
              )}
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                color: disabled ? 'text.disabled' : 'text.primary',
              }}
            >
              {getCryptoIcon(id)}
              {prefix && <span>{prefix}</span>}
              {format(value)}
            </Box>
          )}
        </TableCell>
      </Tooltip>
    );
  };

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setShowCopySuccess(true);
  };

  const handleCloseCopySuccess = () => {
    setShowCopySuccess(false);
  };

  const utilizationRate = (totalBorrow / (totalCollateralValue * multiplier)) * 100;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: 'collateral' | 'borrowed';
    values: {
      amount: number;
      price: number;
    };
  } | null>(null);

  const handleEditClick = (id: string, type: 'collateral' | 'borrowed') => {
    const item = type === 'collateral' 
      ? collaterals.find(c => c.id === id)
      : borrowedAssets.find(b => b.id === id);

    if (item) {
      setEditingItem({
        id,
        type,
        values: {
          amount: item.amount,
          price: item.price
        }
      });
      setEditModalOpen(true);
    }
  };

  const handleSaveChanges = () => {
    if (!editingItem) return;

    if (editingItem.type === 'collateral') {
      handleCollateralEdit(editingItem.id, 'amount', editingItem.values.amount);
      handleCollateralEdit(editingItem.id, 'price', editingItem.values.price);
    } else {
      handleBorrowedEdit(editingItem.id, 'amount', editingItem.values.amount);
      handleBorrowedEdit(editingItem.id, 'price', editingItem.values.price);
    }

    setEditModalOpen(false);
    setEditingItem(null);
  };

  const handleRemoveBorrowed = (id: string) => {
    setBorrowedAssets(prevAssets => prevAssets.filter(asset => asset.id !== id));
  };

  const [showUtilizationWarning, setShowUtilizationWarning] = useState(true);

  useEffect(() => {
    if (utilizationRate >= 100) {
      setShowUtilizationWarning(true);
    }
  }, [utilizationRate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0C1F2C 0%, #1A2C38 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 167, 111, 0.1) 0%, rgba(0, 167, 111, 0) 70%)',
            pointerEvents: 'none',
          },
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Title at the top */}
          <Box 
            display="flex" 
            flexDirection="column"
            alignItems="center" 
            gap={2} 
            mb={6}
            sx={{
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(0, 167, 111, 0.5), transparent)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '& .MuiSvgIcon-root': {
                  fontSize: 48,
                  animation: 'pulse 2s infinite',
                  color: theme.palette.primary.main,
                  filter: 'drop-shadow(0 0 10px rgba(0, 167, 111, 0.3))',
                },
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.8,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            >
              <CalculateIcon />
              <Typography 
                variant="h3" 
                component="h1"
                sx={{
                  background: 'linear-gradient(45deg, #00A76F 30%, #3BE7B6 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                DeFi Lending Calculator
              </Typography>
            </Box>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              textAlign="center"
              sx={{ 
                maxWidth: '600px',
                opacity: 0.8,
              }}
            >
              Calculate your optimal lending and borrowing positions with real-time market data
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {utilizationRate > 80 && (
              <Grid item xs={12}>
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                      scale: {
                        type: "spring",
                        damping: 12,
                        stiffness: 100
                      }
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: utilizationRate >= 100 ? 'rgba(255, 72, 66, 0.12)' : 'rgba(255, 171, 0, 0.12)',
                        border: '1px solid',
                        borderColor: utilizationRate >= 100 ? 'error.light' : 'warning.main',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: utilizationRate >= 100 ? 'error.main' : 'warning.main',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        {utilizationRate >= 100 ? (
                          <ErrorOutlineIcon sx={{ fontSize: 20 }} />
                        ) : (
                          <WarningAmberIcon sx={{ fontSize: 20 }} />
                        )}
                        High Utilization Warning
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: utilizationRate >= 100 ? 'error.main' : 'warning.main',
                          opacity: 0.9,
                          pl: 3.5
                        }}
                      >
                        {utilizationRate === Infinity ? (
                          "You have borrowed assets but no collateral. Add collateral or repay your borrowings to maintain a safe position."
                        ) : (
                          `Your borrow amount is ${utilizationRate.toFixed(1)}% of your maximum liquidation threshold. Consider reducing your borrowed assets or repay your borrowings to maintain a safe position.`
                        )}
                      </Typography>
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Grid>
            )}
            {/* Left Side - Configuration Card */}
            <Grid item xs={12} lg={5}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  background: 'rgba(33, 43, 54, 0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(145, 158, 171, 0.12)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {/* Collateral Section */}
                <Card 
                  sx={{ 
                    mb: 3,
                    background: 'rgba(33, 43, 54, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(145, 158, 171, 0.12)',
                    borderRadius: 2,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography 
                        variant="h6"
                        sx={{
                          color: 'success.main',
                          textShadow: '0 0 10px rgba(0, 167, 111, 0.3)',
                          fontWeight: 600,
                        }}
                      >
                        Collateral Deposit
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Asset Name"
                          value={newAsset.name}
                          onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value.toUpperCase() })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Amount"
                          value={newAsset.amount || ''}
                          onChange={(e) => setNewAsset({ ...newAsset, amount: parseFloat(e.target.value) || 0 })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Price ($)"
                          value={newAsset.price || ''}
                          onChange={(e) => setNewAsset({ ...newAsset, price: parseFloat(e.target.value) || 0 })}
                        />
                      </Grid>
                    </Grid>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={addCollateral}
                      disabled={!newAsset.name}
                      startIcon={<AddIcon />}
                      sx={{ 
                        height: '56px', 
                        mt: 2,
                        background: 'linear-gradient(45deg, #00A76F 30%, #3BE7B6 90%)',
                        boxShadow: '0 3px 5px 2px rgba(0, 167, 111, .3)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 10px 4px rgba(0, 167, 111, .3)',
                        },
                      }}
                    >
                      Add Collateral Asset
                    </Button>
                  </CardContent>
                </Card>

                {/* Borrow Section */}
                <Card 
                  sx={{ 
                    mb: 3,
                    background: 'rgba(33, 43, 54, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(145, 158, 171, 0.12)',
                    borderRadius: 2,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        color: 'error.main',
                        textShadow: '0 0 10px rgba(255, 86, 48, 0.3)',
                        fontWeight: 600,
                        mb: 3,
                      }}
                    >
                      Borrowed Assets
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Asset Name"
                          value={borrow.name}
                          onChange={(e) => setBorrow({ ...borrow, name: e.target.value.toUpperCase() })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Amount"
                          value={borrow.amount || ''}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            const maxAmount = remainingBorrowPower / (borrow.price || 1);
                            setBorrow({ 
                              ...borrow, 
                              amount: Math.min(newValue, maxAmount)
                            });
                          }}
                          inputProps={{
                            min: 0,
                            max: remainingBorrowPower / (borrow.price || 1),
                            step: 0.0001
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Price ($)"
                          value={borrow.price || ''}
                          onChange={(e) => setBorrow({ ...borrow, price: parseFloat(e.target.value) || 0 })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ px: 2, mt: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Available to Borrow
                            </Typography>
                            <Box>
                              <Typography variant="body2" color="text.secondary" component="span">
                                Max: {(remainingBorrowPower / (borrow.price || 1)).toFixed(4)} {borrow.name || 'tokens'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                                (${formatNumber(remainingBorrowPower)} value)
                              </Typography>
                            </Box>
                          </Box>
                          <Slider
                            value={borrow.amount || 0}
                            onChange={(_, value) => setBorrow({ ...borrow, amount: value as number })}
                            min={0}
                            max={remainingBorrowPower / (borrow.price || 1)}
                            step={0.0001}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => value.toFixed(4)}
                            disabled={remainingBorrowPower <= 0}
                            sx={{
                              '& .MuiSlider-markLabel': {
                                color: 'text.secondary',
                              },
                              '& .MuiSlider-track': {
                                background: remainingBorrowPower > 0 
                                  ? 'linear-gradient(45deg, #FF4842 30%, #FF867F 90%)'
                                  : 'rgba(255, 72, 66, 0.24)',
                              },
                              '& .MuiSlider-thumb': {
                                boxShadow: remainingBorrowPower > 0 
                                  ? '0 0 10px rgba(255, 72, 66, 0.5)'
                                  : 'none',
                                '&:hover, &.Mui-focusVisible': {
                                  boxShadow: remainingBorrowPower > 0 
                                    ? '0 0 15px rgba(255, 72, 66, 0.7)'
                                    : 'none',
                                },
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={addBorrowedAsset}
                      disabled={!borrow.name || collaterals.length === 0}
                      startIcon={<AddIcon />}
                      sx={{ 
                        height: '56px', 
                        mt: 2,
                        background: 'linear-gradient(45deg, #FF4842 30%, #FF867F 90%)',
                        boxShadow: '0 3px 5px 2px rgba(255, 72, 66, .3)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 10px 4px rgba(255, 72, 66, .3)',
                        },
                      }}
                    >
                      Add Borrowed Asset
                    </Button>
                  </CardContent>
                </Card>

                {/* Risk Multiplier */}
                <Card 
                  sx={{ 
                    background: 'rgba(33, 43, 54, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(145, 158, 171, 0.12)',
                    borderRadius: 2,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'info.main',
                          textShadow: '0 0 10px rgba(0, 184, 217, 0.3)',
                          fontWeight: 600,
                        }}
                      >
                        Risk Multiplier: {(multiplier * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Slider
                      value={multiplier}
                      onChange={handleMultiplierChange}
                      min={0}
                      max={1}
                      step={0.01}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 0.5, label: '50%' },
                        { value: 1, label: '100%' }
                      ]}
                      valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                      valueLabelDisplay="auto"
                      sx={{
                        '& .MuiSlider-markLabel': {
                          color: 'text.secondary',
                        },
                        '& .MuiSlider-track': {
                          background: 'linear-gradient(45deg, #00B8D9 30%, #61F3F3 90%)',
                        },
                        '& .MuiSlider-thumb': {
                          boxShadow: '0 0 10px rgba(0, 184, 217, 0.5)',
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 15px rgba(0, 184, 217, 0.7)',
                          },
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </Paper>
            </Grid>

            {/* Right Side - Summary Card */}
            <Grid item xs={12} lg={7}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  background: 'rgba(33, 43, 54, 0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(145, 158, 171, 0.12)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(45deg, #00B8D9 30%, #61F3F3 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontWeight: 700,
                    mb: 4,
                  }}
                >
                  Position Summary
                </Typography>
                <Grid container spacing={3}>
                  {/* Key Metrics */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            background: 'rgba(33, 43, 54, 0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(145, 158, 171, 0.12)',
                            borderRadius: 2,
                            transition: 'all 0.3s ease-in-out',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            height: '100%',
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Total Borrow Value
                          </Typography>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              color: 'error.main',
                              fontWeight: 700,
                              textShadow: '0 0 10px rgba(255, 86, 48, 0.3)',
                            }}
                          >
                            ${formatNumber(totalBorrow)}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            background: 'rgba(33, 43, 54, 0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(145, 158, 171, 0.12)',
                            borderRadius: 2,
                            transition: 'all 0.3s ease-in-out',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            height: '100%',
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Equity
                          </Typography>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              color: 'info.main',
                              fontWeight: 700,
                              textShadow: '0 0 10px rgba(0, 184, 217, 0.3)',
                            }}
                          >
                            ${formatNumber(equity)}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            background: 'rgba(33, 43, 54, 0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(145, 158, 171, 0.12)',
                            borderRadius: 2,
                            transition: 'all 0.3s ease-in-out',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            height: '100%',
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Breakeven Price
                          </Typography>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              color: 'secondary.main',
                              fontWeight: 700,
                              textShadow: '0 0 10px rgba(142, 51, 255, 0.3)',
                            }}
                          >
                            ${formatNumber(breakevenPrice, 4)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Collateral Assets Table */}
                  <Grid item xs={12} sx={{ mb: 3 }}>
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 3,
                        background: 'rgba(33, 43, 54, 0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(145, 158, 171, 0.12)',
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'success.main',
                            textShadow: '0 0 10px rgba(0, 167, 111, 0.3)',
                            fontWeight: 600,
                          }}
                        >
                          Collateral Assets
                        </Typography>
                      </Box>
                      {collaterals.length > 0 ? (
                        <TableContainer 
                          sx={{ 
                            maxHeight: 250,
                            overflowY: 'auto',
                            width: '100%',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              background: 'rgba(145, 158, 171, 0.08)',
                              borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: 'rgba(145, 158, 171, 0.24)',
                              borderRadius: '4px',
                              '&:hover': {
                                background: 'rgba(145, 158, 171, 0.32)',
                              },
                            },
                          }}
                        >
                          <Table 
                            size="small" 
                            stickyHeader
                            sx={{
                              '& .MuiTableCell-root': {
                                borderColor: 'rgba(145, 158, 171, 0.24)',
                                px: 2,
                                '&:first-of-type': {
                                  pl: 2,
                                },
                                '&:last-of-type': {
                                  pr: 2,
                                },
                              },
                              '& .MuiTableCell-head': {
                                background: 'rgba(33, 43, 54, 0.8)',
                                color: 'text.secondary',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                lineHeight: '1.5',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                              },
                              '& .MuiTableBody-root .MuiTableRow-root:hover': {
                                backgroundColor: 'rgba(145, 158, 171, 0.08)',
                              },
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell width="20%">Asset</TableCell>
                                <TableCell align="right" width="25%">Amount</TableCell>
                                <TableCell align="right" width="25%">Price ($)</TableCell>
                                <TableCell align="right" width="20%">Value ($)</TableCell>
                                <TableCell align="center" width="10%">Include</TableCell>
                                <TableCell align="center" width="10%"></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {collaterals.map((collateral) => (
                                <TableRow 
                                  key={collateral.id}
                                  sx={{ 
                                    '& td': {
                                      py: 1.5,
                                      fontSize: '0.875rem',
                                    },
                                  }}
                                >
                                  <Tooltip title="Asset name and symbol" placement="top">
                                    <TableCell 
                                      component="th" 
                                      scope="row"
                                      sx={{
                                        fontWeight: 600,
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getCryptoIcon(collateral.name)}
                                        {collateral.name}
                                      </Box>
                                    </TableCell>
                                  </Tooltip>
                                  <Tooltip title="Click to edit amount" placement="top">
                                    <TableCell 
                                      align="right"
                                      onClick={() => handleEditClick(collateral.id, 'collateral')}
                                      sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                          bgcolor: 'action.hover',
                                        },
                                      }}
                                    >
                                      {formatNumber(collateral.amount)}
                                    </TableCell>
                                  </Tooltip>
                                  <Tooltip title="Click to edit price" placement="top">
                                    <TableCell 
                                      align="right"
                                      onClick={() => handleEditClick(collateral.id, 'collateral')}
                                      sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                          bgcolor: 'action.hover',
                                        },
                                      }}
                                    >
                                      ${formatNumber(collateral.price)}
                                    </TableCell>
                                  </Tooltip>
                                  <Tooltip title="Total value of this asset" placement="top">
                                    <TableCell align="right">
                                      ${formatNumber(collateral.amount * collateral.price)}
                                    </TableCell>
                                  </Tooltip>
                                  <Tooltip title={collateral.included ? 'Click to exclude from calculations' : 'Click to include in calculations'} placement="top">
                                    <TableCell align="center">
                                      <Switch
                                        checked={collateral.included}
                                        onChange={() => updateCollateral(collateral.id, { included: !collateral.included })}
                                        size="small"
                                      />
                                    </TableCell>
                                  </Tooltip>
                                  <Tooltip title="Remove this asset" placement="top">
                                    <TableCell align="center">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent row click when removing
                                          removeCollateral(collateral.id);
                                        }}
                                        sx={{
                                          color: 'error.main',
                                          '&:hover': {
                                            backgroundColor: 'rgba(255, 72, 66, 0.08)',
                                          },
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </Tooltip>
                                </TableRow>
                              ))}
                              <TableRow 
                                sx={{ 
                                  bgcolor: 'rgba(0, 167, 111, 0.08)',
                                  '& td': { border: 0 },
                                }}
                              >
                                <TableCell 
                                  colSpan={3} 
                                  sx={{ 
                                    py: 2,
                                    color: 'text.secondary',
                                    fontWeight: 600,
                                  }}
                                >
                                  Total Included Value
                                </TableCell>
                                <TableCell 
                                  align="right" 
                                  sx={{ 
                                    py: 2,
                                  }}
                                >
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      color: 'success.main',
                                      fontWeight: 700,
                                      textShadow: '0 0 10px rgba(0, 167, 111, 0.3)',
                                    }}
                                  >
                                    ${formatNumber(totalCollateralValue)}
                                  </Typography>
                                </TableCell>
                                <TableCell colSpan={2} sx={{ border: 0 }} />
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box 
                          sx={{ 
                            textAlign: 'center', 
                            py: 3,
                            color: 'text.secondary',
                          }}
                        >
                          <Typography variant="body2">
                            No collateral assets added yet
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Borrowed Assets Table */}
                  <Grid item xs={12} sx={{ mb: 3 }}>
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 3,
                        background: 'rgba(33, 43, 54, 0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(145, 158, 171, 0.12)',
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: 'text.primary' }}>
                          Borrowed Assets
                        </Typography>
                      </Box>
                      {collaterals.length === 0 ? (
                        <Box 
                          sx={{ 
                            textAlign: 'center', 
                            py: 3,
                            color: 'warning.main',
                            bgcolor: 'warning.lighter',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                          }}
                        >
                          <WarningAmberIcon color="warning" />
                          <Typography variant="body2" color="warning.darker">
                            Add collateral assets to enable borrowing
                          </Typography>
                        </Box>
                      ) : borrowedAssets.length === 0 ? (
                        <Box 
                          sx={{ 
                            textAlign: 'center', 
                            py: 3,
                            color: 'text.secondary',
                          }}
                        >
                          <Typography variant="body2">
                            No borrowed assets added yet
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ position: 'relative' }}>
                          {utilizationRate >= 100 && showUtilizationWarning && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 2,
                                p: 3,
                                bgcolor: 'rgba(255, 72, 66, 0.16)',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                border: '1px solid',
                                borderColor: 'error.light',
                                boxShadow: '0 8px 16px rgba(255, 72, 66, 0.16)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                '@keyframes slideIn': {
                                  from: {
                                    opacity: 0,
                                    transform: 'translateY(-20px)',
                                  },
                                  to: {
                                    opacity: 1,
                                    transform: 'translateY(0)',
                                  },
                                },
                              }}
                            >
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1.5,
                              }}>
                                <ErrorOutlineIcon 
                                  color="error"
                                  sx={{ 
                                    fontSize: 20,
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                      '0%': {
                                        transform: 'scale(1)',
                                        opacity: 1,
                                      },
                                      '50%': {
                                        transform: 'scale(1.1)',
                                        opacity: 0.8,
                                      },
                                      '100%': {
                                        transform: 'scale(1)',
                                        opacity: 1,
                                      },
                                    },
                                  }} 
                                />
                                <Typography 
                                  variant="subtitle1"
                                  sx={{ 
                                    color: 'error.main',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontSize: '1.1rem'
                                  }}
                                >
                                  Maximum Utilization Reached
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body1" 
                                color="error.main"
                                sx={{ 
                                  opacity: 0.9,
                                  textAlign: 'center',
                                  maxWidth: '80%',
                                  fontSize: '1rem'
                                }}
                              >
                                {utilizationRate === Infinity ? (
                                  "You have borrowed assets but no collateral. Add collateral or repay your borrowings to maintain a safe position."
                                ) : (
                                  "Add more collateral to borrow more"
                                )}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => setShowUtilizationWarning(false)}
                                sx={{
                                  position: 'absolute',
                                  top: 16,
                                  right: 16,
                                  color: 'error.main',
                                  p: 0.5,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 72, 66, 0.08)',
                                    transform: 'rotate(90deg)',
                                  },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                          <TableContainer 
                            sx={{ 
                              maxHeight: 250,
                              overflowY: 'auto',
                              width: '100%',
                              filter: utilizationRate >= 100 && showUtilizationWarning ? 'blur(1px)' : 'none',
                              opacity: utilizationRate >= 100 && showUtilizationWarning ? 0.8 : 1,
                              transition: 'filter 0.3s ease, opacity 0.3s ease',
                              pointerEvents: utilizationRate >= 100 && showUtilizationWarning ? 'none' : 'auto',
                              mt: utilizationRate >= 100 && showUtilizationWarning ? 6 : 0,
                              '&::-webkit-scrollbar': {
                                width: '8px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background: 'rgba(145, 158, 171, 0.08)',
                                borderRadius: '4px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(145, 158, 171, 0.24)',
                                borderRadius: '4px',
                                '&:hover': {
                                  background: 'rgba(145, 158, 171, 0.32)',
                                },
                              },
                            }}
                          >
                            <Table 
                              size="small" 
                              stickyHeader
                              sx={{
                                '& .MuiTableCell-root': {
                                  borderColor: 'rgba(145, 158, 171, 0.24)',
                                  px: 2,
                                  '&:first-of-type': {
                                    pl: 2,
                                  },
                                  '&:last-of-type': {
                                    pr: 2,
                                  },
                                },
                                '& .MuiTableCell-head': {
                                  background: 'rgba(33, 43, 54, 0.8)',
                                  color: 'text.secondary',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  lineHeight: '1.5',
                                  letterSpacing: '0.5px',
                                  textTransform: 'uppercase',
                                },
                                '& .MuiTableBody-root .MuiTableRow-root:hover': {
                                  backgroundColor: 'rgba(145, 158, 171, 0.08)',
                                },
                              }}
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell width="20%">Asset</TableCell>
                                  <TableCell align="right" width="25%">Amount</TableCell>
                                  <TableCell align="right" width="25%">Price ($)</TableCell>
                                  <TableCell align="right" width="20%">Value ($)</TableCell>
                                  <TableCell align="center" width="10%"></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {borrowedAssets.map((asset) => (
                                  <TableRow 
                                    key={asset.id}
                                    sx={{ 
                                      '& td': {
                                        py: 1.5,
                                        fontSize: '0.875rem',
                                      },
                                    }}
                                  >
                                    <Tooltip title="Asset name and symbol" placement="top">
                                      <TableCell 
                                        component="th" 
                                        scope="row"
                                        sx={{
                                          fontWeight: 600,
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          {getCryptoIcon(asset.name)}
                                          {asset.name}
                                        </Box>
                                      </TableCell>
                                    </Tooltip>
                                    <Tooltip 
                                      title={
                                        remainingBorrowPower > 0 
                                          ? "Click to edit amount" 
                                          : "Cannot borrow more due to insufficient collateral"
                                      } 
                                      placement="top"
                                    >
                                      <TableCell 
                                        align="right"
                                        onClick={() => remainingBorrowPower > 0 && handleEditClick(asset.id, 'borrowed')}
                                        sx={{
                                          cursor: remainingBorrowPower > 0 ? 'pointer' : 'not-allowed',
                                          '&:hover': {
                                            bgcolor: remainingBorrowPower > 0 ? 'action.hover' : 'inherit',
                                          },
                                        }}
                                      >
                                        {formatNumber(asset.amount)}
                                      </TableCell>
                                    </Tooltip>
                                    <Tooltip title="Click to edit price" placement="top">
                                      <TableCell 
                                        align="right"
                                        onClick={() => handleEditClick(asset.id, 'borrowed')}
                                        sx={{
                                          cursor: 'pointer',
                                          '&:hover': {
                                            bgcolor: 'action.hover',
                                          },
                                        }}
                                      >
                                        ${formatNumber(asset.price)}
                                      </TableCell>
                                    </Tooltip>
                                    <Tooltip title="Total borrowed value of this asset" placement="top">
                                      <TableCell align="right">
                                        ${formatNumber(asset.amount * asset.price)}
                                      </TableCell>
                                    </Tooltip>
                                    <Tooltip title="Remove this borrowed asset" placement="top">
                                      <TableCell align="center">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveBorrowed(asset.id)}
                                          sx={{
                                            color: 'error.main',
                                            '&:hover': {
                                              backgroundColor: 'rgba(255, 72, 66, 0.08)',
                                            },
                                            pointerEvents: 'auto',
                                            position: 'relative',
                                            zIndex: 3,
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </TableCell>
                                    </Tooltip>
                                  </TableRow>
                                ))}
                                <TableRow 
                                  sx={{ 
                                    bgcolor: 'rgba(255, 86, 48, 0.08)',
                                    '& td': { border: 0 },
                                  }}
                                >
                                  <TableCell 
                                    colSpan={3} 
                                    sx={{ 
                                      py: 2,
                                      color: 'text.secondary',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Total Borrowed Value
                                  </TableCell>
                                  <TableCell 
                                    align="right" 
                                    sx={{ 
                                      py: 2,
                                    }}
                                  >
                                    <Typography 
                                      variant="h6" 
                                      sx={{ 
                                        color: 'error.main',
                                        fontWeight: 700,
                                        textShadow: '0 0 10px rgba(255, 86, 48, 0.3)',
                                      }}
                                    >
                                      ${formatNumber(totalBorrow)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ border: 0 }} />
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Share your feedback" placement="top">
            <IconButton
              onClick={() => window.open('https://github.com/yourusername/defi-calculator/issues', '_blank')}
              sx={{
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: 'transparent',
                  transform: 'scale(1.1) rotate(5deg)',
                  transition: 'all 0.3s ease-in-out',
                  '& .MuiSvgIcon-root': {
                    filter: 'drop-shadow(0 0 8px #FF4842)',
                  }
                }
              }}
            >
              <RateReviewOutlinedIcon 
                sx={{ 
                  fontSize: 28,
                  color: '#FF4842',
                  filter: 'drop-shadow(0 0 5px #FF484240)',
                  transition: 'all 0.3s ease-in-out'
                }} 
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Support the development of this tool" placement="top">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                '&:hover': {
                  '& .MuiIconButton-root': {
                    transform: 'scale(1.1) rotate(-5deg)',
                  },
                  '& .MuiTypography-root': {
                    transform: 'scale(1.1)',
                  },
                  '& .MuiSvgIcon-root': {
                    filter: 'drop-shadow(0 0 8px #36B37E)',
                  }
                }}
              }
              onClick={() => setShowDonationModal(true)}
            >
              <IconButton
                sx={{
                  bgcolor: 'transparent',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    bgcolor: 'transparent',
                  }
                }}
              >
                <FavoriteIcon 
                  sx={{ 
                    fontSize: 28,
                    color: '#36B37E',
                    filter: 'drop-shadow(0 0 5px #36B37E40)',
                    transition: 'all 0.3s ease-in-out'
                  }} 
                />
              </IconButton>
              <Typography
                variant="caption"
                sx={{
                  color: '#36B37E',
                  fontWeight: 600,
                  textShadow: '0 0 5px #36B37E40',
                  transition: 'all 0.3s ease-in-out',
                  userSelect: 'none',
                }}
              >
                Support me
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        <Dialog
          open={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              backgroundImage: 'linear-gradient(to bottom right, rgba(33, 43, 54, 0.9), rgba(33, 43, 54, 0.6))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(145, 158, 171, 0.12)',
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <VolunteerActivismIcon 
                color="error" 
                sx={{ 
                  fontSize: 32,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                    },
                    '50%': {
                      transform: 'scale(1.2)',
                    },
                    '100%': {
                      transform: 'scale(1)',
                    },
                  },
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Support Development
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Thank you for considering supporting the development! Your contribution helps maintain and improve this tool.
              Every donation, no matter the size, makes a difference.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {walletAddresses.map((wallet) => (
                <Paper
                  key={wallet.chain}
                  elevation={0}
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'rgba(145, 158, 171, 0.08)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: wallet.color,
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) => theme.shadows[4],
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getCryptoIcon(wallet.symbol)}
                    <Typography>
                      {wallet.chain}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'background.paper',
                        p: 1.5,
                        borderRadius: 1,
                        flex: 1,
                        userSelect: 'all',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {truncateAddress(wallet.address)}
                    </Typography>
                    <Tooltip title="Copy Address">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyAddress(wallet.address)}
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': {
                            color: wallet.color,
                            transform: 'scale(1.1)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={() => setShowDonationModal(false)}
              variant="outlined"
              sx={{ 
                minWidth: 100,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Copy Success Notification */}
        <Snackbar
          open={showCopySuccess}
          autoHideDuration={2000}
          onClose={handleCloseCopySuccess}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseCopySuccess} 
            severity="success" 
            sx={{ 
              width: '100%',
              boxShadow: (theme) => theme.shadows[3]
            }}
          >
            Wallet address copied to clipboard!
          </Alert>
        </Snackbar>

        {/* Edit Modal Dialog */}
        <Dialog
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingItem(null);
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Edit {editingItem?.type === 'collateral' ? 'Collateral' : 'Borrowed'} Asset
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Amount"
                type="number"
                value={editingItem?.values.amount || ''}
                onChange={(e) => {
                  if (!editingItem) return;
                  const value = parseFloat(e.target.value);
                  if (isNaN(value)) return;
                  setEditingItem({
                    ...editingItem,
                    values: {
                      ...editingItem.values,
                      amount: value
                    }
                  });
                }}
                fullWidth
              />
              <TextField
                label="Price ($)"
                type="number"
                value={editingItem?.values.price || ''}
                onChange={(e) => {
                  if (!editingItem) return;
                  const value = parseFloat(e.target.value);
                  if (isNaN(value)) return;
                  setEditingItem({
                    ...editingItem,
                    values: {
                      ...editingItem.values,
                      price: value
                    }
                  });
                }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setEditModalOpen(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveChanges}
              sx={{
                bgcolor: editingItem?.type === 'collateral' ? 'success.main' : 'error.main',
                '&:hover': {
                  bgcolor: editingItem?.type === 'collateral' ? 'success.dark' : 'error.dark',
                }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;