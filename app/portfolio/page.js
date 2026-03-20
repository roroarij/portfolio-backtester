import Link from "next/link";

const portfolioStates = [
  {
    title: "Featured Portfolios",
    description: "Editorial or system-published portfolio pages that deserve canonical indexing and internal links."
  },
  {
    title: "Unlisted Share URLs",
    description: "Generated backtest links that remain shareable, but should not automatically become crawlable public pages."
  },
  {
    title: "Published Portfolio Entities",
    description: "Portfolio records with title, slug, tags, summary, and derived stats."
  }
];

export const metadata = {
  title: "Portfolios | Stocks Screener",
  description: "Portfolio pages, saved backtests, and published comparison setups on Stocks Screener.",
  alternates: {
    canonical: "/portfolio"
  }
};

export default function PortfolioPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Portfolios</p>
        <h1>Portfolio routes should represent real entities, not only tool state.</h1>
        <p className="hero-copy">
          The tool now lives under <code>/tools/portfolio-backtester</code>. This section is for discoverable and published portfolio entities that can stand on their own.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/discover/portfolios">
            Browse discoverable portfolios
          </Link>
          <Link className="ghost-button" href="/tools/portfolio-backtester">
            Open the tool
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {portfolioStates.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
