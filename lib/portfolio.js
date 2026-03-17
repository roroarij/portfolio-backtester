const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";
const US_EXCHANGES = new Set(["NASDAQ", "NYSE", "NYSEARCA", "AMEX", "BATS"]);

function normalizeTicker(ticker) {
  return String(ticker || "").trim().toUpperCase();
}

function parseQuantity(quantity) {
  const parsed = Number(quantity);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeRange(range) {
  switch (range) {
    case "1y":
    case "2y":
    case "5y":
    case "10y":
    case "max":
      return range;
    default:
      return "5y";
  }
}

function normalizeSuggestion(quote) {
  const symbol = normalizeTicker(quote?.symbol);
  const name = String(quote?.shortname || quote?.longname || "").trim();
  const exchange = String(quote?.exchDisp || quote?.exchange || "").trim();
  const type = String(quote?.quoteType || "").trim();

  if (!symbol || !name) {
    return null;
  }

  return {
    symbol,
    name,
    exchange,
    type
  };
}

async function fetchTickerHistory(symbol, range) {
  const url = new URL(`${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}`);
  url.searchParams.set("interval", "1d");
  url.searchParams.set("includeAdjustedClose", "true");
  url.searchParams.set("events", "div,splits");
  url.searchParams.set("range", normalizeRange(range));

  const response = await fetch(url, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance request failed for ${symbol} (${response.status})`);
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const error = payload?.chart?.error;

  if (error) {
    throw new Error(`${symbol}: ${error.description || "market data error"}`);
  }

  if (!result?.timestamp?.length) {
    throw new Error(`${symbol}: no historical data returned`);
  }

  const closes = result.indicators?.adjclose?.[0]?.adjclose || result.indicators?.quote?.[0]?.close || [];
  const points = result.timestamp
    .map((timestamp, index) => {
      const close = closes[index];
      if (!Number.isFinite(close)) {
        return null;
      }

      return {
        date: new Date(timestamp * 1000).toISOString().slice(0, 10),
        close
      };
    })
    .filter(Boolean);

  if (!points.length) {
    throw new Error(`${symbol}: no usable close prices returned`);
  }

  return points;
}

export async function buildPortfolioHistory(rawHoldings, range) {
  const holdings = rawHoldings
    .map((holding) => ({
      symbol: normalizeTicker(holding?.symbol),
      quantity: parseQuantity(holding?.quantity)
    }))
    .filter((holding) => holding.symbol && holding.quantity);

  if (!holdings.length) {
    throw new Error("Add at least one holding with a valid ticker and quantity.");
  }

  const uniqueSymbols = [...new Set(holdings.map((holding) => holding.symbol))];
  const histories = await Promise.all(
    uniqueSymbols.map(async (symbol) => [symbol, await fetchTickerHistory(symbol, range)])
  );
  const historyMap = new Map(histories);

  const symbolDateMaps = new Map(
    uniqueSymbols.map((symbol) => [symbol, new Map(historyMap.get(symbol).map((point) => [point.date, point.close]))])
  );

  const allDates = [...new Set(uniqueSymbols.flatMap((symbol) => historyMap.get(symbol).map((point) => point.date)))].sort();

  const lastSeen = new Map();
  const series = [];

  for (const date of allDates) {
    for (const symbol of uniqueSymbols) {
      const price = symbolDateMaps.get(symbol).get(date);
      if (Number.isFinite(price)) {
        lastSeen.set(symbol, price);
      }
    }

    const value = holdings.reduce((total, holding) => {
      return total + holding.quantity * (lastSeen.get(holding.symbol) || 0);
    }, 0);

    series.push({
      date,
      value: Number(value.toFixed(2))
    });
  }

  if (!series.length) {
    throw new Error("Unable to calculate a portfolio series from the selected holdings.");
  }

  const firstValue = series[0].value;
  const lastValue = series.at(-1).value;
  const change = lastValue - firstValue;
  const changePct = firstValue === 0 ? 0 : (change / firstValue) * 100;

  return {
    holdings,
    range: normalizeRange(range),
    startDate: series[0].date,
    endDate: series.at(-1).date,
    summary: {
      startValue: Number(firstValue.toFixed(2)),
      endValue: Number(lastValue.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePct: Number(changePct.toFixed(2))
    },
    series
  };
}

export async function searchTickers(rawQuery) {
  const query = String(rawQuery || "").trim();
  if (query.length < 1) {
    return [];
  }

  const url = new URL(YAHOO_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("quotesCount", "8");
  url.searchParams.set("newsCount", "0");
  url.searchParams.set("enableFuzzyQuery", "true");
  url.searchParams.set("quotesQueryId", "tss_match_phrase_query");
  url.searchParams.set("multiQuoteQueryId", "multi_quote_single_token_query");

  const response = await fetch(url, {
    headers: {
      "user-agent": "portfolio-backtester/1.0"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance symbol search failed (${response.status})`);
  }

  const payload = await response.json();
  const seen = new Set();

  return (payload?.quotes || [])
    .map(normalizeSuggestion)
    .filter(Boolean)
    .filter((quote) => {
      const allowed = quote.type === "EQUITY" || quote.type === "ETF";
      const exchange = quote.exchange.toUpperCase().replaceAll(" ", "");
      const isUsListing = US_EXCHANGES.has(exchange);

      if (!allowed || !isUsListing || seen.has(quote.symbol)) {
        return false;
      }

      seen.add(quote.symbol);
      return true;
    });
}
