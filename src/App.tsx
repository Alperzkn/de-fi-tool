import React, { useState, useEffect, useRef } from 'react';
import { Calculator } from 'lucide-react';

interface Asset {
  name: string;
  price: number;
  amount: number;
}

interface Config {
  collateral: Asset;
  borrow: Asset;
  multiplier: number;
}

// Load initial config from localStorage
const getInitialConfig = (): Config => {
  try {
    const savedConfig = localStorage.getItem('defiConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Error loading initial config:', error);
  }
  return {
    collateral: { name: '', price: 0, amount: 0 },
    borrow: { name: '', price: 0, amount: 0 },
    multiplier: 0.8
  };
};

// Calculate background color based on percentage
const calculateBackgroundColor = (percentage: number): string => {
  // Convert percentage to a value between 0 and 1
  const value = Math.min(Math.max(percentage, 0), 1);
  
  // Define color stops for different risk levels (pastel colors)
  const colorStops = [
    { threshold: 0, color: [167, 243, 208] },     // Pastel mint green
    { threshold: 0.3, color: [167, 243, 243] },   // Pastel cyan
    { threshold: 0.5, color: [253, 230, 138] },   // Pastel yellow
    { threshold: 0.7, color: [253, 164, 175] },   // Pastel pink
    { threshold: 0.85, color: [252, 165, 165] },  // Pastel salmon
    { threshold: 1, color: [254, 178, 178] }      // Pastel red
  ];

  // Find the appropriate color stops based on the current value
  let lowerStop = colorStops[0];
  let upperStop = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (value >= colorStops[i].threshold && value <= colorStops[i + 1].threshold) {
      lowerStop = colorStops[i];
      upperStop = colorStops[i + 1];
      break;
    }
  }

  // Calculate the percentage between the two stops
  const stopRange = upperStop.threshold - lowerStop.threshold;
  const valueInRange = value - lowerStop.threshold;
  const percentInRange = stopRange === 0 ? 0 : valueInRange / stopRange;

  // Interpolate between the two colors with reduced opacity for dark mode
  const color = lowerStop.color.map((start, index) => {
    const end = upperStop.color[index];
    return Math.round(start + (end - start) * percentInRange);
  });

  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.15)`;
};

function App() {
  const initialConfig = getInitialConfig();
  const hasUserMadeChanges = useRef(false);
  
  const [collateral, setCollateral] = useState<Asset>(initialConfig.collateral);
  const [borrow, setBorrow] = useState<Asset>(initialConfig.borrow);
  const [multiplier, setMultiplier] = useState<number>(initialConfig.multiplier);
  
  const [totalDeposit, setTotalDeposit] = useState<number>(0);
  const [totalBorrow, setTotalBorrow] = useState<number>(0);
  const [equity, setEquity] = useState<number>(0);
  const [breakevenPrice, setBreakevenPrice] = useState<number>(0);

  // Save configuration whenever it changes (but only after user has made changes)
  useEffect(() => {
    if (!hasUserMadeChanges.current) {
      return;
    }

    try {
      const config: Config = {
        collateral,
        borrow,
        multiplier
      };
      console.log('Saving config:', config);
      localStorage.setItem('defiConfig', JSON.stringify(config));
      console.log('Config saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }, [collateral, borrow, multiplier]);

  useEffect(() => {
    const deposit = collateral.price * collateral.amount;
    setTotalDeposit(deposit);
    
    const borrowValue = borrow.price * borrow.amount;
    setTotalBorrow(borrowValue);
    
    setEquity(deposit - borrowValue);

    const breakeven = collateral.amount > 0 
      ? (borrowValue / multiplier) / collateral.amount 
      : 0;
    setBreakevenPrice(breakeven);
  }, [collateral, borrow, multiplier]);

  const handleTokenNameChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<Asset>>, asset: Asset) => {
    hasUserMadeChanges.current = true;
    const newAsset = {...asset, name: e.target.value.toUpperCase()};
    setter(newAsset);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<Asset>>, asset: Asset) => {
    hasUserMadeChanges.current = true;
    const newAsset = {...asset, price: parseFloat(e.target.value) || 0};
    setter(newAsset);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<Asset>>, asset: Asset) => {
    hasUserMadeChanges.current = true;
    const newAsset = {...asset, amount: parseFloat(e.target.value) || 0};
    setter(newAsset);
  };

  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    hasUserMadeChanges.current = true;
    setMultiplier(parseFloat(e.target.value));
  };

  // Calculate maximum borrow amount and current percentage
  const maxBorrowAmount = collateral.price * collateral.amount * multiplier / (borrow.price || 1);
  const borrowPercentage = maxBorrowAmount > 0 ? borrow.amount / maxBorrowAmount : 0;
  const backgroundColor = calculateBackgroundColor(borrowPercentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-3 sm:p-6">
      <div 
        className="max-w-4xl mx-auto rounded-xl shadow-2xl p-4 sm:p-8 transition-all duration-500 transform hover:scale-[1.02] bg-gray-800/50"
        style={{ 
          backgroundColor,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-bounce" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 transform transition-transform hover:scale-105">DeFi Lending Calculator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Collateral Section */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl border border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-200">Collateral Deposit</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Token Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md text-base bg-gray-700 border-gray-600 text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ETH"
                  onChange={(e) => handleTokenNameChange(e, setCollateral, collateral)}
                  value={collateral.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Token Price ($)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md text-base bg-gray-700 border-gray-600 text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  onChange={(e) => handlePriceChange(e, setCollateral, collateral)}
                  value={collateral.price === 0 ? '' : collateral.price}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md text-base bg-gray-700 border-gray-600 text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.000000"
                  onChange={(e) => handleAmountChange(e, setCollateral, collateral)}
                  value={collateral.amount === 0 ? '' : collateral.amount}
                  min="0"
                  step="0.0001"
                />
              </div>
            </div>
          </div>

          {/* Borrow Section */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl border border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-200">Borrow Assets</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Token Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md text-base bg-gray-700 border-gray-600 text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., USDC"
                  onChange={(e) => handleTokenNameChange(e, setBorrow, borrow)}
                  value={borrow.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Token Price ($)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md text-base bg-gray-700 border-gray-600 text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  onChange={(e) => handlePriceChange(e, setBorrow, borrow)}
                  value={borrow.price === 0 ? '' : borrow.price}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md text-base bg-gray-700 border-gray-600 text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.000000"
                  onChange={(e) => handleAmountChange(e, setBorrow, borrow)}
                  value={borrow.amount === 0 ? '' : borrow.amount}
                  min="0"
                  step="0.0001"
                />
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span className="font-medium">0</span>
                    <span className="font-medium">Max: {((collateral.price * collateral.amount * multiplier) / borrow.price).toFixed(4)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={collateral.price * collateral.amount * multiplier / (borrow.price || 1)}
                    step="0.0001"
                    value={borrow.amount}
                    onChange={(e) => handleAmountChange(e, setBorrow, borrow)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-300 hover:bg-gray-600"
                    style={{
                      background: `linear-gradient(to right, #60A5FA ${borrowPercentage * 100}%, #374151 ${borrowPercentage * 100}%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multiplier Section */}
        <div className="mt-4 sm:mt-8 bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl border border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-200">Risk Multiplier</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Manual Input</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md text-base bg-gray-700 border-gray-600 text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.8"
                value={multiplier === 0 ? '' : multiplier}
                onChange={(e) => handleMultiplierChange(e)}
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={multiplier}
                onChange={handleMultiplierChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-300 hover:bg-gray-600"
                style={{
                  background: `linear-gradient(to right, #60A5FA ${multiplier * 100}%, #374151 ${multiplier * 100}%)`
                }}
              />
              <span className="text-base sm:text-lg font-medium text-gray-300 min-w-[3ch]">{multiplier.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-4 sm:mt-8 bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-200">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-gray-900/80 p-3 sm:p-4 rounded-lg shadow-md transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl border border-gray-700">
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Total Deposit Value</h3>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400">${totalDeposit.toFixed(2)}</p>
            </div>
            <div className="bg-gray-900/80 p-3 sm:p-4 rounded-lg shadow-md transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl border border-gray-700">
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Total Borrow Value</h3>
              <p className="text-xl sm:text-2xl font-bold text-rose-400">${totalBorrow.toFixed(2)}</p>
            </div>
            <div className="bg-gray-900/80 p-3 sm:p-4 rounded-lg shadow-md transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl border border-gray-700">
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Equity</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">${equity.toFixed(2)}</p>
            </div>
            <div className="bg-gray-900/80 p-3 sm:p-4 rounded-lg shadow-md transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl border border-gray-700">
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Breakeven Price</h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-400">${breakevenPrice.toFixed(4)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;