'use client';

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  showTrend?: boolean;
  isPositive?: boolean;
  trendValue?: number;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon,
  showTrend = false,
  isPositive = true,
  trendValue = 0
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

      {showTrend && (
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <ArrowUpIcon className="w-4 h-4 text-green-400" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 text-red-400" />
          )}
          <span 
            className={`text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {Math.abs(trendValue)}% مقارنة بالشهر السابق
          </span>
        </div>
      )}
    </div>
  );
}