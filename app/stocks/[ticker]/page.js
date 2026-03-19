import Link from "next/link";
import { notFound } from "next/navigation";

import { getTickerPageData } from "@/lib/stocks";

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

export async function generateMetadata({ params }) {
  const { ticker } = await params;

  try {
    const stock = await getTickerPageData(ticker);

    return {
      title: `${stock.ticker} Stock Overview | Stocksscreener`,
      description: `${stock.name} (${stock.ticker}) price summary, recent range, and direct links into tools and portfolio discovery.`
    };
  } catch {
    return {
      title: "Stock Not Found | Stocksscreener"
    };
  }
}

export default async function StockTickerPage({ params }) {
  const { ticker } = await params;

  let stock;

  try {
    stock = await getTickerPageData(ticker);
  } catch {
    notFound();
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Stock Hub</p>
        <h1>
          {stock.ticker}
          <br />
          {stock.name}
        </h1>
        <p className="hero-copy">
          This stock hub is backed by the same Yahoo Finance source used for the backtesting tool and now links directly into chart and fundamentals views.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href={`/tools/portfolio-backtester?h=${stock.ticker}:10&r=5y`}>
            Backtest {stock.ticker}
          </Link>
          <Link className="ghost-button" href={`/stocks/${stock.ticker}/chart`}>
            View chart
          </Link>
          <Link className="ghost-button" href={`/stocks/${stock.ticker}/fundamentals`}>
            View fundamentals
          </Link>
          <Link className="ghost-button" href="/discover">
            Back to discover
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Latest Close</h3>
            <p>{formatCurrency(stock.latestClose)}</p>
          </article>
          <article className="feature-card">
            <h3>{stock.range} Change</h3>
            <p>
              {formatCurrency(stock.change)} ({formatPercent(stock.changePct)})
            </p>
          </article>
          <article className="feature-card">
            <h3>Exchange</h3>
            <p>{stock.exchange}</p>
          </article>
          <article className="feature-card">
            <h3>{stock.range} High</h3>
            <p>{formatCurrency(stock.high)}</p>
          </article>
          <article className="feature-card">
            <h3>{stock.range} Low</h3>
            <p>{formatCurrency(stock.low)}</p>
          </article>
          <article className="feature-card">
            <h3>Data Source</h3>
            <p>Yahoo Finance chart and search endpoints, shared with the backtester.</p>
          </article>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Stock Routes</h2>
            <p>The stock section now has live overview, chart, and fundamentals routes. Additional sections can follow the same entity model.</p>
          </div>
        </div>
        <div className="feature-grid">
          {["chart", "technical-analysis", "fundamentals", "options", "price-targets", "filings", "insider-trades", "news"].map((section) => (
            <article className="feature-card" key={section}>
              <h3>{section}</h3>
              <p>
                {section === "chart"
                  ? "Live price-history route for this ticker."
                  : section === "fundamentals"
                    ? "Live fundamentals route for valuation, growth, and company profile."
                    : `Reserved route under /stocks/${stock.ticker}/${section}.`}
              </p>
              {section === "chart" ? <Link href={`/stocks/${stock.ticker}/chart`}>Open chart route</Link> : null}
              {section === "fundamentals" ? <Link href={`/stocks/${stock.ticker}/fundamentals`}>Open fundamentals route</Link> : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
