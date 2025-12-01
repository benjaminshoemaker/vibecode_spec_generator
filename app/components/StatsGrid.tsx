"use client";

import React from 'react';

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "2,200+", label: "Active Users" },
  { value: "1,300+", label: "Chats Sent" },
  { value: "300+", label: "Documents Generated" },
  { value: "70+", label: "Complete Specs Created" },
];

export default function StatsGrid() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-zinc-800">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group p-8 text-center bg-zinc-950 border-r border-b border-zinc-800 last:border-r-0 lg:[&:nth-child(n+3)]:border-b-0 [&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r hover:bg-zinc-900 transition-colors relative card-hover-accent"
          >
            <div className="text-4xl font-bold text-white mb-1 tracking-tight">
              {stat.value}
            </div>
            <div className="text-2xs font-mono text-zinc-400 uppercase tracking-widest">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
