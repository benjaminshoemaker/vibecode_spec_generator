import { NextRequest, NextResponse } from "next/server";

const SPIKELOG_ENDPOINT = "https://api.spikelog.com/api/v1/ingest";

export async function POST(request: NextRequest) {
  const apiKey = process.env.SPIKELOG_API_KEY;

  // If no API key configured, silently succeed
  if (!apiKey) {
    return NextResponse.json({ success: true });
  }

  try {
    const { chart, value, tags } = await request.json();

    if (!chart || typeof value !== "number") {
      return NextResponse.json(
        { error: "Invalid request: chart and value are required" },
        { status: 400 }
      );
    }

    const body: Record<string, unknown> = { chart, value };
    if (tags && Object.keys(tags).length > 0) {
      body.tags = tags;
    }

    // Fire and forget to Spikelog
    fetch(SPIKELOG_ENDPOINT, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).catch(() => {
      // Silently ignore errors
    });

    return NextResponse.json({ success: true });
  } catch {
    // Silently succeed even on errors - metrics should never break the app
    return NextResponse.json({ success: true });
  }
}
