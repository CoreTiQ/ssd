'use client';

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
}

export default function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="w-6 h-6 text-white/60" />
        </div>
      </div>
    </div>
  );
}