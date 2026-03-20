import Link from "next/link";
import { redirect } from "next/navigation";

import { getFeaturedPortfolios, getHomepageSymbolGroups, getMarketSections, getToolCatalog } from "@/lib/site-data";
import { loadQuoteBatch } from "@/lib/market";

export const metadata = {
  title: "Stocks Screener",
  description: "Portfolio backtesting, stock discovery, market tools, and shareable portfolio analysis.",
  alternates: {
    canonical: "/"
  }
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

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const featuredPortfolios = getFeaturedPortfolios();
  const toolCatalog = getToolCatalog();
  const marketSections = getMarketSections();
  const { indexes: indexSymbols, trendingStocks: trendingSymbols, commodities: commoditySymbols } = getHomepageSymbolGroups();
  const [indexes, trendingStocks, commodities] = await Promise.all([
    loadQuoteBatch(indexSymbols),
    loadQuoteBatch(trendingSymbols),
    loadQuoteBatch(commoditySymbols)
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
        <h1>Research stocks, test allocations, and use finance tools from one screen.</h1>
        <p className="hero-copy">
          Move from ticker-level chart and fundamentals work into portfolio backtests, position sizing, dollar-cost-averaging analysis, and options payoff planning without leaving the platform.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/tools/portfolio-backtester">
            Open Portfolio Backtester
          </Link>
          <Link className="ghost-button" href="/discover/stocks">
            Explore Stocks
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Major Indexes</h2>
            <p>Benchmark context for comparing single names, baskets, and market regimes.</p>
          </div>
          <Link href="/markets/indexes">View all indexes</Link>
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
            <p>Direct entry into chart, technical analysis, fundamentals, leadership, and news views.</p>
          </div>
          <Link href="/discover/stocks">Browse stock pages</Link>
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
            <p>Macro-linked ETFs for inflation, energy, and precious-metals context.</p>
          </div>
          <Link href="/markets/commodities">View commodity screens</Link>
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
            <p>Published comparison setups built from the same historical data engine as the live backtester.</p>
          </div>
          <Link href="/discover/portfolios">See all portfolios</Link>
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
            <h2>Tools</h2>
            <p>Utility pages for portfolio planning, risk management, and options payoff work.</p>
          </div>
          <Link href="/tools">Open all tools</Link>
        </div>
        <div className="feature-grid">
          {toolCatalog.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href}>Open tool</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Markets</h2>
            <p>Browse benchmarks, commodities, and sector rotation screens from dedicated market pages.</p>
          </div>
          <Link href="/markets">Browse markets</Link>
        </div>
        <div className="feature-grid">
          {marketSections.map((item) => (
            <article className="feature-card" key={item.slug}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href}>Open {item.title}</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
