import test from "node:test";
import assert from "node:assert/strict";

import {
  canonicalStaticRoutes,
  getFeaturedPortfolios,
  getFeaturedStockTickers,
  getHomepageSymbolGroups,
  getMarketSections,
  getToolCatalog,
  stockHubViews
} from "./site-data.js";

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

test("canonicalStaticRoutes includes the major tool and market routes", () => {
  const paths = canonicalStaticRoutes.map((entry) => entry.path);

  assert.ok(paths.includes("/discover/stocks"));
  assert.ok(paths.includes("/markets/indexes"));
  assert.ok(paths.includes("/tools/dca-calculator"));
  assert.ok(paths.includes("/tools/options-strategy-calculator"));
});

test("tool and market catalogs expose live route hrefs", () => {
  const tools = getToolCatalog();
  const markets = getMarketSections();

  assert.ok(tools.some((item) => item.href === "/tools/position-size-calculator"));
  assert.ok(markets.some((item) => item.href === "/markets/sectors"));
});
