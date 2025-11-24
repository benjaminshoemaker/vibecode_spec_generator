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
  }

  getRecentEvents(limit: number = 10): ActivityEvent[] {
    return this.events.slice(0, limit);
  }

  clear() {
    this.events = [];
  }
}

// Singleton instance
export const activityStore = new ActivityStore();
