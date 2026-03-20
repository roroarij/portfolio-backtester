import Link from "next/link";

export const metadata = {
  title: "Discover | Stocks Screener",
  description: "Browse featured portfolios, stock pages, and market entry points on Stocks Screener.",
  alternates: {
    canonical: "/discover"
  }
};

const discoveryCards = [
  {
    title: "Discover Portfolios",
    description: "Published portfolio pages with live backtest statistics and links into the interactive tool.",
    href: "/discover/portfolios"
  },
  {
    title: "Discover Stocks",
    description: "Featured ticker pages covering chart, technical analysis, fundamentals, leadership, and news.",
    href: "/discover/stocks"
  },
  {
    title: "Market Screens",
    description: "Browse indexes, commodities, and sectors before drilling into specific names.",
    href: "/markets"
  }
];

export default function DiscoverPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Discover</p>
        <h1>Browse portfolios, stocks, and market screens worth exploring next.</h1>
        <p className="hero-copy">
          Discovery pages are the bridge between high-intent tools and research surfaces. Start with published portfolios, featured stock pages, or market sections and move into deeper analysis from there.
        </p>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {discoveryCards.map((item) => (
            <article className="feature-card" key={item.title}>
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
