// Vercel KV-based activity store for persistent, shared storage across all serverless instances
import { kv } from '@vercel/kv';

export interface ActivityEvent {
  id: string;
  message: string;
  timestamp: string;
  eventType: string;
}

const KV_KEY = 'activity:events';
const MAX_EVENTS = 50;

export const activityKV = {
  // Add a new event
  async addEvent(message: string, eventType: string): Promise<void> {
    try {
      const event: ActivityEvent = {
        id: `${Date.now()}-${Math.random()}`,
        message,
        timestamp: new Date().toISOString(),
        eventType,
      };

      // Get existing events
      const existing = await kv.get<ActivityEvent[]>(KV_KEY) || [];

      // Add new event at the beginning
      const updated = [event, ...existing];

      // Keep only last MAX_EVENTS
      const trimmed = updated.slice(0, MAX_EVENTS);

      // Store back to KV
      await kv.set(KV_KEY, trimmed);

      console.log('[ActivityKV] Event added. Total events:', trimmed.length);
    } catch (error) {
      console.error('[ActivityKV] Error adding event:', error);
      throw error;
    }
  },

  // Get recent events
  async getRecentEvents(limit: number = 10): Promise<ActivityEvent[]> {
    try {
      const events = await kv.get<ActivityEvent[]>(KV_KEY) || [];
      console.log('[ActivityKV] Fetched events. Total:', events.length);
      return events.slice(0, limit);
    } catch (error) {
      console.error('[ActivityKV] Error fetching events:', error);
      return [];
    }
  },

  // Clear all events (for testing)
  async clear(): Promise<void> {
    try {
      await kv.del(KV_KEY);
      console.log('[ActivityKV] All events cleared');
    } catch (error) {
      console.error('[ActivityKV] Error clearing events:', error);
    }
  }
};
