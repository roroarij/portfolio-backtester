import PositionSizeCalculator from "@/components/PositionSizeCalculator";

export const metadata = {
  title: "Position Size Calculator | Stocks Screener",
  description: "Calculate position size from account value, risk percentage, entry price, and stop loss.",
  alternates: {
    canonical: "/tools/position-size-calculator"
  }
};

export default function PositionSizeCalculatorPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Tools</p>
        <h1>Position Size Calculator</h1>
        <p className="hero-copy">
          Translate account risk into a concrete share count, stop distance, and position value so each entry fits the same discipline.
        </p>
      </section>
      <PositionSizeCalculator />
    </main>
  );
}
