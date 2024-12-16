'use client';

import { useQuery } from '@tanstack/react-query';
import { getBookings } from '@/lib/supabase';
import moment from 'moment';
import StatsCard from './StatsCard';
import { calculateStats } from '@/lib/utils';
import {
  BanknotesIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function StatsGrid() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings
  });

  const currentMonth = moment().format('MM-YYYY');
  const monthBookings = bookings.filter(
    booking => moment(booking.date).format('MM-YYYY') === currentMonth
  );

  const stats = calculateStats(monthBookings);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <StatsCard
        title="إجمالي الدخل"
        value={`${stats.totalIncome.toFixed(3)} د`}
        icon={BanknotesIcon}
        trend={stats.incomeTrend}
      />
      <StatsCard
        title="عدد الحجوزات"
        value={String(stats.totalBookings)}
        icon={CalendarIcon}
        trend={stats.bookingsTrend}
      />
      <StatsCard
        title="نسبة الإشغال"
        value={`${stats.occupancyRate.toFixed(1)}%`}
        icon={ChartBarIcon}
        trend={stats.occupancyTrend}
      />
    </div>
  );
}