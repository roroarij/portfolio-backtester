import StockHubPage, { getStockMetadata } from "@/components/StockHubPage";

export async function generateMetadata({ params }) {
  const { ticker } = await params;

  try {
    return await getStockMetadata(ticker, "fundamentals");
  } catch {
    return {
      title: "Stock Fundamentals | Stocks Screener"
    };
  }
}

export default async function StockFundamentalsPage({ params }) {
  const { ticker } = await params;

  return <StockHubPage ticker={ticker} selectedView="fundamentals" />;
}
