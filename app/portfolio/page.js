import Link from "next/link";

import { getFeaturedPortfolios } from "@/lib/site-data";

export const metadata = {
  title: "Portfolios | Stocks Screener",
  description: "Published portfolio pages and benchmark-aware comparison setups on Stocks Screener.",
  alternates: {
    canonical: "/portfolio"
  }
};

export default function PortfolioPage() {
  const portfolios = getFeaturedPortfolios();

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Portfolios</p>
        <h1>Published portfolio pages built for comparison, sharing, and research.</h1>
        <p className="hero-copy">
          These portfolios are canonical public pages with live historical statistics and direct links back into the interactive backtester for deeper edits.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/discover/portfolios">
            Browse portfolios
          </Link>
          <Link className="ghost-button" href="/tools/portfolio-backtester">
            Build your own
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {portfolios.map((item) => (
            <article className="feature-card" key={item.slug}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <Link href={`/portfolio/${item.slug}`}>Open {item.title}</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
