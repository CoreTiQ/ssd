'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import moment from 'moment';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer 
} from 'recharts';
import { calculateStats } from '@/lib/utils';
import StatsCard from '@/components/Stats/StatsCard';
import {
  BanknotesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

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
      acc[month] = { month, income: 0, bookings: 0, expenses: 0 };
    }
    acc[month].income += booking.price;
    acc[month].bookings += 1;
    return acc;
  }, {} as Record<string, { month: string; income: number; bookings: number; expenses: number }>);

  // إضافة المصروفات إلى البيانات الشهرية
  expenses.forEach(expense => {
    const month = moment(expense.date).format('YYYY-MM');
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, bookings: 0, expenses: 0 };
    }
    monthlyData[month].expenses += expense.amount;
  });

  // تحويل البيانات إلى مصفوفة مرتبة
  const chartData = Object.values(monthlyData).sort((a, b) => 
    moment(a.month).diff(moment(b.month))
  ).map(data => ({
    ...data,
    month: moment(data.month).format('MMMM YYYY'),
    netProfit: data.income - data.expenses
  }));

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
          <h2 className="text-xl font-bold mb-4 text-white">تحليل الدخل والمصروفات</h2>
          <div className="h-[400px] text-white">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  name="الدخل"
                  stroke="#22c55e" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  name="المصروفات"
                  stroke="#ef4444" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  name="صافي الربح"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* رسم بياني للحجوزات */}
        <div className="glass-container">
          <h2 className="text-xl font-bold mb-4 text-white">إحصائيات الحجوزات</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Legend />
                <Bar 
                  dataKey="bookings" 
                  name="عدد الحجوزات"
                  fill="#3b82f6" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}