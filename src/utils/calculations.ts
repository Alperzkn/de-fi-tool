import { CollateralAsset, BorrowedAsset } from '../types';

export const calculateTotalCollateralValue = (collaterals: CollateralAsset[]): number => {
  return collaterals
    .filter(c => c.included)
    .reduce((sum, c) => sum + c.amount * c.price, 0);
};

export const calculateTotalCollateralAmount = (collaterals: CollateralAsset[]): number => {
  return collaterals
    .filter(c => c.included)
    .reduce((sum, c) => sum + c.amount, 0);
};

export const calculateTotalBorrow = (borrowedAssets: BorrowedAsset[]): number => {
  return borrowedAssets.reduce((sum, asset) => sum + asset.amount * asset.price, 0);
};

export const calculateEquity = (totalCollateralValue: number, totalBorrow: number): number => {
  return totalCollateralValue - totalBorrow;
};

export const calculateBreakevenPrice = (
  totalBorrow: number,
  totalCollateralAmount: number,
  multiplier: number
): number => {
  return totalCollateralAmount > 0 && multiplier > 0
    ? totalBorrow / (multiplier * totalCollateralAmount)
    : 0;
};

export const calculateUtilizationRate = (
  totalBorrow: number,
  totalCollateralValue: number,
  multiplier: number
): number => {
  return (totalBorrow / (totalCollateralValue * multiplier)) * 100;
};

export const calculateRemainingBorrowPower = (
  totalCollateralValue: number,
  totalBorrowedValue: number,
  multiplier: number
): number => {
  return Math.max(0, (totalCollateralValue * multiplier) - totalBorrowedValue);
};

export const calculateMaxBorrowAmount = (
  totalCollateralValue: number,
  multiplier: number,
  otherAssetsValue: number,
  price: number
): number => {
  return Math.max(0, (totalCollateralValue * multiplier - otherAssetsValue) / price);
};
