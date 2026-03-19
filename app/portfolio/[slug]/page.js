import Link from "next/link";
import { notFound } from "next/navigation";

import { buildPortfolioHistory } from "@/lib/portfolio";
import { getFeaturedPortfolioBySlug, getFeaturedPortfolios } from "@/lib/site-data";

export const revalidate = 3600;

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
      title: "Portfolio Not Found | Stocks Screener"
    };
  }

  return {
    title: `${portfolio.title} | Stocks Screener`,
    description: portfolio.description
  };
}

export default async function PortfolioSlugPage({ params }) {
  const { slug } = await params;
  const portfolio = getFeaturedPortfolioBySlug(slug);

  if (!portfolio) {
    notFound();
  }

  let history;

  try {
    history = await buildPortfolioHistory(portfolio.holdings, portfolio.range);
  } catch {
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
            <h2>Performance Snapshot</h2>
            <p>This portfolio page now computes live stats from the same historical data engine used by the tool route.</p>
          </div>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Start Value</h3>
            <p>{formatCurrency(history.summary.startValue)}</p>
          </article>
          <article className="feature-card">
            <h3>End Value</h3>
            <p>{formatCurrency(history.summary.endValue)}</p>
          </article>
          <article className="feature-card">
            <h3>Total Change</h3>
            <p>
              {formatCurrency(history.summary.change)} ({formatPercent(history.summary.changePct)})
            </p>
          </article>
          <article className="feature-card">
            <h3>Date Range</h3>
            <p>
              {history.startDate} to {history.endDate}
            </p>
          </article>
          <article className="feature-card">
            <h3>Lookback</h3>
            <p>{history.range}</p>
          </article>
          <article className="feature-card">
            <h3>Data Source</h3>
            <p>Yahoo Finance historical chart data, shared with the backtester and stock routes.</p>
          </article>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="section-header">
          <div>
            <h2>Holdings</h2>
            <p>This is now a live portfolio entity page with computed stats, while still linking back into the interactive tool.</p>
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
            <p>{history.range}</p>
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
