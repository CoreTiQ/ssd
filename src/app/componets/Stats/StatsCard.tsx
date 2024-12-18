'use client';

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: {
    value: number;
    isPositive: boolean;
  } | null;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend = null 
}: StatsCardProps) {
  return (
    <div className="glass-container p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="w-6 h-6 text-white/60" />
        </div>
      </div>

      {trend !== null && (
        <div className="mt-4 flex items-center">
          {trend.isPositive ? (
            <ArrowUpIcon className="w-4 h-4 text-green-400" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 text-red-400" />
          )}
          <span 
            className={`text-sm ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {Math.abs(trend.value)}% مقارنة بالشهر السابق
          </span>
        </div>
      )}
    </div>
  );
}