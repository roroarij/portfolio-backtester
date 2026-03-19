import BacktesterApp from "@/components/BacktesterApp";

export const metadata = {
  title: "Portfolio Backtester | Stocksscreener",
  description: "Backtest a custom portfolio of stocks by ticker and share count, then compare historical value over time."
};

export default function PortfolioBacktesterPage() {
  return <BacktesterApp />;
}
