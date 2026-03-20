import Link from "next/link";

import { getFeaturedPortfolios } from "@/lib/site-data";

export const metadata = {
  title: "Discover Portfolios | Stocks Screener",
  description: "Browse featured and discoverable portfolio setups on Stocks Screener.",
  alternates: {
    canonical: "/discover/portfolios"
  }
};

export default function DiscoverPortfoliosPage() {
  const discoverPortfolios = getFeaturedPortfolios();

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Discover</p>
        <h1>Featured portfolio setups worth browsing and sharing.</h1>
        <p className="hero-copy">
          Each featured portfolio has a dedicated public page with live performance statistics and a direct link into the backtester when you want to change weights or holdings.
        </p>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {discoverPortfolios.map((item) => (
            <article className="feature-card" key={item.slug}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <Link href={`/portfolio/${item.slug}`}>Open portfolio</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
