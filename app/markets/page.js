import Link from "next/link";

import { getMarketSections } from "@/lib/site-data";

export const metadata = {
  title: "Markets | Stocks Screener",
  description: "Track indexes, commodities, and sector rotation through market-focused screens on Stocks Screener.",
  alternates: {
    canonical: "/markets"
  }
};

export default function MarketsPage() {
  const marketSections = getMarketSections();

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Markets</p>
        <h1>Market screens for benchmarks, macro proxies, and sector rotation.</h1>
        <p className="hero-copy">
          Use these browse pages to move from market context into stock hubs and portfolio ideas, whether you are checking index leadership, commodity pressure, or sector breadth.
        </p>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {marketSections.map((section) => (
            <article className="feature-card" key={section.slug}>
              <h3>{section.title}</h3>
              <p>{section.summary}</p>
              <Link href={section.href}>Open {section.title}</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
