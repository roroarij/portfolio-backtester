import { NextResponse } from "next/server";

import { buildPortfolioHistory } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await buildPortfolioHistory(body?.holdings || [], body?.range);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
