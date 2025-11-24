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
    <div className="w-full bg-zinc-900/50 border border-zinc-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-400 uppercase tracking-wide font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
