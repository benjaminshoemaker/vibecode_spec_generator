import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { SpecMetadata } from "@/app/utils/parseSpecMetadata";

export async function POST(request: NextRequest) {
  try {
    const metadata: SpecMetadata = await request.json();

    // Convert array to Postgres array literal format
    const techStackArray = `{${metadata.techStack.map(t => `"${t.replace(/"/g, '\\"')}"`).join(",")}}`;

    await sql`
      INSERT INTO spec_metadata (
        app_name,
        problem,
        ideal_user,
        platform,
        tech_stack,
        integration_count,
        complexity_tier
      ) VALUES (
        ${metadata.appName},
        ${metadata.problem},
        ${metadata.idealUser},
        ${metadata.platform},
        ${techStackArray}::text[],
        ${metadata.integrationCount},
        ${metadata.complexityTier}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log metadata:", error);
    // Return 200 anyway - fire and forget, don't block user
    return NextResponse.json({ success: false });
  }
}
