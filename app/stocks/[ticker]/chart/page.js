import StockHubPage, { getStockMetadata } from "@/components/StockHubPage";

export async function generateMetadata({ params }) {
  const { ticker } = await params;

  try {
    return await getStockMetadata(ticker, "chart");
  } catch {
    return {
      title: "Stock Chart | Stocks Screener"
    };
  }
}

export default async function StockChartPage({ params }) {
  const { ticker } = await params;

  return <StockHubPage ticker={ticker} selectedView="chart" />;
}
