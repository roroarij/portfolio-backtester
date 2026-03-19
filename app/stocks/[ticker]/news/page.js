import { redirect } from "next/navigation";

export default async function StockNewsRedirectPage({ params }) {
  const { ticker } = await params;
  redirect(`/stocks/${String(ticker).toUpperCase()}?view=news`);
}
