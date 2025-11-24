import { NextResponse } from 'next/server';
import { activityKV } from '@/app/utils/activityKV';

export const runtime = 'edge';

export async function GET() {
  const recentEvents = await activityKV.getRecentEvents(10);

  console.log('[Activity API] Fetching events, count:', recentEvents.length);

  return NextResponse.json({
    events: recentEvents,
    totalEvents: recentEvents.length,
  });
}
