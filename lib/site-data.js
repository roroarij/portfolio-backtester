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

const marketSectionCatalog = [
  {
    slug: "indexes",
    title: "Indexes",
    description: "Track the broad-market benchmarks most traders and allocators use for context.",
    summary: "Broad-market ETFs for benchmark comparisons, relative strength checks, and macro framing.",
    symbols: ["SPY", "QQQ", "DIA", "IWM", "VTI", "VOO"]
  },
  {
    slug: "commodities",
    title: "Commodities",
    description: "Watch liquid commodity proxies that shape inflation, macro, and risk-on/risk-off narratives.",
    summary: "Commodity-linked ETFs and products that help connect macro regime shifts to portfolio construction.",
    symbols: ["GLD", "SLV", "USO", "UNG", "DBA", "CPER"]
  },
  {
    slug: "sectors",
    title: "Sectors",
    description: "Scan the major sector ETFs to see where leadership and weakness are rotating.",
    summary: "Sector rotation shortcuts built around the primary S&P sector ETF lineup.",
    symbols: ["XLK", "XLF", "XLV", "XLE", "XLI", "XLY", "XLP", "XLU", "XLB", "XLRE", "XLC"]
  }
];

const toolCatalog = [
  {
    slug: "portfolio-backtester",
    title: "Portfolio Backtester",
    description: "Chart how a custom basket of holdings would have performed over time.",
    summary: "Shareable multi-holding backtests with range controls, interactive chart scrubbing, and direct comparison workflow.",
    href: "/tools/portfolio-backtester"
  },
  {
    slug: "dca-calculator",
    title: "DCA Calculator",
    description: "Compare recurring contributions against a lump-sum alternative over the same horizon.",
    summary: "Model contribution cadence, growth assumptions, and total capital invested to compare average-costing with immediate deployment.",
    href: "/tools/dca-calculator"
  },
  {
    slug: "options-strategy-calculator",
    title: "Options Strategy Calculator",
    description: "Visualize payoff profiles for core options strategies before expiration.",
    summary: "Explore long calls, long puts, covered calls, bull call spreads, and protective puts with max gain/loss and breakeven output.",
    href: "/tools/options-strategy-calculator"
  },
  {
    slug: "position-size-calculator",
    title: "Position Size Calculator",
    description: "Turn risk limits and stop distance into practical share size and capital usage.",
    summary: "Risk-based sizing for swing trades and portfolio entries with account size, stop distance, and percentage risk controls.",
    href: "/tools/position-size-calculator"
  }
];

const supplementalStockTickers = ["AMD", "AMZN", "AVGO", "BABA", "BULL", "CRSP", "GOOGL", "META", "TSM"];

export const stockHubViews = ["chart", "technical-analysis", "fundamentals", "leadership", "news"];

export const canonicalStaticRoutes = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/discover", changeFrequency: "daily", priority: 0.8 },
  { path: "/discover/portfolios", changeFrequency: "daily", priority: 0.8 },
  { path: "/discover/stocks", changeFrequency: "daily", priority: 0.8 },
  { path: "/markets", changeFrequency: "daily", priority: 0.8 },
  { path: "/markets/indexes", changeFrequency: "daily", priority: 0.7 },
  { path: "/markets/commodities", changeFrequency: "daily", priority: 0.7 },
  { path: "/markets/sectors", changeFrequency: "daily", priority: 0.7 },
  { path: "/portfolio", changeFrequency: "weekly", priority: 0.8 },
  { path: "/tools", changeFrequency: "weekly", priority: 0.8 },
  { path: "/tools/portfolio-backtester", changeFrequency: "daily", priority: 0.9 },
  { path: "/tools/dca-calculator", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tools/options-strategy-calculator", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tools/position-size-calculator", changeFrequency: "weekly", priority: 0.7 }
];

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
  const marketTickers = marketSectionCatalog.flatMap((section) => section.symbols);
  return [...new Set([...homepageTickers, ...portfolioTickers, ...marketTickers, ...supplementalStockTickers])].sort();
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

export function getToolCatalog() {
  return toolCatalog.map((tool) => ({ ...tool }));
}

export function getToolBySlug(slug) {
  const tool = toolCatalog.find((entry) => entry.slug === slug);
  return tool ? { ...tool } : null;
}

export function getMarketSections() {
  return marketSectionCatalog.map((section) => ({
    ...section,
    href: `/markets/${section.slug}`
  }));
}

export function getMarketSectionBySlug(slug) {
  const section = marketSectionCatalog.find((entry) => entry.slug === slug);
  return section
    ? {
        ...section,
        href: `/markets/${section.slug}`
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
