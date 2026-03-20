const featuredPortfolios = [
  {
    slug: "magnificent-7-equal-weight",
    title: "Magnificent 7 Equal Weight",
    description: "A concentrated mega-cap tech basket designed for high-intent portfolio comparison traffic.",
    summary:
      "An equal-weight template across the Magnificent 7. Useful for comparing concentrated mega-cap growth exposure across long lookback windows.",
    holdings: [
      { symbol: "AAPL", quantity: 10 },
      { symbol: "MSFT", quantity: 10 },
      { symbol: "NVDA", quantity: 10 },
      { symbol: "AMZN", quantity: 10 },
      { symbol: "META", quantity: 10 },
      { symbol: "GOOGL", quantity: 10 },
      { symbol: "TSLA", quantity: 10 }
    ],
    range: "5y",
    tags: ["mega-cap", "tech", "equal-weight"]
  },
  {
    slug: "aapl-vs-spy",
    title: "AAPL vs SPY",
    description: "A benchmark-style comparison between Apple and the S&P 500 ETF proxy.",
    summary:
      "A simple benchmark-aware setup that compares single-stock exposure in Apple against a market ETF baseline over the same period.",
    holdings: [
      { symbol: "AAPL", quantity: 10 },
      { symbol: "SPY", quantity: 10 }
    ],
    range: "5y",
    tags: ["benchmark", "comparison", "apple"]
  },
  {
    slug: "semiconductor-basket",
    title: "Semiconductor Basket",
    description: "A chip-focused template linking ticker research, portfolio comparison, and discovery surfaces.",
    summary:
      "A semiconductor-heavy comparison basket built around large-cap chipmakers and foundry exposure.",
    holdings: [
      { symbol: "NVDA", quantity: 10 },
      { symbol: "AMD", quantity: 10 },
      { symbol: "AVGO", quantity: 10 },
      { symbol: "TSM", quantity: 10 }
    ],
    range: "5y",
    tags: ["semiconductors", "ai", "chips"]
  }
];

const homepageSymbolGroups = {
  indexes: ["SPY", "QQQ", "DIA", "IWM"],
  trendingStocks: ["AAPL", "NVDA", "MSFT", "TSLA"],
  commodities: ["GLD", "SLV", "USO", "UNG"]
};

const supplementalStockTickers = ["AMD", "AMZN", "AVGO", "BABA", "BULL", "CRSP", "GOOGL", "META", "TSM"];

export const stockHubViews = ["chart", "technical-analysis", "fundamentals", "leadership", "news"];

export function getFeaturedPortfolios() {
  return featuredPortfolios.map((portfolio) => ({
    ...portfolio,
    toolHref: buildPortfolioToolHref(portfolio)
  }));
}

export function getHomepageSymbolGroups() {
  return {
    indexes: [...homepageSymbolGroups.indexes],
    trendingStocks: [...homepageSymbolGroups.trendingStocks],
    commodities: [...homepageSymbolGroups.commodities]
  };
}

export function getFeaturedStockTickers() {
  const homepageTickers = Object.values(homepageSymbolGroups).flat();
  const portfolioTickers = featuredPortfolios.flatMap((portfolio) => portfolio.holdings.map((holding) => holding.symbol));
  return [...new Set([...homepageTickers, ...portfolioTickers, ...supplementalStockTickers])].sort();
}

export function getFeaturedPortfolioBySlug(slug) {
  const portfolio = featuredPortfolios.find((entry) => entry.slug === slug);
  return portfolio
    ? {
        ...portfolio,
        toolHref: buildPortfolioToolHref(portfolio)
      }
    : null;
}

export function buildPortfolioToolHref(portfolio) {
  const params = new URLSearchParams();
  params.set(
    "h",
    portfolio.holdings.map((holding) => `${holding.symbol}:${holding.quantity}`).join(",")
  );
  params.set("r", portfolio.range);
  return `/tools/portfolio-backtester?${params.toString()}`;
}
