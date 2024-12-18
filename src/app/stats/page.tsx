'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import moment from 'moment';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import StatsCard from '@/components/Stats/StatsCard';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function StatsPage() {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      try {
        const data = await db.bookings.getAll();
        return data || [];
      } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
    }
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      try {
        const data = await db.expenses.getAll();
        return data || [];
      } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
    }
  });

  if (bookingsLoading || expensesLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-white text-center">جاري التحميل...</div>
      </div>
    );
  }

  // حساب الإجماليات
  const totalIncome = bookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  // حساب البيانات الشهرية للرسم البياني
  const monthlyData = [...bookings].reverse().reduce((acc, booking) => {
    const month = moment(booking.date).format('MMM YYYY');
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    acc[month].income += booking.price || 0;
    return acc;
  }, {});

  // إضافة المصروفات للبيانات الشهرية
  [...expenses].reverse().forEach(expense => {
    const month = moment(expense.date).format('MMM YYYY');
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expenses: 0 };
    }
    monthlyData[month].expenses += expense.amount || 0;
  });

  const chartData = Object.values(monthlyData);

  return (
    <main className="container mx-auto p-4 max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold text-white">لوحة الإحصائيات</h1>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي الدخل"
          value={`${totalIncome.toFixed(3)} د`}
          icon={BanknotesIcon}
        />
        <StatsCard
          title="صافي الربح"
          value={`${netProfit.toFixed(3)} د`}
          icon={ArrowTrendingUpIcon}
        />
        <StatsCard
          title="المصروفات"
          value={`${totalExpenses.toFixed(3)} د`}
          icon={ArrowTrendingDownIcon}
        />
        <StatsCard
          title="عدد الحجوزات"
          value={String(bookings.length)}
          icon={ChartBarIcon}
        />
      </div>

      {/* الرسم البياني */}
      {chartData.length > 0 && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4 text-white">تحليل الدخل والمصروفات</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="month" 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff90' }}
                />
                <YAxis 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff90' }}
                  tickFormatter={(value) => `${value} د`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="الدخل"
                  stroke="#22c55e"
                  fill="#22c55e33"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="المصروفات"
                  stroke="#ef4444"
                  fill="#ef444433"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* جدول البيانات */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-4 text-white">التقرير الشهري</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right py-3 px-4">الشهر</th>
                <th className="text-right py-3 px-4">الدخل</th>
                <th className="text-right py-3 px-4">المصروفات</th>
                <th className="text-right py-3 px-4">صافي الربح</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((data) => (
                <tr key={data.month} className="border-b border-white/5">
                  <td className="py-3 px-4 text-white">{data.month}</td>
                  <td className="py-3 px-4 text-green-400">{data.income.toFixed(3)} د</td>
                  <td className="py-3 px-4 text-red-400">{data.expenses.toFixed(3)} د</td>
                  <td className="py-3 px-4 text-white">
                    {(data.income - data.expenses).toFixed(3)} د
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}