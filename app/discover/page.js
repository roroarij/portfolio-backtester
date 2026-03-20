import Link from "next/link";

export const metadata = {
  title: "Discover | Stocks Screener",
  description: "Browse featured portfolios, stock ideas, and future discovery surfaces on Stocks Screener.",
  alternates: {
    canonical: "/discover"
  }
};

export default function DiscoverPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Discover</p>
        <h1>Discovery pages should connect tools, stocks, and portfolios.</h1>
        <p className="hero-copy">
          The first discovery surface is portfolios. Stock discovery, trending screens, and market-based browse pages come next.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/discover/portfolios">
            Discover portfolios
          </Link>
          <Link className="ghost-button" href="/markets">
            View market sections
          </Link>
        </div>
      </section>
    </main>
  );
}
