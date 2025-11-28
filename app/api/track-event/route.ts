import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

interface TrackEventBody {
  clientId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const { clientId, eventType, metadata = {} }: TrackEventBody = await request.json();

    if (!clientId || !eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sql`
      INSERT INTO user_events (client_id, event_type, metadata)
      VALUES (${clientId}, ${eventType}, ${JSON.stringify(metadata)})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track event:", error);
    // Fire and forget - return 200 anyway so we don't block the user
    return NextResponse.json({ success: false });
  }
}
