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
        return await db.bookings.getAll();
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
        return await db.expenses.getAll();
      } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
    }
  });

  if (bookingsLoading || expensesLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  // حساب البيانات الشهرية
  const monthlyData = bookings.reduce((acc, booking) => {
    if (!booking.date) return acc;
    
    const month = moment(booking.date).format('YYYY-MM');
    if (!acc[month]) {
      acc[month] = {
        month: moment(month).format('MMM YYYY'),
        income: 0,
        expenses: 0,
        bookings: 0,
        netProfit: 0
      };
    }
    acc[month].income += booking.price || 0;
    acc[month].bookings += 1;
    return acc;
  }, {} as Record<string, any>);

  // إضافة المصروفات
  expenses.forEach(expense => {
    if (!expense.date) return;
    
    const month = moment(expense.date).format('YYYY-MM');
    if (!monthlyData[month]) {
      monthlyData[month] = {
        month: moment(month).format('MMM YYYY'),
        income: 0,
        expenses: 0,
        bookings: 0,
        netProfit: 0
      };
    }
    monthlyData[month].expenses += expense.amount || 0;
  });

  // حساب صافي الربح وتحويل إلى مصفوفة
  const chartData = Object.values(monthlyData)
    .map(data => ({
      ...data,
      netProfit: (data.income || 0) - (data.expenses || 0)
    }))
    .sort((a, b) => moment(b.month, 'MMM YYYY').diff(moment(a.month, 'MMM YYYY')));

  // حساب الإجماليات
  const totalIncome = chartData.reduce((sum, data) => sum + (data.income || 0), 0);
  const totalExpenses = chartData.reduce((sum, data) => sum + (data.expenses || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <main className="container mx-auto p-4 max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold text-white">لوحة الإحصائيات</h1>

{/* البطاقات الإحصائية */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <StatsCard
    title="إجمالي الدخل"
    value={`${totalIncome.toFixed(3)} د`}
    icon={BanknotesIcon}
    showTrend={true}
    isPositive={true}
    trendValue={5.2}
  />
  <StatsCard
    title="صافي الربح"
    value={`${netProfit.toFixed(3)} د`}
    icon={ArrowTrendingUpIcon}
    showTrend={true}
    isPositive={netProfit > 0}
    trendValue={Math.abs(((netProfit / totalIncome) * 100) || 0)}
  />
  <StatsCard
    title="المصروفات"
    value={`${totalExpenses.toFixed(3)} د`}
    icon={ArrowTrendingDownIcon}
    showTrend={true}
    isPositive={false}
    trendValue={3.1}
  />
  <StatsCard
    title="عدد الحجوزات"
    value={String(bookings.length)}
    icon={ChartBarIcon}
    showTrend={false}
  />
</div>

      {/* الرسم البياني */}
      {chartData.length > 0 && (
        <div className="glass-container">
          <h2 className="text-xl font-bold mb-4 text-white">تحليل الدخل والمصروفات</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  fill="url(#colorIncome)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="المصروفات"
                  stroke="#ef4444"
                  fill="url(#colorExpenses)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* جدول البيانات */}
      <div className="glass-container">
        <h2 className="text-xl font-bold mb-4 text-white">التقرير الشهري</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right py-3 px-4 font-medium">الشهر</th>
                <th className="text-right py-3 px-4 font-medium">الدخل</th>
                <th className="text-right py-3 px-4 font-medium">المصروفات</th>
                <th className="text-right py-3 px-4 font-medium">صافي الربح</th>
                <th className="text-right py-3 px-4 font-medium">عدد الحجوزات</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((data) => (
                <tr key={data.month} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">{data.month}</td>
                  <td className="py-3 px-4">{data.income?.toFixed(3)} د</td>
                  <td className="py-3 px-4">{data.expenses?.toFixed(3)} د</td>
                  <td className="py-3 px-4">
                    <span className={data.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {data.netProfit?.toFixed(3)} د
                    </span>
                  </td>
                  <td className="py-3 px-4">{data.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}