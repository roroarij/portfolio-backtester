import Link from "next/link";
import { notFound } from "next/navigation";

import { getTickerFundamentalsData } from "@/lib/stocks";

function formatCurrency(value) {
  if (!Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    notation: Math.abs(value) >= 1_000_000_000 ? "compact" : "standard"
  }).format(value);
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "Not available";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatRatio(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "Not available";
}

export async function generateMetadata({ params }) {
  const { ticker } = await params;

  try {
    const stock = await getTickerFundamentalsData(ticker);
    return {
      title: `${stock.ticker} Fundamentals | Stocksscreener`,
      description: `${stock.name} (${stock.ticker}) fundamentals including market cap, valuation ratios, margins, and business profile.`
    };
  } catch {
    return {
      title: "Fundamentals Not Found | Stocksscreener"
    };
  }
}

export default async function StockFundamentalsPage({ params }) {
  const { ticker } = await params;

  let stock;

  try {
    stock = await getTickerFundamentalsData(ticker);
  } catch {
    notFound();
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Fundamentals</p>
        <h1>
          {stock.ticker}
          <br />
          Fundamental Snapshot
        </h1>
        <p className="hero-copy">
          Valuation, margins, growth, and business profile for {stock.name}. This route is built from the same stock entity model as the overview and chart pages.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href={`/stocks/${stock.ticker}`}>
            Back to {stock.ticker} overview
          </Link>
          <Link className="ghost-button" href={`/stocks/${stock.ticker}/chart`}>
            View chart
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Market Cap</h3>
            <p>{formatCurrency(stock.marketCap)}</p>
          </article>
          <article className="feature-card">
            <h3>Current Price</h3>
            <p>{formatCurrency(stock.currentPrice)}</p>
          </article>
          <article className="feature-card">
            <h3>52W Range</h3>
            <p>{formatCurrency(stock.fiftyTwoWeekLow)} to {formatCurrency(stock.fiftyTwoWeekHigh)}</p>
          </article>
          <article className="feature-card">
            <h3>Trailing P/E</h3>
            <p>{formatRatio(stock.trailingPe)}</p>
          </article>
          <article className="feature-card">
            <h3>Forward P/E</h3>
            <p>{formatRatio(stock.forwardPe)}</p>
          </article>
          <article className="feature-card">
            <h3>Price / Book</h3>
            <p>{formatRatio(stock.priceToBook)}</p>
          </article>
          <article className="feature-card">
            <h3>Revenue</h3>
            <p>{formatCurrency(stock.totalRevenue)}</p>
          </article>
          <article className="feature-card">
            <h3>Revenue Growth</h3>
            <p>{formatPercent(stock.revenueGrowth)}</p>
          </article>
          <article className="feature-card">
            <h3>Dividend Yield</h3>
            <p>{formatPercent(stock.dividendYield)}</p>
          </article>
          <article className="feature-card">
            <h3>Profit Margin</h3>
            <p>{formatPercent(stock.profitMargins)}</p>
          </article>
          <article className="feature-card">
            <h3>Operating Margin</h3>
            <p>{formatPercent(stock.operatingMargins)}</p>
          </article>
          <article className="feature-card">
            <h3>Return on Equity</h3>
            <p>{formatPercent(stock.returnOnEquity)}</p>
          </article>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Company Profile</h2>
            <p>Entity-level context gives these pages more utility than a ticker quote alone and helps the stock section scale cleanly.</p>
          </div>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Sector</h3>
            <p>{stock.sector || "Not available"}</p>
          </article>
          <article className="feature-card">
            <h3>Industry</h3>
            <p>{stock.industry || "Not available"}</p>
          </article>
          <article className="feature-card">
            <h3>Analyst Target</h3>
            <p>{formatCurrency(stock.targetMeanPrice)}</p>
          </article>
          <article className="feature-card">
            <h3>Recommendation</h3>
            <p>{stock.recommendationKey || "Not available"}</p>
          </article>
          <article className="feature-card">
            <h3>Website</h3>
            <p>{stock.website || "Not available"}</p>
          </article>
          <article className="feature-card">
            <h3>Beta</h3>
            <p>{formatRatio(stock.beta)}</p>
          </article>
        </div>
        {stock.businessSummary ? (
          <article className="feature-card feature-card-wide">
            <h3>Business Summary</h3>
            <p>{stock.businessSummary}</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
