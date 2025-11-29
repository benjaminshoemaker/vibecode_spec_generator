import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { spikelog } from "@/app/utils/spikelog";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const { email, clientId } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // clientId is optional - may be null if not provided
    const sanitizedClientId = clientId && typeof clientId === "string" ? clientId : null;

    await sql`
      INSERT INTO subscribers (email, client_id)
      VALUES (${trimmedEmail}, ${sanitizedClientId})
      ON CONFLICT (email) DO UPDATE SET client_id = COALESCE(subscribers.client_id, ${sanitizedClientId})
    `;

    // Track successful email subscription (#15)
    spikelog.trackEmailSubscription(true);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);

    // Track failed email subscription (#15)
    spikelog.trackEmailSubscription(false);

    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
