import StockHubPage, { getStockMetadata } from "@/components/StockHubPage";

export async function generateMetadata({ params }) {
  const { ticker } = await params;

  try {
    return await getStockMetadata(ticker, "overview");
  } catch {
    return {
      title: "Stock Not Found | Stocks Screener"
    };
  }
}

export default async function StockTickerPage({ params }) {
  const { ticker } = await params;

  return <StockHubPage ticker={ticker} selectedView="overview" />;
}
