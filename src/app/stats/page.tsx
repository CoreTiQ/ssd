'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import moment from 'moment';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Tab } from '@headlessui/react';
import StatsCard from '@/components/Stats/StatsCard';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function StatsPage() {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll()
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => db.expenses.getAll()
  });

  if (bookingsLoading || expensesLoading) {
    return <div className="container mx-auto p-4">جاري التحميل...</div>;
  }

  const currentMonth = moment().format('YYYY-MM');
  
  // تحضير البيانات للرسوم البيانية
  const chartData = bookings.reduce((acc, booking) => {
    const month = moment(booking.date).format('YYYY-MM');
    if (!acc[month]) {
      acc[month] = {
        month: moment(month).format('MMM YYYY'),
        income: 0,
        expenses: 0,
        bookings: 0
      };
    }
    acc[month].income += booking.price;
    acc[month].bookings += 1;
    return acc;
  }, {} as Record<string, any>);

  // إضافة المصروفات
  expenses.forEach(expense => {
    const month = moment(expense.date).format('YYYY-MM');
    if (!chartData[month]) {
      chartData[month] = {
        month: moment(month).format('MMM YYYY'),
        income: 0,
        expenses: 0,
        bookings: 0
      };
    }
    chartData[month].expenses += expense.amount;
  });

  // تحويل البيانات إلى مصفوفة
  const monthlyData = Object.values(chartData).map(data => ({
    ...data,
    netProfit: data.income - data.expenses
  }));

  // حساب الإجماليات
  const totalIncome = monthlyData.reduce((sum, data) => sum + data.income, 0);
  const totalExpenses = monthlyData.reduce((sum, data) => sum + data.expenses, 0);
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
          trend={{
            value: 5.2,
            isPositive: true
          }}
        />
        <StatsCard
          title="صافي الربح"
          value={`${netProfit.toFixed(3)} د`}
          icon={ArrowTrendingUpIcon}
          trend={{
            value: ((netProfit / totalIncome) * 100).toFixed(1),
            isPositive: netProfit > 0
          }}
        />
        <StatsCard
          title="المصروفات"
          value={`${totalExpenses.toFixed(3)} د`}
          icon={ArrowTrendingDownIcon}
          trend={{
            value: 3.1,
            isPositive: false
          }}
        />
        <StatsCard
          title="عدد الحجوزات"
          value={String(bookings.length)}
          icon={ChartBarIcon}
          trend={{
            value: 8.2,
            isPositive: true
          }}
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="glass-container">
        <h2 className="text-xl font-bold mb-4 text-white">تحليل الدخل والمصروفات</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
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

      {/* جدول التفاصيل */}
      <div className="glass-container">
        <h2 className="text-xl font-bold mb-4 text-white">التقرير التفصيلي</h2>
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
              {monthlyData.map((month) => (
                <tr key={month.month} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">{month.month}</td>
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