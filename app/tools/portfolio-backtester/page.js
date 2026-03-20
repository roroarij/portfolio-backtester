import BacktesterApp from "@/components/BacktesterApp";

export const metadata = {
  title: "Portfolio Backtester | Stocks Screener",
  description: "Backtest a custom portfolio of stocks by ticker and share count, then compare historical value over time.",
  alternates: {
    canonical: "/tools/portfolio-backtester"
  }
};

export default function PortfolioBacktesterPage() {
  return <BacktesterApp />;
}
