import test from "node:test";
import assert from "node:assert/strict";

import { getFeaturedPortfolios, getFeaturedStockTickers, getHomepageSymbolGroups, stockHubViews } from "./site-data.js";

test("getFeaturedStockTickers includes homepage groups and featured portfolio holdings", () => {
  const tickers = getFeaturedStockTickers();
  const { indexes, trendingStocks, commodities } = getHomepageSymbolGroups();
  const portfolioSymbols = getFeaturedPortfolios().flatMap((portfolio) => portfolio.holdings.map((holding) => holding.symbol));

  for (const ticker of [...indexes, ...trendingStocks, ...commodities, ...portfolioSymbols]) {
    assert.ok(tickers.includes(ticker));
  }

  assert.ok(tickers.includes("BULL"));
  assert.ok(tickers.includes("CRSP"));
  assert.ok(tickers.includes("BABA"));
});

test("stockHubViews includes all crawlable stock subroutes", () => {
  assert.deepEqual(stockHubViews, ["chart", "technical-analysis", "fundamentals", "leadership", "news"]);
});
