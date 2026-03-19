import Link from "next/link";
import { notFound } from "next/navigation";

import { buildChart } from "@/lib/chart";
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
      title: `${stock.ticker} Chart | Stocksscreener`,
      description: `${stock.name} (${stock.ticker}) price chart, 1-year range, and trend summary.`
    };
  } catch {
    return {
      title: "Chart Not Found | Stocksscreener"
    };
  }
}

export default async function StockChartPage({ params }) {
  const { ticker } = await params;

  let stock;

  try {
    stock = await getTickerPageData(ticker);
  } catch {
    notFound();
  }

  const chart = buildChart(stock.history.map((point) => ({
    date: point.date,
    value: point.close
  })));

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Stock Chart</p>
        <h1>
          {stock.ticker}
          <br />
          1Y Price Chart
        </h1>
        <p className="hero-copy">
          This chart route is the first stock subpage. It uses the same historical price source as the stock hub and portfolio backtester.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href={`/stocks/${stock.ticker}`}>
            Back to {stock.ticker} overview
          </Link>
          <Link className="ghost-button" href={`/tools/portfolio-backtester?h=${stock.ticker}:10&r=5y`}>
            Backtest {stock.ticker}
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
            <h3>1Y Change</h3>
            <p>
              {formatCurrency(stock.change)} ({formatPercent(stock.changePct)})
            </p>
          </article>
          <article className="feature-card">
            <h3>Range</h3>
            <p>{stock.startDate} to {stock.latestDate}</p>
          </article>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Price Chart</h2>
            <p>{stock.name} on {stock.exchange}. High and low are derived from the same 1-year price history used here.</p>
          </div>
        </div>
        <div className="chart-card stock-chart-card">
          <div className="chart-scale">
            <div className="chart-scale-values">
              <span>H: {formatCurrency(chart.max)}</span>
              <span>L: {formatCurrency(chart.min)}</span>
            </div>
          </div>
          <div className="chart-viewport">
            <svg viewBox="0 0 960 420" preserveAspectRatio="none" aria-label={`${stock.ticker} one year price chart`}>
              <defs>
                <linearGradient id="stock-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(184, 92, 56, 0.36)" />
                  <stop offset="100%" stopColor="rgba(184, 92, 56, 0.03)" />
                </linearGradient>
              </defs>
              <path className="chart-area" d={chart.areaPath} fill="url(#stock-chart-fill)" />
              <path className="chart-line" d={chart.linePath} />
            </svg>
          </div>
          <div className="chart-footer">
            <span>{stock.startDate}</span>
            <span>{stock.latestDate}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
