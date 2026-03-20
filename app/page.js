import Link from "next/link";
import { redirect } from "next/navigation";

import { getFeaturedPortfolios, getHomepageSymbolGroups } from "@/lib/site-data";
import { getTickerPageData } from "@/lib/stocks";

const coreTools = [
  {
    title: "Portfolio Backtester",
    description: "Chart how a custom mix of holdings would have performed over time.",
    href: "/tools/portfolio-backtester"
  },
  {
    title: "DCA Calculator",
    description: "Compare recurring purchases against lump-sum investing.",
    href: "/tools"
  },
  {
    title: "Options Strategy Calculator",
    description: "Model payoff curves and compare common options structures.",
    href: "/tools"
  }
];

const marketCards = [
  {
    title: "Indexes",
    description: "Track broad market benchmarks and route users into benchmark-aware comparisons.",
    href: "/markets"
  },
  {
    title: "Commodities",
    description: "Create a browse surface for gold, oil, and macro-linked portfolio contexts.",
    href: "/markets"
  },
  {
    title: "Stocks",
    description: "Build ticker hubs that connect entity traffic to tools and saved portfolios.",
    href: "/discover"
  }
];

export const metadata = {
  title: "Stocks Screener",
  description: "Portfolio backtesting, stock discovery, market tools, and shareable portfolio analysis."
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function formatPercent(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

async function loadQuotes(symbols) {
  const results = await Promise.allSettled(symbols.map((symbol) => getTickerPageData(symbol)));

  return results
    .map((result, index) => (result.status === "fulfilled" ? result.value : null))
    .filter(Boolean);
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const featuredPortfolios = getFeaturedPortfolios();
  const { indexes: indexSymbols, trendingStocks: trendingSymbols, commodities: commoditySymbols } = getHomepageSymbolGroups();
  const [indexes, trendingStocks, commodities] = await Promise.all([
    loadQuotes(indexSymbols),
    loadQuotes(trendingSymbols),
    loadQuotes(commoditySymbols)
  ]);

  if (params?.h) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => query.append(key, entry));
        return;
      }

      if (typeof value === "string") {
        query.set(key, value);
      }
    });

    redirect(`/tools/portfolio-backtester?${query.toString()}`);
  }

  return (
    <main className="app-shell">
      <section className="hero hero-home">
        <p className="eyebrow">Stocks Screener</p>
        <h1>Backtest portfolios, screen markets, and research stocks from one hub.</h1>
        <p className="hero-copy">
          Use the backtester for shareable portfolio analysis, browse discoverable setups, and move into ticker-level chart, fundamentals, and news views from the same platform.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/tools/portfolio-backtester">
            Open Portfolio Backtester
          </Link>
          <Link className="ghost-button" href="/discover/portfolios">
            Browse Discover Portfolios
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Major Indexes</h2>
            <p>Quick benchmark context before moving into single-stock or portfolio analysis.</p>
          </div>
        </div>
        <div className="market-strip">
          {indexes.map((quote) => (
            <Link className="quote-card" href={`/stocks/${quote.ticker}`} key={quote.ticker}>
              <h3>{quote.ticker}</h3>
              <p className="quote-price">{formatCurrency(quote.latestClose)}</p>
              <p>{formatPercent(quote.changePct)} over {quote.range}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Trending Stocks</h2>
            <p>Fast entry points into the stock hub, interactive chart tab, and fundamentals tab.</p>
          </div>
        </div>
        <div className="market-strip">
          {trendingStocks.map((quote) => (
            <Link className="quote-card" href={`/stocks/${quote.ticker}`} key={quote.ticker}>
              <h3>{quote.ticker}</h3>
              <p className="quote-price">{formatCurrency(quote.latestClose)}</p>
              <p>{quote.name}</p>
              <p>{formatPercent(quote.changePct)} over {quote.range}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Commodity Proxies</h2>
            <p>Macro-linked ETFs that help connect commodity context to portfolio construction and comparison.</p>
          </div>
        </div>
        <div className="market-strip">
          {commodities.map((quote) => (
            <Link className="quote-card" href={`/stocks/${quote.ticker}`} key={quote.ticker}>
              <h3>{quote.ticker}</h3>
              <p className="quote-price">{formatCurrency(quote.latestClose)}</p>
              <p>{formatPercent(quote.changePct)} over {quote.range}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Featured Portfolios</h2>
            <p>These are the first discoverable portfolio templates and published portfolio entities under `/portfolio/[slug]`.</p>
          </div>
        </div>
        <div className="feature-grid">
          {featuredPortfolios.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={`/portfolio/${item.slug}`}>Open portfolio</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Core Tools</h2>
            <p>Tool-intent routes should live under `/tools` while saved and published portfolio entities live under `/portfolio`.</p>
          </div>
        </div>
        <div className="feature-grid">
          {coreTools.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href}>View tool</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Markets and Discovery</h2>
            <p>The next route pillars are discovery and stock hubs, not dozens of thin pages launched all at once.</p>
          </div>
        </div>
        <div className="feature-grid">
          {marketCards.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href}>Open section</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
