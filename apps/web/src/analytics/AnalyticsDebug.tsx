/**
 * Analytics Debug Overlay
 * Design System v3.0 - Premium Light
 *
 * DEV ONLY — NOT RENDERED IN PRODUCTION
 * Shows last 20 tracked events in a collapsible panel.
 */

import React, { useState, useEffect } from 'react';

const IS_DEV = process.env.NODE_ENV === 'development';

interface DebugEvent {
  id: number;
  timestamp: string;
  event: string;
  payload?: Record<string, unknown>;
}

// In-memory event buffer (shared across instances)
const eventBuffer: DebugEvent[] = [];
let eventId = 0;
const listeners = new Set<() => void>();

/**
 * Push an event to the debug buffer (call from track.ts)
 */
export function pushDebugEvent(event: string, payload?: Record<string, unknown>): void {
  if (!IS_DEV) return;

  eventBuffer.unshift({
    id: eventId++,
    timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
    event,
    payload,
  });

  // Keep only last 20
  if (eventBuffer.length > 20) {
    eventBuffer.pop();
  }

  // Notify listeners
  listeners.forEach((fn) => fn());
}

/**
 * Debug Panel Component
 */
const AnalyticsDebug: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const update = () => forceUpdate({});
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  if (!IS_DEV) return null;

  return (
    <div className="fixed bottom-[70px] right-2.5 z-[9999] font-mono text-[11px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 bg-gray-800 text-white border-none rounded cursor-pointer"
        aria-label="Toggle analytics debug"
      >
        {isOpen ? 'Analytics (hide)' : 'Analytics (show)'}
      </button>

      {isOpen && (
        <div className="absolute bottom-9 right-0 w-80 max-h-[300px] bg-gray-800 text-gray-400 rounded-md overflow-hidden shadow-lg">
          <div className="flex justify-between items-center px-2.5 py-2 border-b border-gray-700">
            <span className="font-bold text-white">Analytics Events</span>
            <button
              onClick={() => {
                eventBuffer.length = 0;
                forceUpdate({});
              }}
              className="px-2 py-0.5 text-[10px] bg-gray-700 text-white border-none rounded cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="max-h-[250px] overflow-y-auto p-1.5">
            {eventBuffer.length === 0 ? (
              <div className="text-gray-500 text-center py-5">No events yet</div>
            ) : (
              eventBuffer.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-col gap-0.5 p-1.5 mb-1 bg-gray-900 rounded"
                >
                  <span className="text-gray-500 text-[9px]">{e.timestamp}</span>
                  <span className="text-cyan-400 font-bold">{e.event}</span>
                  {e.payload && (
                    <span className="text-gray-400 text-[10px] break-all">
                      {JSON.stringify(e.payload).slice(0, 50)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDebug;
