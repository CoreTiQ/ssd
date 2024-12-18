'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import moment from 'moment';
import { Line, Bar } from 'react-chartjs-2';
import { calculateStats } from '@/lib/utils';
import StatsCard from '@/components/Stats/StatsCard';
import {
  BanknotesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// تسجيل مكونات الرسم البياني
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function StatsPage() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll()
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => db.expenses.getAll()
  });

  // تجميع البيانات حسب الشهر
  const monthlyData = bookings.reduce((acc, booking) => {
    const month = moment(booking.date).format('YYYY-MM');
    if (!acc[month]) {
      acc[month] = { income: 0, bookings: 0, expenses: 0 };
    }
    acc[month].income += booking.price;
    acc[month].bookings += 1;
    return acc;
  }, {} as Record<string, { income: number; bookings: number; expenses: number }>);

  // إضافة المصروفات إلى البيانات الشهرية
  expenses.forEach(expense => {
    const month = moment(expense.date).format('YYYY-MM');
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, bookings: 0, expenses: 0 };
    }
    monthlyData[month].expenses += expense.amount;
  });

  // ترتيب البيانات حسب الشهر
  const sortedMonths = Object.keys(monthlyData).sort();
  
  // تحضير بيانات الرسم البياني
  const chartData = {
    labels: sortedMonths.map(month => moment(month).format('MMMM YYYY')),
    datasets: [
      {
        label: 'الدخل',
        data: sortedMonths.map(month => monthlyData[month].income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'المصروفات',
        data: sortedMonths.map(month => monthlyData[month].expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      }
    ]
  };

  // إحصائيات إجمالية
  const stats = calculateStats(bookings, expenses);

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="إجمالي الدخل"
          value={`${stats.totalIncome.toFixed(3)} د`}
          icon={BanknotesIcon}
          trend={stats.incomeTrend}
        />
        <StatsCard
          title="صافي الربح"
          value={`${stats.netProfit.toFixed(3)} د`}
          icon={TrendingUpIcon}
          trend={{
            value: ((stats.netProfit / stats.totalIncome) * 100).toFixed(1),
            isPositive: stats.netProfit > 0
          }}
        />
        <StatsCard
          title="المصروفات"
          value={`${stats.totalExpenses.toFixed(3)} د`}
          icon={TrendingDownIcon}
          trend={stats.expensesTrend}
        />
        <StatsCard
          title="نسبة الإشغال"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          icon={ChartBarIcon}
          trend={stats.occupancyTrend}
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="space-y-8">
        {/* رسم بياني للدخل والمصروفات */}
        <div className="glass-container">
          <h2 className="text-xl font-bold mb-4">تحليل الدخل والمصروفات</h2>
          <div className="h-[400px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: value => `${value} د`
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                  }
                }
              }}
            />
          </div>
        </div>

        {/* رسم بياني للحجوزات */}
        <div className="glass-container">
          <h2 className="text-xl font-bold mb-4">إحصائيات الحجوزات</h2>
          <div className="h-[400px]">
            <Bar
              data={{
                labels: sortedMonths.map(month => moment(month).format('MMMM YYYY')),
                datasets: [{
                  label: 'عدد الحجوزات',
                  data: sortedMonths.map(month => monthlyData[month].bookings),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}