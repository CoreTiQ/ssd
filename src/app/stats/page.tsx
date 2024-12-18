'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { SimpleStatsCard } from '@/components/Stats/SimpleStatsCard';
import { BanknotesIcon, CalculatorIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function StatsPage() {
  const { data: bookings = [] } = useQuery({
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

  const { data: expenses = [] } = useQuery({
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

  // حساب الإحصائيات الأساسية
  const totalIncome = bookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const totalBookings = bookings.length;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">لوحة الإحصائيات</h1>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SimpleStatsCard
          title="إجمالي الدخل"
          value={`${totalIncome.toFixed(3)} د`}
          icon={BanknotesIcon}
        />
        <SimpleStatsCard
          title="المصروفات"
          value={`${totalExpenses.toFixed(3)} د`}
          icon={CalculatorIcon}
        />
        <SimpleStatsCard
          title="صافي الربح"
          value={`${netProfit.toFixed(3)} د`}
          icon={ChartBarIcon}
        />
        <SimpleStatsCard
          title="عدد الحجوزات"
          value={totalBookings.toString()}
          icon={UsersIcon}
        />
      </div>

      <div className="mt-8 rounded-xl bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">تفاصيل المصروفات</h2>
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
                  <td className="p-4">{expense.amount?.toFixed(3)} د</td>
                  <td className="p-4">{new Date(expense.date).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">تفاصيل الحجوزات</h2>
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
                  <td className="p-4">{booking.price.toFixed(3)} د</td>
                  <td className="p-4">{new Date(booking.date).toLocaleDateString('ar-SA')}</td>
                  <td className="p-4">
                    {booking.booking_type === 'morning' && 'صباحي'}
                    {booking.booking_type === 'evening' && 'مسائي'}
                    {booking.booking_type === 'full' && 'يوم كامل'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}