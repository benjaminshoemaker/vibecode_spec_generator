import { NextRequest, NextResponse } from 'next/server';
import { activityStore } from '@/app/utils/activityStore';

export const runtime = 'edge';

// Vercel geolocation type (available in Edge Runtime)
interface VercelGeo {
  city?: string;
  country?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
}

// Extend NextRequest to include Vercel's geo property
interface VercelRequest extends NextRequest {
  geo?: VercelGeo;
}

// Map event types to human-readable messages with location
const getEventMessage = (eventType: string, params?: any, location?: string): string => {
  const loc = location ? ` in ${location}` : '';

  switch (eventType) {
    case 'wizard_start':
      return `Someone started the wizard${loc}`;
    case 'step_view':
      return `User viewing ${params?.step_name || 'a step'}${loc}`;
    case 'step_approved':
      return `${params?.step_name || 'Step'} approved${loc}`;
    case 'document_generate':
      return `${params?.step_name || 'Document'} generated${loc}`;
    case 'document_download':
      return `${params?.step_name || 'Document'} downloaded${loc}`;
    case 'bulk_download':
      return `ZIP downloaded with ${params?.document_count || 'multiple'} documents${loc}`;
    case 'wizard_complete':
      return `Full spec completed!${loc}`;
    case 'wizard_reset':
      return `User started over${loc}`;
    case 'chat_message':
      return `Chat message in ${params?.step_name || 'wizard'}${loc}`;
    case 'finalize_clicked':
      return `Finalize clicked${loc}`;
    case 'completion_modal_download':
      return `Completion modal download triggered${loc}`;
    case 'completion_modal_copy':
      return `Agent command copied${loc}`;
    default:
      return `Activity on the platform${loc}`;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { eventType, params } = await request.json();

    if (!eventType) {
      return NextResponse.json({ error: 'Missing eventType' }, { status: 400 });
    }

    // Get location from Vercel geolocation (available in Edge Runtime)
    const geo = (request as VercelRequest).geo;
    let location = '';

    if (geo) {
      // Build location string: "City, Country" or just "Country" if no city
      if (geo.city && geo.country) {
        location = `${geo.city}, ${geo.country}`;
      } else if (geo.country) {
        location = geo.country;
      }
    }

    const message = getEventMessage(eventType, params, location);
    activityStore.addEvent(message, eventType);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json({ error: 'Failed to track activity' }, { status: 500 });
  }
}
