'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface LogEntry {
  id: number;
  icon: string;
  text: string;
  color: string;
  time: number;
}

interface ActivityLogProps {
  entries: LogEntry[];
  maxEntries?: number;
}

export function ActivityLog({ entries, maxEntries = 20 }: ActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  const visible = entries.slice(-maxEntries);

  if (visible.length === 0) {
    return (
      <div className="bg-gray-900/30 border border-gray-800/40 rounded-lg px-3 py-2">
        <div className="text-[11px] text-gray-600 text-center">No activity yet — start clicking!</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/30 border border-gray-800/40 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 border-b border-gray-800/40 flex items-center justify-between">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Activity Log</span>
        <span className="text-[10px] text-gray-600">{visible.length} events</span>
      </div>
      <div ref={scrollRef} className="max-h-28 overflow-y-auto px-2 py-1.5 space-y-0.5">
        {visible.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex items-center gap-1.5 text-[11px] leading-tight ${i === visible.length - 1 ? 'log-entry' : 'log-fade'}`}
          >
            <span className="flex-shrink-0 w-4 text-center">{entry.icon}</span>
            <span className="truncate" style={{ color: entry.color }}>{entry.text}</span>
            <span className="flex-shrink-0 text-gray-700 ml-auto">{formatTimeAgo(entry.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'now';
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}
