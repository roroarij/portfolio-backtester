import StockHubPage, { getStockMetadata } from "@/components/StockHubPage";

export async function generateMetadata({ params }) {
  const { ticker } = await params;

  try {
    return await getStockMetadata(ticker, "technical-analysis");
  } catch {
    return {
      title: "Technical Analysis | Stocks Screener"
    };
  }
}

export default async function StockTechnicalAnalysisPage({ params }) {
  const { ticker } = await params;

  return <StockHubPage ticker={ticker} selectedView="technical-analysis" />;
}
