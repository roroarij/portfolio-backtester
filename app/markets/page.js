import Link from "next/link";

const marketSections = [
  "Indexes",
  "Commodities",
  "Sectors",
  "Earnings Calendar"
];

export const metadata = {
  title: "Markets | Stocks Screener",
  description: "Market-level browse surfaces for indexes, commodities, sectors, and future calendar tools.",
  alternates: {
    canonical: "/markets"
  }
};

export default function MarketsPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Markets</p>
        <h1>Market pages are the browse layer, not the core tool layer.</h1>
        <p className="hero-copy">
          Use this section for indexes, commodities, sectors, and later event surfaces like earnings calendars. These pages should feed users into stock and portfolio routes.
        </p>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {marketSections.map((section) => (
            <article className="feature-card" key={section}>
              <h3>{section}</h3>
              <p>A market browse surface to connect macro context to stock and portfolio routes.</p>
              <Link href="/">Back to home</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
