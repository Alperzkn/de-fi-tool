import { useState, useEffect } from 'react';
import { CollateralAsset, BorrowedAsset, Token } from '../types';
import { calculateMaxBorrowAmount } from '../utils/calculations';

interface UseAssetsProps {
  multiplier: number;
}

interface UseAssetsReturn {
  collaterals: CollateralAsset[];
  borrowedAssets: BorrowedAsset[];
  newAsset: Omit<CollateralAsset, 'id'>;
  borrow: Token;
  addCollateral: () => void;
  removeCollateral: (id: string) => void;
  updateCollateral: (id: string, updates: Partial<CollateralAsset>) => void;
  addBorrowedAsset: () => void;
  removeBorrowedAsset: (id: string) => void;
  handleCollateralEdit: (id: string, field: 'amount' | 'price', value: number) => void;
  handleBorrowedEdit: (id: string, field: 'amount' | 'price', value: number) => void;
  setNewAsset: React.Dispatch<React.SetStateAction<Omit<CollateralAsset, 'id'>>>;
  setBorrow: React.Dispatch<React.SetStateAction<Token>>;
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

export const useAssets = ({ multiplier }: UseAssetsProps): UseAssetsReturn => {
  const [collaterals, setCollaterals] = useState<CollateralAsset[]>(getInitialConfig().collaterals);
  const [borrowedAssets, setBorrowedAssets] = useState<BorrowedAsset[]>(getInitialConfig().borrowedAssets);
  const [borrow, setBorrow] = useState<Token>(getInitialConfig().borrow);
  const [newAsset, setNewAsset] = useState<Omit<CollateralAsset, 'id'>>({
    name: '',
    price: 0,
    amount: 0,
    included: true,
  });

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
          if ('name' in updates) {
            updates.name = updates.name?.toUpperCase();
          }
          return { ...c, ...updates };
        }
        return c;
      })
    );
  };

  const handleCollateralEdit = (id: string, field: 'amount' | 'price', value: number) => {
    if (value < 0) return;
    setCollaterals(prevCollaterals =>
      prevCollaterals.map(collateral =>
        collateral.id === id ? { ...collateral, [field]: value } : collateral
      )
    );
  };

  const handleBorrowedEdit = (id: string, field: 'amount' | 'price', value: number) => {
    if (value < 0) return;

    setBorrowedAssets(prevAssets => {
      const assetToUpdate = prevAssets.find(a => a.id === id);
      if (!assetToUpdate) return prevAssets;

      const otherAssets = prevAssets.filter(a => a.id !== id);
      const otherAssetsValue = otherAssets.reduce((sum, asset) => sum + (asset.amount * asset.price), 0);
      const totalCollateralValue = collaterals
        .filter(c => c.included)
        .reduce((sum, c) => sum + c.amount * c.price, 0);

      if (field === 'price') {
        const maxAmount = calculateMaxBorrowAmount(
          totalCollateralValue,
          multiplier,
          otherAssetsValue,
          value
        );
        const newAmount = Math.min(assetToUpdate.amount, maxAmount);
        
        return [
          ...otherAssets,
          {
            ...assetToUpdate,
            price: value,
            amount: newAmount
          }
        ];
      } else {
        const maxAmount = calculateMaxBorrowAmount(
          totalCollateralValue,
          multiplier,
          otherAssetsValue,
          assetToUpdate.price
        );
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

  const addBorrowedAsset = () => {
    if (borrow.name) {
      setBorrowedAssets([
        ...borrowedAssets,
        {
          ...borrow,
          id: Date.now().toString(),
        },
      ]);
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

  return {
    collaterals,
    borrowedAssets,
    newAsset,
    borrow,
    addCollateral,
    removeCollateral,
    updateCollateral,
    addBorrowedAsset,
    removeBorrowedAsset,
    handleCollateralEdit,
    handleBorrowedEdit,
    setNewAsset,
    setBorrow,
  };
};
