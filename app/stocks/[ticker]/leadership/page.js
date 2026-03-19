import StockHubPage, { getStockMetadata } from "@/components/StockHubPage";

export async function generateMetadata({ params }) {
  const { ticker } = await params;

  try {
    return await getStockMetadata(ticker, "leadership");
  } catch {
    return {
      title: "Leadership | Stocks Screener"
    };
  }
}

export default async function StockLeadershipPage({ params }) {
  const { ticker } = await params;

  return <StockHubPage ticker={ticker} selectedView="leadership" />;
}
