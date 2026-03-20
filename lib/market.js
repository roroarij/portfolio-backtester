import { getTickerFundamentalsData, getTickerPageData } from "./stocks.js";

export async function loadQuoteBatch(symbols, loader = getTickerPageData) {
  const results = await Promise.allSettled(symbols.map((symbol) => loader(symbol)));

  return results
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .filter(Boolean);
}

export async function loadStockBatch(symbols) {
  return loadQuoteBatch(symbols, getTickerFundamentalsData);
}
