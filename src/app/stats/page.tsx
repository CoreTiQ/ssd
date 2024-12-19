'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import {
  BanknotesIcon,
  CalculatorIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import type { ComponentProps } from 'react';

// تعريف مكون SimpleStatsCard
function SimpleStatsCard({ 
  title, 
  value, 
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  icon: (props: ComponentProps<'svg'>) => JSX.Element;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
        </div>
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="h-5 w-5 text-white/60" />
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number) {
  return num.toFixed(3);
}

function getBookingTypeText(type: string) {
  switch (type) {
    case 'morning': return 'صباحي';
    case 'evening': return 'مسائي';
    case 'full': return 'يوم كامل';
    default: return type;
  }
}

export default function StatsPage() {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      try {
        return await db.bookings.getAll() ?? [];
      } catch (error) {
        console.error('Error loading bookings:', error);
        return [];
      }
    }
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      try {
        return await db.expenses.getAll() ?? [];
      } catch (error) {
        console.error('Error loading expenses:', error);
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

  const totalIncome = bookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">لوحة الإحصائيات</h1>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SimpleStatsCard
          title="إجمالي الدخل"
          value={`${formatNumber(totalIncome)} د`}
          icon={BanknotesIcon}
        />
        <SimpleStatsCard
          title="المصروفات"
          value={`${formatNumber(totalExpenses)} د`}
          icon={CalculatorIcon}
        />
        <SimpleStatsCard
          title="صافي الربح"
          value={`${formatNumber(netProfit)} د`}
          icon={ChartBarIcon}
        />
        <SimpleStatsCard
          title="عدد الحجوزات"
          value={bookings.length.toString()}
          icon={UsersIcon}
        />
      </div>

      <div className="mt-8 rounded-xl bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">سجل المصروفات</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white">
                <th className="p-4 text-right">العنوان</th>
                <th className="p-4 text-right">المبلغ</th>
                <th className="p-4 text-right">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={index} className="border-b border-white/5 text-white/80">
                  <td className="p-4">{expense.title}</td>
                  <td className="p-4">{formatNumber(expense.amount)} د</td>
                  <td className="p-4">{new Date(expense.date).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-white/60">
                    لا توجد مصروفات مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">سجل الحجوزات</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white">
                <th className="p-4 text-right">العميل</th>
                <th className="p-4 text-right">المبلغ</th>
                <th className="p-4 text-right">التاريخ</th>
                <th className="p-4 text-right">النوع</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={index} className="border-b border-white/5 text-white/80">
                  <td className="p-4">{booking.client_name}</td>
                  <td className="p-4">{formatNumber(booking.price)} د</td>
                  <td className="p-4">{new Date(booking.date).toLocaleDateString('ar-SA')}</td>
                  <td className="p-4">{getBookingTypeText(booking.booking_type)}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-white/60">
                    لا توجد حجوزات مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}