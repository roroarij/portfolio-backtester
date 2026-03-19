import Link from "next/link";
import { redirect } from "next/navigation";

import { getFeaturedPortfolios } from "@/lib/site-data";

const coreTools = [
  {
    title: "Portfolio Backtester",
    description: "Chart how a custom mix of holdings would have performed over time.",
    href: "/tools/portfolio-backtester"
  },
  {
    title: "DCA Calculator",
    description: "Planned next. Compare lump-sum and recurring investment outcomes.",
    href: "/tools"
  },
  {
    title: "Options Strategy Calculator",
    description: "Planned next. Model payoff curves and compare common options structures.",
    href: "/tools"
  }
];

const marketCards = [
  {
    title: "Indexes",
    description: "Track broad market benchmarks and route users into benchmark-aware comparisons.",
    href: "/markets"
  },
  {
    title: "Commodities",
    description: "Create a browse surface for gold, oil, and macro-linked portfolio contexts.",
    href: "/markets"
  },
  {
    title: "Stocks",
    description: "Build ticker hubs that connect entity traffic to tools and saved portfolios.",
    href: "/discover"
  }
];

export const metadata = {
  title: "Stocksscreener",
  description: "Portfolio backtesting, stock discovery, market tools, and shareable portfolio analysis."
};

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const featuredPortfolios = getFeaturedPortfolios();

  if (params?.h) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => query.append(key, entry));
        return;
      }

      if (typeof value === "string") {
        query.set(key, value);
      }
    });

    redirect(`/tools/portfolio-backtester?${query.toString()}`);
  }

  return (
    <main className="app-shell">
      <section className="hero hero-home">
        <p className="eyebrow">Finance Utility Platform</p>
        <h1>Backtest portfolios, discover setups, and expand into market tools.</h1>
        <p className="hero-copy">
          Stocksscreener is evolving from a single backtester into a broader finance app for portfolio discovery, ticker research, and high-intent tools.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/tools/portfolio-backtester">
            Open Portfolio Backtester
          </Link>
          <Link className="ghost-button" href="/discover/portfolios">
            Browse Discover Portfolios
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Featured Portfolios</h2>
            <p>These are the first discoverable portfolio templates. Later these will become real saved portfolio entities under `/portfolio/[slug]`.</p>
          </div>
        </div>
        <div className="feature-grid">
          {featuredPortfolios.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={`/portfolio/${item.slug}`}>Open portfolio</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Core Tools</h2>
            <p>Tool-intent routes should live under `/tools` while saved and published portfolio entities live under `/portfolio`.</p>
          </div>
        </div>
        <div className="feature-grid">
          {coreTools.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href}>View tool</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Markets and Discovery</h2>
            <p>The next route pillars are discovery and stock hubs, not dozens of thin pages launched all at once.</p>
          </div>
        </div>
        <div className="feature-grid">
          {marketCards.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href}>Open section</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
