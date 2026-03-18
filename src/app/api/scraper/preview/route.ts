import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/integrations/scraper";

export async function POST(request: NextRequest) {
  try {
    const { url, selectors } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await scrapeUrl({
      url,
      selectors: selectors || [],
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scraper error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
