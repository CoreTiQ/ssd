'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { useState } from 'react';
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
import { format, parseISO, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { calculateStats } from '@/lib/utils';
import StatsCard from '@/components/Stats/StatsCard';
import {
  BanknotesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState('year'); // year, 6months, 3months
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll()
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => db.expenses.getAll()
  });

  // حساب الفترة الزمنية المحددة
  const getFilteredData = () => {
    const now = new Date();
    const months = timeRange === 'year' ? 12 : timeRange === '6months' ? 6 : 3;
    const startDate = subMonths(now, months);
    
    return {
      bookings: bookings.filter(b => parseISO(b.date) >= startDate),
      expenses: expenses.filter(e => parseISO(e.date) >= startDate)
    };
  };

  const { bookings: filteredBookings, expenses: filteredExpenses } = getFilteredData();
  const stats = calculateStats(filteredBookings, filteredExpenses);

  // تجهيز بيانات الرسوم البيانية
  const chartData = generateChartData(filteredBookings, filteredExpenses);

  return (
    <main className="container mx-auto p-4 max-w-7xl space-y-6">
      {/* فلتر الفترة الزمنية */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">لوحة الإحصائيات</h1>
        <div className="bg-white/5 rounded-lg p-1">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-transparent text-white px-4 py-2 rounded-lg focus:outline-none"
          >
            <option value="year">سنة</option>
            <option value="6months">6 أشهر</option>
            <option value="3months">3 أشهر</option>
          </select>
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* علامات التبويب للرسوم البيانية */}
      <Tab.Group>
        <Tab.List className="flex space-x-2 rounded-xl bg-white/5 p-1 rtl:space-x-reverse">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'focus:outline-none',
                selected
                  ? 'bg-white/10 text-white shadow'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )
            }
          >
            تحليل الدخل والمصروفات
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'focus:outline-none',
                selected
                  ? 'bg-white/10 text-white shadow'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )
            }
          >
            إحصائيات الحجوزات
          </Tab>
        </Tab.List>
        <Tab.Panels>
          {/* تحليل الدخل والمصروفات */}
          <Tab.Panel>
            <div className="glass-container h-[500px]">
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
          </Tab.Panel>

          {/* إحصائيات الحجوزات */}
          <Tab.Panel>
            <div className="glass-container h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#ffffff60"
                    tick={{ fill: '#ffffff90' }}
                  />
                  <YAxis 
                    stroke="#ffffff60"
                    tick={{ fill: '#ffffff90' }}
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
                  <Bar 
                    dataKey="bookings" 
                    name="عدد الحجوزات"
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* جدول التفاصيل */}
      <div className="glass-container overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">التقرير التفصيلي</h2>
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm">
            تصدير التقرير
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right py-3 px-4 font-medium">الشهر</th>
                <th className="text-right py-3 px-4 font-medium">الدخل</th>
                <th className="text-right py-3 px-4 font-medium">المصروفات</th>
                <th className="text-right py-3 px-4 font-medium">صافي الربح</th>
                <th className="text-right py-3 px-4 font-medium">عدد الحجوزات</th>
                <th className="text-right py-3 px-4 font-medium">التغير</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((month, index) => (
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
                  <td className="py-3 px-4">
                    {index < chartData.length - 1 ? (
                      <div className="flex items-center gap-1">
                        {month.income > chartData[index + 1].income ? (
                          <ArrowUpIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4 text-red-400" />
                        )}
                        <span className={month.income > chartData[index + 1].income ? 'text-green-400' : 'text-red-400'}>
                          {Math.abs(((month.income - chartData[index + 1].income) / chartData[index + 1].income) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ) : '-'}
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

// دالة مساعدة لتوليد بيانات الرسوم البيانية
function generateChartData(bookings: any[], expenses: any[]) {
  const monthlyData = bookings.reduce((acc, booking) => {
    const month = format(parseISO(booking.date), 'MMM yyyy', { locale: ar });
    if (!acc[month]) {
      acc[month] = { 
        month, 
        income: 0, 
        expenses: 0, 
        bookings: 0,
        netProfit: 0 
      };
    }
    acc[month].income += booking.price;
    acc[month].bookings += 1;
    return acc;
  }, {} as Record<string, any>);

  expenses.forEach(expense => {
    const month = format(parseISO(expense.date), 'MMM yyyy', { locale: ar });
    if (!monthlyData[month]) {
      monthlyData[month] = { 
        month, 
        income: 0, 
        expenses: 0, 
        bookings: 0,
        netProfit: 0 
      };
    }
    monthlyData[month].expenses += expense.amount;
  });

  Object.values(monthlyData).forEach(data => {
    data.netProfit = data.income - data.expenses;
  });

  return Object.values(monthlyData).sort((a, b) => 
    parseISO(b.month).getTime() - parseISO(a.month).getTime()
  );
}