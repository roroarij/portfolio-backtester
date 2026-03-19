import { redirect } from "next/navigation";

export default async function StockTechnicalAnalysisRedirectPage({ params }) {
  const { ticker } = await params;
  redirect(`/stocks/${String(ticker).toUpperCase()}?view=technical-analysis`);
}
