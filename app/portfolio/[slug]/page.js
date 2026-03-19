import Link from "next/link";
import { notFound } from "next/navigation";

import { getFeaturedPortfolioBySlug, getFeaturedPortfolios } from "@/lib/site-data";

export function generateStaticParams() {
  return getFeaturedPortfolios().map((portfolio) => ({
    slug: portfolio.slug
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const portfolio = getFeaturedPortfolioBySlug(slug);

  if (!portfolio) {
    return {
      title: "Portfolio Not Found | Stocksscreener"
    };
  }

  return {
    title: `${portfolio.title} | Stocksscreener`,
    description: portfolio.description
  };
}

export default async function PortfolioSlugPage({ params }) {
  const { slug } = await params;
  const portfolio = getFeaturedPortfolioBySlug(slug);

  if (!portfolio) {
    notFound();
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Published Portfolio</p>
        <h1>{portfolio.title}</h1>
        <p className="hero-copy">{portfolio.summary}</p>
        <div className="hero-actions">
          <Link className="primary-button" href={portfolio.toolHref}>
            Open in backtester
          </Link>
          <Link className="ghost-button" href="/discover/portfolios">
            Back to discover
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Holdings</h2>
            <p>This is the first canonical portfolio-entity route. The next step is to attach saved stats and editorial summaries to these pages.</p>
          </div>
        </div>
        <div className="feature-grid">
          {portfolio.holdings.map((holding) => (
            <article className="feature-card" key={holding.symbol}>
              <h3>{holding.symbol}</h3>
              <p>{holding.quantity} shares in the default template configuration.</p>
              <Link href={`/stocks/${holding.symbol}`}>View stock page</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Portfolio Metadata</h2>
            <p>These fields should later be stored per published portfolio so discovery pages can sort and filter them cleanly.</p>
          </div>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Default Range</h3>
            <p>{portfolio.range}</p>
          </article>
          <article className="feature-card">
            <h3>Tags</h3>
            <p>{portfolio.tags.join(", ")}</p>
          </article>
          <article className="feature-card">
            <h3>Route Type</h3>
            <p>Published portfolio entity under <code>/portfolio/[slug]</code>.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
