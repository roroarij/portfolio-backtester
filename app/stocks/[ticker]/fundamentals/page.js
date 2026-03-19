import { redirect } from "next/navigation";

export default async function StockFundamentalsRedirectPage({ params }) {
  const { ticker } = await params;
  redirect(`/stocks/${String(ticker).toUpperCase()}?view=fundamentals`);
}
