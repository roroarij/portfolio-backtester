import YahooFinance from "yahoo-finance2";

import { searchTickers, fetchTickerHistory } from "./portfolio.js";

const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";
const WIKIPEDIA_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const WIKIPEDIA_SEARCH_URL = "https://en.wikipedia.org/w/api.php";
const WIKIDATA_ENTITY_URL = "https://www.wikidata.org/wiki/Special:EntityData";
const yahooFinance = new YahooFinance();

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

function average(values) {
  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateSma(values, period) {
  if (values.length < period) {
    return null;
  }

  return average(values.slice(-period));
}

function calculateRsi(values, period = 14) {
  if (values.length <= period) {
    return null;
  }

  let gains = 0;
  let losses = 0;

  for (let index = values.length - period; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];

    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const averageGain = gains / period;
  const averageLoss = losses / period;

  if (averageLoss === 0) {
    return 100;
  }

  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}

export function calculateTechnicalAnalysis(history) {
  const closes = history.map((point) => point.close).filter(Number.isFinite);

  if (!closes.length) {
    throw new Error("History is required to calculate technical analysis.");
  }

  const latestClose = closes.at(-1);
  const sma20 = calculateSma(closes, 20);
  const sma50 = calculateSma(closes, 50);
  const sma200 = calculateSma(closes, 200);
  const rsi14 = calculateRsi(closes, 14);
  const high52Week = Math.max(...closes);
  const low52Week = Math.min(...closes);
  const distanceFromHigh = high52Week === 0 ? null : ((latestClose - high52Week) / high52Week) * 100;
  const distanceFromLow = low52Week === 0 ? null : ((latestClose - low52Week) / low52Week) * 100;

  let trend = "mixed";
  if (sma20 && sma50 && sma200) {
    if (latestClose > sma20 && sma20 > sma50 && sma50 > sma200) {
      trend = "bullish";
    } else if (latestClose < sma20 && sma20 < sma50 && sma50 < sma200) {
      trend = "bearish";
    }
  }

  let momentum = "neutral";
  if (Number.isFinite(rsi14)) {
    if (rsi14 >= 70) {
      momentum = "overbought";
    } else if (rsi14 <= 30) {
      momentum = "oversold";
    }
  }

  return {
    latestClose: Number(latestClose.toFixed(2)),
    sma20: Number.isFinite(sma20) ? Number(sma20.toFixed(2)) : null,
    sma50: Number.isFinite(sma50) ? Number(sma50.toFixed(2)) : null,
    sma200: Number.isFinite(sma200) ? Number(sma200.toFixed(2)) : null,
    rsi14: Number.isFinite(rsi14) ? Number(rsi14.toFixed(2)) : null,
    high52Week: Number(high52Week.toFixed(2)),
    low52Week: Number(low52Week.toFixed(2)),
    distanceFromHigh: Number.isFinite(distanceFromHigh) ? Number(distanceFromHigh.toFixed(2)) : null,
    distanceFromLow: Number.isFinite(distanceFromLow) ? Number(distanceFromLow.toFixed(2)) : null,
    trend,
    momentum
  };
}

async function fetchQuoteSummary(symbol) {
  return yahooFinance.quoteSummary(symbol, {
    modules: [
      "assetProfile",
      "summaryDetail",
      "defaultKeyStatistics",
      "financialData",
      "summaryProfile",
      "price"
    ]
  });
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
    snippet:
      item.summary ||
      item.description ||
      item.content?.summary ||
      item.content?.description ||
      item.content?.snippet ||
      null,
    link: item.link,
    publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : null
  }));
}

async function fetchWikipediaSummaryByTitle(title) {
  const response = await fetch(`${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(title)}`, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();

  if (!payload?.extract || payload?.type === "disambiguation") {
    return null;
  }

  return payload.extract;
}

async function fetchWikipediaSummary(query) {
  if (!query) {
    return null;
  }

  const directSummary = await fetchWikipediaSummaryByTitle(query);
  if (directSummary) {
    return directSummary;
  }

  const searchUrl = new URL(WIKIPEDIA_SEARCH_URL);
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", query);
  searchUrl.searchParams.set("srlimit", "1");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("utf8", "1");

  const searchResponse = await fetch(searchUrl, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!searchResponse.ok) {
    return null;
  }

  const searchPayload = await searchResponse.json();
  const topResult = searchPayload?.query?.search?.[0]?.title;

  if (!topResult) {
    return null;
  }

  return fetchWikipediaSummaryByTitle(topResult);
}

async function fetchWikipediaPageTitle(query) {
  if (!query) {
    return null;
  }

  const directSummaryResponse = await fetch(`${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(query)}`, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (directSummaryResponse.ok) {
    const payload = await directSummaryResponse.json();
    if (payload?.title && payload?.type !== "disambiguation") {
      return payload.title;
    }
  }

  const searchUrl = new URL(WIKIPEDIA_SEARCH_URL);
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", query);
  searchUrl.searchParams.set("srlimit", "1");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("utf8", "1");

  const searchResponse = await fetch(searchUrl, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!searchResponse.ok) {
    return null;
  }

  const searchPayload = await searchResponse.json();
  return searchPayload?.query?.search?.[0]?.title || null;
}

async function fetchWikipediaWebsite(query) {
  const pageTitle = await fetchWikipediaPageTitle(query);

  if (!pageTitle) {
    return null;
  }

  const pagePropsUrl = new URL(WIKIPEDIA_SEARCH_URL);
  pagePropsUrl.searchParams.set("action", "query");
  pagePropsUrl.searchParams.set("prop", "pageprops");
  pagePropsUrl.searchParams.set("titles", pageTitle);
  pagePropsUrl.searchParams.set("format", "json");
  pagePropsUrl.searchParams.set("utf8", "1");

  const pagePropsResponse = await fetch(pagePropsUrl, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!pagePropsResponse.ok) {
    return null;
  }

  const pagePropsPayload = await pagePropsResponse.json();
  const pages = pagePropsPayload?.query?.pages || {};
  const page = Object.values(pages)[0];
  const wikibaseItem = page?.pageprops?.wikibase_item;

  if (!wikibaseItem) {
    return null;
  }

  const entityResponse = await fetch(`${WIKIDATA_ENTITY_URL}/${wikibaseItem}.json`, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!entityResponse.ok) {
    return null;
  }

  const entityPayload = await entityResponse.json();
  const entity = entityPayload?.entities?.[wikibaseItem];
  const websiteClaim = entity?.claims?.P856?.[0]?.mainsnak?.datavalue?.value;

  return typeof websiteClaim === "string" ? websiteClaim : null;
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

  const pageData = await getTickerPageData(ticker);
  let summary = null;

  try {
    summary = await fetchQuoteSummary(ticker);
  } catch {
    summary = null;
  }

  const price = summary?.price || {};
  const summaryDetail = summary?.summaryDetail || {};
  const financialData = summary?.financialData || {};
  const keyStats = summary?.defaultKeyStatistics || {};
  const assetProfile = summary?.assetProfile || {};
  const summaryProfile = summary?.summaryProfile || {};
  const yahooBusinessSummary = assetProfile.longBusinessSummary || summaryProfile.longBusinessSummary || null;
  const wikipediaBusinessSummary = yahooBusinessSummary ? null : await fetchWikipediaSummary(pageData.name);
  const yahooWebsite = assetProfile.website || summaryProfile.website || null;
  const wikipediaWebsite = yahooWebsite ? null : await fetchWikipediaWebsite(pageData.name);

  return {
    ...pageData,
    sector: assetProfile.sector || summaryProfile.sector || null,
    industry: assetProfile.industry || summaryProfile.industry || null,
    website: yahooWebsite || wikipediaWebsite,
    businessSummary: yahooBusinessSummary || wikipediaBusinessSummary,
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
    recommendationKey: financialData.recommendationKey || null,
    leadership: Array.isArray(assetProfile.companyOfficers)
      ? assetProfile.companyOfficers.map((officer) => ({
          name: officer.name || null,
          title: officer.title || null,
          age: Number.isFinite(officer.age) ? officer.age : null,
          yearBorn: Number.isFinite(officer.yearBorn) ? officer.yearBorn : null,
          totalPay: pickNumber(officer.totalPay?.raw, officer.totalPay)
        }))
      : []
  };
}

export async function getTickerNews(rawTicker) {
  const ticker = normalizeTicker(rawTicker);

  if (!ticker) {
    throw new Error("Ticker is required.");
  }

  try {
    return await fetchTickerNews(ticker);
  } catch {
    return [];
  }
}

export async function getTickerTechnicalAnalysis(rawTicker) {
  const pageData = await getTickerPageData(rawTicker);

  return {
    ...pageData,
    technicals: calculateTechnicalAnalysis(pageData.history)
  };
}
