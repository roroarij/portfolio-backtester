import Link from "next/link";

const tools = [
  {
    title: "Portfolio Backtester",
    description: "Chart how a custom stock portfolio would have performed across historical periods.",
    href: "/tools/portfolio-backtester",
    status: "Live"
  },
  {
    title: "DCA Calculator",
    description: "Planned. Compare recurring purchases against lump-sum investing.",
    href: "/",
    status: "Planned"
  },
  {
    title: "Options Strategy Calculator",
    description: "Planned. Model payoff curves for calls, puts, spreads, and income structures.",
    href: "/",
    status: "Planned"
  },
  {
    title: "Position Size Calculator",
    description: "Planned. Calculate exposure and sizing from risk limits and stop distance.",
    href: "/",
    status: "Planned"
  }
];

export const metadata = {
  title: "Tools | Stocksscreener",
  description: "Finance tools for portfolio backtesting, DCA modeling, options strategy analysis, and position sizing."
};

export default function ToolsPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Tools</p>
        <h1>Build the utility layer first.</h1>
        <p className="hero-copy">
          These tools are the highest-intent entry points for the site. The portfolio backtester is live; the rest are the next planned surfaces.
        </p>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {tools.map((tool) => (
            <article className="feature-card" key={tool.title}>
              <div className="feature-card-meta">
                <span className="eyebrow">{tool.status}</span>
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <Link href={tool.href}>{tool.status === "Live" ? "Open tool" : "Back to roadmap"}</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
