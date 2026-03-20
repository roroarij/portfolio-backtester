import test from "node:test";
import assert from "node:assert/strict";

import {
  SITEMAP_CHUNK_SIZE,
  buildPortfolioRouteEntries,
  buildRobotsTxt,
  buildSitemapIndexXml,
  buildStaticRouteEntries,
  buildStockRouteEntries,
  chunkEntries,
  normalizeTickerUniverse
} from "./sitemap.js";
import { stockHubViews } from "./site-data.js";

test("normalizeTickerUniverse keeps valid unique tickers and removes invalid ones", () => {
  const input = [
    { cik: 1, ticker: "AAPL", title: "Apple Inc." },
    { cik: 2, ticker: "AAPL", title: "Duplicate Apple" },
    { cik: 3, ticker: "BRK.B", title: "Berkshire Hathaway Inc." },
    { cik: 4, ticker: "BAD/1", title: "Invalid" },
    { cik: 5, ticker: "", title: "Empty" }
  ];

  assert.deepEqual(
    normalizeTickerUniverse(input).map((record) => record.ticker),
    ["AAPL", "BRK.B"]
  );
});

test("chunkEntries chunks deterministically", () => {
  const entries = Array.from({ length: SITEMAP_CHUNK_SIZE + 5 }, (_, index) => ({ url: `https://example.com/${index}` }));
  const chunks = chunkEntries(entries, SITEMAP_CHUNK_SIZE);

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].length, SITEMAP_CHUNK_SIZE);
  assert.equal(chunks[1].length, 5);
  assert.equal(chunks[1][0].url, `https://example.com/${SITEMAP_CHUNK_SIZE}`);
});

test("buildStockRouteEntries includes all expected dynamic stock routes", () => {
  const entries = buildStockRouteEntries([{ ticker: "AAPL", cik: 320193, title: "Apple Inc." }], new Date("2026-03-20T00:00:00Z"));
  const urls = entries.map((entry) => entry.url);

  assert.ok(urls.includes("https://stocksscreener.com/stocks/AAPL"));

  for (const view of stockHubViews) {
    assert.ok(urls.includes(`https://stocksscreener.com/stocks/AAPL/${view}`));
  }
});

test("sitemap index references child sitemap files", () => {
  const xml = buildSitemapIndexXml(["/sitemaps/static.xml.gz", "/sitemaps/stocks-1.xml.gz"], new Date("2026-03-20T00:00:00Z"));

  assert.match(xml, /https:\/\/stocksscreener\.com\/sitemaps\/static\.xml\.gz/);
  assert.match(xml, /https:\/\/stocksscreener\.com\/sitemaps\/stocks-1\.xml\.gz/);
});

test("robots.txt references sitemap index", () => {
  const robots = buildRobotsTxt();

  assert.match(robots, /Sitemap: https:\/\/stocksscreener\.com\/sitemap\.xml/);
});

test("static and portfolio route builders return canonical site urls", () => {
  const staticEntries = buildStaticRouteEntries(new Date("2026-03-20T00:00:00Z"));
  const portfolioEntries = buildPortfolioRouteEntries(new Date("2026-03-20T00:00:00Z"));

  assert.ok(staticEntries.some((entry) => entry.url === "https://stocksscreener.com/"));
  assert.ok(portfolioEntries.some((entry) => entry.url.includes("/portfolio/")));
});
