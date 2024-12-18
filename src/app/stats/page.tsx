'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import moment from 'moment';
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
  const monthlyStats = Object.values(monthlyData).sort((a, b) => 
    moment(b.month).diff(moment(a.month))
  ).map(data => ({
    ...data,
    monthName: moment(data.month).format('MMMM YYYY'),
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

      {/* تفاصيل شهرية */}
      <div className="glass-container">
        <h2 className="text-xl font-bold mb-6">التقرير الشهري</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right py-3 px-4">الشهر</th>
                <th className="text-right py-3 px-4">الدخل</th>
                <th className="text-right py-3 px-4">المصروفات</th>
                <th className="text-right py-3 px-4">صافي الربح</th>
                <th className="text-right py-3 px-4">عدد الحجوزات</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.map((month) => (
                <tr key={month.month} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">{month.monthName}</td>
                  <td className="py-3 px-4">{month.income.toFixed(3)} د</td>
                  <td className="py-3 px-4">{month.expenses.toFixed(3)} د</td>
                  <td className="py-3 px-4">
                    <span className={month.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {month.netProfit.toFixed(3)} د
                    </span>
                  </td>
                  <td className="py-3 px-4">{month.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}