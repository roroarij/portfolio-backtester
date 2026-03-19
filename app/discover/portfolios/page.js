import Link from "next/link";

const discoverPortfolios = [
  {
    slug: "magnificent-7-equal-weight",
    title: "Magnificent 7 Equal Weight",
    summary: "A concentrated mega-cap tech basket designed for high-intent portfolio comparison traffic.",
    href: "/tools/portfolio-backtester?h=AAPL:10,MSFT:10,NVDA:10,AMZN:10,META:10,GOOGL:10,TSLA:10&r=5y"
  },
  {
    slug: "aapl-vs-spy",
    title: "AAPL vs SPY",
    summary: "A benchmark-style comparison that should later become a real published portfolio entity.",
    href: "/tools/portfolio-backtester?h=AAPL:10,SPY:10&r=5y"
  },
  {
    slug: "semiconductor-basket",
    title: "Semiconductor Basket",
    summary: "A chip-focused template that bridges ticker traffic, portfolio comparison, and discovery surfaces.",
    href: "/tools/portfolio-backtester?h=NVDA:10,AMD:10,AVGO:10,TSM:10&r=5y"
  }
];

export const metadata = {
  title: "Discover Portfolios | Stocksscreener",
  description: "Browse featured and discoverable portfolio setups on Stocksscreener."
};

export default function DiscoverPortfoliosPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Discover</p>
        <h1>Featured portfolio setups worth browsing and sharing.</h1>
        <p className="hero-copy">
          This is the first discovery surface. Today it links into the live backtester. Next it should upgrade into real published portfolio pages under <code>/portfolio/[slug]</code>.
        </p>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {discoverPortfolios.map((item) => (
            <article className="feature-card" key={item.slug}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <Link href={item.href}>Open portfolio template</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
