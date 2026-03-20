import Link from "next/link";

import { loadStockBatch } from "@/lib/market";
import { getFeaturedStockTickers } from "@/lib/site-data";

export const metadata = {
  title: "Discover Stocks | Stocks Screener",
  description: "Browse featured stock pages with chart, fundamentals, leadership, technical analysis, and news.",
  alternates: {
    canonical: "/discover/stocks"
  }
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

export default async function DiscoverStocksPage() {
  const symbols = getFeaturedStockTickers().slice(0, 24);
  const stocks = await loadStockBatch(symbols);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Discover</p>
        <h1>Featured stock pages across large caps, growth names, ETFs, and thematic tickers.</h1>
        <p className="hero-copy">
          Each stock page links chart, technical analysis, fundamentals, leadership, and news into one route family so you can move from screening to deeper research quickly.
        </p>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {stocks.map((stock) => (
            <article className="feature-card" key={stock.ticker}>
              <h3>{stock.ticker}</h3>
              <p>{stock.name}</p>
              <p>{stock.sector || stock.exchange || "Market data available"}</p>
              <p>{formatCurrency(stock.latestClose)}</p>
              <Link href={`/stocks/${stock.ticker}`}>Open {stock.ticker}</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
