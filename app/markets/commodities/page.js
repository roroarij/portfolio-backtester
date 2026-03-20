import Link from "next/link";

import { loadQuoteBatch } from "@/lib/market";
import { getMarketSectionBySlug } from "@/lib/site-data";

export const metadata = {
  title: "Commodities | Stocks Screener",
  description: "Track commodity-linked ETFs and macro proxies on Stocks Screener.",
  alternates: {
    canonical: "/markets/commodities"
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

export default async function CommoditiesPage() {
  const section = getMarketSectionBySlug("commodities");
  const quotes = await loadQuoteBatch(section.symbols);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Markets</p>
        <h1>{section.title}</h1>
        <p className="hero-copy">{section.description}</p>
      </section>
      <section className="panel feature-grid-panel">
        <div className="market-strip market-grid">
          {quotes.map((quote) => (
            <Link className="quote-card" href={`/stocks/${quote.ticker}`} key={quote.ticker}>
              <h3>{quote.ticker}</h3>
              <p className="quote-price">{formatCurrency(quote.latestClose)}</p>
              <p>{quote.name}</p>
              <p>{formatPercent(quote.changePct)} over {quote.range}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
