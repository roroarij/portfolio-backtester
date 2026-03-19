import { searchTickers, fetchTickerHistory } from "@/lib/portfolio";

const YAHOO_QUOTE_SUMMARY_URL = "https://query1.finance.yahoo.com/v10/finance/quoteSummary";
const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";

function normalizeTicker(rawTicker) {
  return String(rawTicker || "").trim().toUpperCase();
}

function pickNumber(...values) {
  for (const value of values) {
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

async function fetchQuoteSummary(symbol) {
  const url = new URL(`${YAHOO_QUOTE_SUMMARY_URL}/${encodeURIComponent(symbol)}`);
  url.searchParams.set(
    "modules",
    [
      "price",
      "summaryDetail",
      "defaultKeyStatistics",
      "financialData",
      "assetProfile",
      "summaryProfile"
    ].join(",")
  );

  const response = await fetch(url, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Yahoo quote summary request failed for ${symbol} (${response.status})`);
  }

  const payload = await response.json();
  const result = payload?.quoteSummary?.result?.[0];
  const error = payload?.quoteSummary?.error;

  if (error || !result) {
    throw new Error(`${symbol}: quote summary unavailable`);
  }

  return result;
}

async function fetchTickerNews(symbol) {
  const url = new URL(YAHOO_SEARCH_URL);
  url.searchParams.set("q", symbol);
  url.searchParams.set("quotesCount", "0");
  url.searchParams.set("newsCount", "6");
  url.searchParams.set("enableFuzzyQuery", "false");

  const response = await fetch(url, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Yahoo news request failed for ${symbol} (${response.status})`);
  }

  const payload = await response.json();

  return (payload?.news || []).map((item) => ({
    title: item.title,
    publisher: item.publisher,
    link: item.link,
    publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : null
  }));
}

export async function getTickerPageData(rawTicker, range = "1y") {
  const ticker = normalizeTicker(rawTicker);

  if (!ticker) {
    throw new Error("Ticker is required.");
  }

  const [suggestions, history] = await Promise.all([searchTickers(ticker), fetchTickerHistory(ticker, range)]);
  const matched = suggestions.find((entry) => entry.symbol === ticker) || suggestions[0];
  const latest = history.at(-1);
  const first = history[0];

  if (!matched || !latest || !first) {
    throw new Error(`Unable to load stock data for ${ticker}.`);
  }

  const change = latest.close - first.close;
  const changePct = first.close === 0 ? 0 : (change / first.close) * 100;
  const high = Math.max(...history.map((point) => point.close));
  const low = Math.min(...history.map((point) => point.close));

  return {
    ticker,
    name: matched.name,
    exchange: matched.exchange,
    type: matched.type,
    range,
    latestDate: latest.date,
    latestClose: Number(latest.close.toFixed(2)),
    startDate: first.date,
    startClose: Number(first.close.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePct: Number(changePct.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    history
  };
}

export async function getTickerFundamentalsData(rawTicker) {
  const ticker = normalizeTicker(rawTicker);

  if (!ticker) {
    throw new Error("Ticker is required.");
  }

  const [summary, pageData] = await Promise.all([fetchQuoteSummary(ticker), getTickerPageData(ticker)]);
  const price = summary.price || {};
  const summaryDetail = summary.summaryDetail || {};
  const financialData = summary.financialData || {};
  const keyStats = summary.defaultKeyStatistics || {};
  const assetProfile = summary.assetProfile || {};
  const summaryProfile = summary.summaryProfile || {};

  return {
    ...pageData,
    sector: assetProfile.sector || summaryProfile.sector || null,
    industry: assetProfile.industry || summaryProfile.industry || null,
    website: assetProfile.website || summaryProfile.website || null,
    businessSummary: assetProfile.longBusinessSummary || summaryProfile.longBusinessSummary || null,
    marketCap: pickNumber(price.marketCap?.raw, price.marketCap),
    fiftyTwoWeekHigh: pickNumber(summaryDetail.fiftyTwoWeekHigh?.raw, summaryDetail.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: pickNumber(summaryDetail.fiftyTwoWeekLow?.raw, summaryDetail.fiftyTwoWeekLow),
    trailingPe: pickNumber(summaryDetail.trailingPE?.raw, summaryDetail.trailingPE),
    forwardPe: pickNumber(summaryDetail.forwardPE?.raw, summaryDetail.forwardPE),
    dividendYield: pickNumber(summaryDetail.dividendYield?.raw, summaryDetail.dividendYield),
    beta: pickNumber(summaryDetail.beta?.raw, summaryDetail.beta),
    priceToBook: pickNumber(keyStats.priceToBook?.raw, keyStats.priceToBook),
    enterpriseValue: pickNumber(keyStats.enterpriseValue?.raw, keyStats.enterpriseValue),
    profitMargins: pickNumber(financialData.profitMargins?.raw, financialData.profitMargins),
    operatingMargins: pickNumber(financialData.operatingMargins?.raw, financialData.operatingMargins),
    returnOnEquity: pickNumber(financialData.returnOnEquity?.raw, financialData.returnOnEquity),
    totalRevenue: pickNumber(financialData.totalRevenue?.raw, financialData.totalRevenue),
    revenueGrowth: pickNumber(financialData.revenueGrowth?.raw, financialData.revenueGrowth),
    grossMargins: pickNumber(financialData.grossMargins?.raw, financialData.grossMargins),
    currentPrice: pickNumber(financialData.currentPrice?.raw, financialData.currentPrice, price.regularMarketPrice?.raw, price.regularMarketPrice),
    targetMeanPrice: pickNumber(financialData.targetMeanPrice?.raw, financialData.targetMeanPrice),
    recommendationKey: financialData.recommendationKey || null
  };
}

export async function getTickerNews(rawTicker) {
  const ticker = normalizeTicker(rawTicker);

  if (!ticker) {
    throw new Error("Ticker is required.");
  }

  return fetchTickerNews(ticker);
}
