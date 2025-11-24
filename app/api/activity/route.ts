import { NextResponse } from 'next/server';
import { activityStore } from '@/app/utils/activityStore';

export const runtime = 'edge';

export async function GET() {
  const recentEvents = activityStore.getRecentEvents(10);

  return NextResponse.json({
    events: recentEvents.map(event => ({
      id: event.id,
      message: event.message,
      timestamp: event.timestamp.toISOString(),
      eventType: event.eventType,
    })),
  });
}
