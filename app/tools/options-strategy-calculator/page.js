import OptionsStrategyCalculator from "@/components/OptionsStrategyCalculator";

export const metadata = {
  title: "Options Strategy Calculator | Stocks Screener",
  description: "Model payoff curves and breakeven levels for common options strategies.",
  alternates: {
    canonical: "/tools/options-strategy-calculator"
  }
};

export default function OptionsStrategyCalculatorPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Tools</p>
        <h1>Options Strategy Calculator</h1>
        <p className="hero-copy">
          Map expiration payoff for core options structures, inspect breakeven and max risk, and compare structures before you place the trade.
        </p>
      </section>
      <OptionsStrategyCalculator />
    </main>
  );
}
