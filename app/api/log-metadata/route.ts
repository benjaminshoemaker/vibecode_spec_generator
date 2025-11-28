import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SpecMetadata } from "@/app/utils/parseSpecMetadata";

async function sendNotificationEmail(metadata: SpecMetadata) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email notification");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "VibeScaffold <onboarding@resend.dev>",
      to: "ben.shoemaker.xyz@gmail.com",
      subject: `New spec generated: ${metadata.appName || "Unknown App"}`,
      text: `A new spec was generated on VibeScaffold.

App Name: ${metadata.appName || "N/A"}
Platform: ${metadata.platform || "N/A"}
Tech Stack: ${metadata.techStack.length > 0 ? metadata.techStack.join(", ") : "N/A"}
Complexity: ${metadata.complexityTier}
Integrations: ${metadata.integrationCount}

Problem: ${metadata.problem || "N/A"}

Ideal User: ${metadata.idealUser || "N/A"}`,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}

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

    // Fire and forget - send email notification without blocking
    sendNotificationEmail(metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log metadata:", error);
    // Return 200 anyway - fire and forget, don't block user
    return NextResponse.json({ success: false });
  }
}
