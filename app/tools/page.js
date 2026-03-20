import Link from "next/link";

import { getToolCatalog } from "@/lib/site-data";

export const metadata = {
  title: "Tools | Stocks Screener",
  description: "Finance tools for portfolio backtesting, DCA modeling, options strategy analysis, and position sizing.",
  alternates: {
    canonical: "/tools"
  }
};

export default function ToolsPage() {
  const tools = getToolCatalog();

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Tools</p>
        <h1>Financial calculators and backtesting tools for portfolio decisions.</h1>
        <p className="hero-copy">
          Start with the portfolio backtester, compare recurring contributions against lump-sum deployment, size positions from defined risk, and map options payoff before expiration.
        </p>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          {tools.map((tool) => (
            <article className="feature-card" key={tool.slug}>
              <h3>{tool.title}</h3>
              <p>{tool.summary}</p>
              <Link href={tool.href}>Open {tool.title}</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
