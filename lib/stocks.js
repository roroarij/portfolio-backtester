import { searchTickers, fetchTickerHistory } from "@/lib/portfolio";

function normalizeTicker(rawTicker) {
  return String(rawTicker || "").trim().toUpperCase();
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
