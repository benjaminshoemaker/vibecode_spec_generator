"use client";

import React, { useState, useEffect } from 'react';

interface ActivityEvent {
  id: string;
  message: string;
  timestamp: string;
  eventType: string;
}

// Helper function to calculate "X minutes ago"
const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const eventTime = new Date(timestamp);
  const diffMs = now.getTime() - eventTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fetch activities from API
  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activity');
      const data = await response.json();
      if (data.events && data.events.length > 0) {
        setActivities(data.events);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchActivities();

    // Fetch new activities every 30 seconds
    const fetchInterval = setInterval(fetchActivities, 30000);

    // Rotate through activities every 4 seconds
    const rotateInterval = setInterval(() => {
      setFadeIn(false);

      setTimeout(() => {
        setCurrentActivity((prev) => {
          if (activities.length === 0) return 0;
          return (prev + 1) % activities.length;
        });
        setFadeIn(true);
      }, 500);
    }, 4000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(rotateInterval);
    };
  }, [activities.length]);

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted || activities.length === 0) {
    return (
      <div className="w-full bg-zinc-900/30 border border-zinc-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Live Activity
            </span>
          </div>
          <div className="flex-1 text-sm text-zinc-300 font-mono">
            {mounted ? 'Waiting for activity...' : 'Loading activity...'}
          </div>
        </div>
      </div>
    );
  }

  const currentEvent = activities[currentActivity];

  return (
    <div className="w-full bg-zinc-900/30 border border-zinc-800 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            Live Activity
          </span>
        </div>
        <div
          className={`flex-1 text-sm text-zinc-300 font-mono transition-opacity duration-500 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {currentEvent.message} → {getTimeAgo(currentEvent.timestamp)}
        </div>
      </div>
    </div>
  );
}
