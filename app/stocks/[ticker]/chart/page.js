import { redirect } from "next/navigation";

export default async function StockChartRedirectPage({ params }) {
  const { ticker } = await params;
  redirect(`/stocks/${String(ticker).toUpperCase()}?view=chart`);
}
