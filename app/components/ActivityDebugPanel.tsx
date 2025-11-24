"use client";

import React, { useState } from 'react';

export default function ActivityDebugPanel() {
  const [response, setResponse] = useState<any>(null);

  const testTrackEvent = async () => {
    console.log('[Debug] Testing track event...');
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'wizard_start',
          params: { source: 'debug_panel' }
        }),
      });
      const data = await res.json();
      console.log('[Debug] Track response:', data);
      setResponse({ type: 'track', data });
    } catch (error) {
      console.error('[Debug] Track error:', error);
      setResponse({ type: 'track', error: String(error) });
    }
  };

  const testFetchEvents = async () => {
    console.log('[Debug] Testing fetch events...');
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      console.log('[Debug] Activity response:', data);
      setResponse({ type: 'activity', data });
    } catch (error) {
      console.error('[Debug] Activity error:', error);
      setResponse({ type: 'activity', error: String(error) });
    }
  };

  // Only show in development (localhost)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="text-white font-bold mb-2 text-sm">Activity Debug Panel</h3>
      <div className="flex gap-2 mb-2">
        <button
          onClick={testTrackEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs rounded"
        >
          Test Track Event
        </button>
        <button
          onClick={testFetchEvents}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs rounded"
        >
          Test Fetch Events
        </button>
      </div>
      {response && (
        <div className="bg-zinc-950 p-2 rounded text-xs font-mono text-zinc-300 overflow-auto max-h-40">
          <div className="text-emerald-400 mb-1">{response.type} response:</div>
          <pre>{JSON.stringify(response.data || response.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
