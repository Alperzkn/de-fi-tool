export const fetchPrices = async (assets: string[]) => {
  try {
    const uniqueAssets = [...new Set(assets.map(asset => asset.toLowerCase()))];
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueAssets.join(',')}&vs_currencies=usd`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
};
