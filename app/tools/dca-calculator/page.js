import DcaCalculator from "@/components/DcaCalculator";

export const metadata = {
  title: "DCA Calculator | Stocks Screener",
  description: "Compare dollar-cost averaging against a lump-sum investment over the same horizon.",
  alternates: {
    canonical: "/tools/dca-calculator"
  }
};

export default function DcaCalculatorPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Tools</p>
        <h1>DCA Calculator</h1>
        <p className="hero-copy">
          Compare a recurring-investment plan against deploying the same total capital up front, using the horizon and growth assumptions you want to test.
        </p>
      </section>
      <DcaCalculator />
    </main>
  );
}
