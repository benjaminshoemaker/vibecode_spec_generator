// In-memory store for recent activity events
// Stores last 50 events in memory for the activity ticker

interface ActivityEvent {
  id: string;
  message: string;
  timestamp: Date;
  eventType: string;
}

class ActivityStore {
  private events: ActivityEvent[] = [];
  private maxEvents = 50;

  addEvent(message: string, eventType: string) {
    const event: ActivityEvent = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      timestamp: new Date(),
      eventType,
    };

    this.events.unshift(event); // Add to beginning

    // Keep only last 50 events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    console.log('[ActivityStore] Event added. Total events:', this.events.length);
  }

  getRecentEvents(limit: number = 10): ActivityEvent[] {
    console.log('[ActivityStore] Getting recent events. Total:', this.events.length);
    return this.events.slice(0, limit);
  }

  clear() {
    this.events = [];
  }
}

// Use global to persist across Edge Runtime function calls in the same instance
// This is a hack for serverless, but necessary for in-memory storage
declare global {
  var activityStoreInstance: ActivityStore | undefined;
  var activityStoreEvents: ActivityEvent[] | undefined;
}

// Initialize global storage
if (!globalThis.activityStoreEvents) {
  globalThis.activityStoreEvents = [];
  console.log('[ActivityStore] Initialized global events array');
}

// Singleton instance that uses global storage
export const activityStore = new ActivityStore();

// Override methods to use global storage
activityStore.addEvent = function(message: string, eventType: string) {
  const event: ActivityEvent = {
    id: `${Date.now()}-${Math.random()}`,
    message,
    timestamp: new Date(),
    eventType,
  };

  globalThis.activityStoreEvents = globalThis.activityStoreEvents || [];
  globalThis.activityStoreEvents.unshift(event);

  // Keep only last 50 events
  if (globalThis.activityStoreEvents.length > 50) {
    globalThis.activityStoreEvents = globalThis.activityStoreEvents.slice(0, 50);
  }

  console.log('[ActivityStore] Event added to global. Total:', globalThis.activityStoreEvents.length);
};

activityStore.getRecentEvents = function(limit: number = 10): ActivityEvent[] {
  globalThis.activityStoreEvents = globalThis.activityStoreEvents || [];
  console.log('[ActivityStore] Getting from global. Total:', globalThis.activityStoreEvents.length);
  return globalThis.activityStoreEvents.slice(0, limit);
};
