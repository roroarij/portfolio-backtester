import StockHubPage, { getStockMetadata } from "@/components/StockHubPage";

export async function generateMetadata({ params }) {
  const { ticker } = await params;

  try {
    return await getStockMetadata(ticker, "news");
  } catch {
    return {
      title: "Stock News | Stocks Screener"
    };
  }
}

export default async function StockNewsPage({ params }) {
  const { ticker } = await params;

  return <StockHubPage ticker={ticker} selectedView="news" />;
}
