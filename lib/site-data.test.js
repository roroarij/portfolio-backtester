import test from "node:test";
import assert from "node:assert/strict";

import { buildPortfolioToolHref, getFeaturedPortfolioBySlug, getFeaturedPortfolios } from "./site-data.js";

test("featured portfolios expose stable slugs and tool hrefs", () => {
  const portfolios = getFeaturedPortfolios();

  assert.ok(portfolios.length >= 3);
  assert.equal(portfolios[0].slug, "magnificent-7-equal-weight");
  assert.match(portfolios[0].toolHref, /^\/tools\/portfolio-backtester\?/);
});

test("getFeaturedPortfolioBySlug returns null for unknown slugs", () => {
  assert.equal(getFeaturedPortfolioBySlug("does-not-exist"), null);
});

test("buildPortfolioToolHref serializes holdings and range", () => {
  const href = buildPortfolioToolHref({
    holdings: [
      { symbol: "AAPL", quantity: 10 },
      { symbol: "SPY", quantity: 5 }
    ],
    range: "5y"
  });

  assert.equal(href, "/tools/portfolio-backtester?h=AAPL%3A10%2CSPY%3A5&r=5y");
});
