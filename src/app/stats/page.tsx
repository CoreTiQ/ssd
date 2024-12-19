'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import {
  BanknotesIcon,
  CalculatorIcon,
  UsersIcon,
  ChartBarIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import moment from 'moment';
import type { ComponentProps } from 'react';

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
    <div className="stats-card">
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

function formatDate(date: string) {
  return moment(date).format('YYYY/MM/DD');
}

function getBookingTypeText(type: string) {
  switch (type) {
    case 'morning': return 'صباحي';
    case 'evening': return 'مسائي';
    case 'full': return 'يوم كامل';
    default: return type;
  }
}

function handlePrint() {
  window.print();
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-white/60">جاري التحميل...</div>
      </div>
    );
  }

  const totalIncome = bookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">لوحة الإحصائيات</h1>
          <button
            onClick={handlePrint}
            className="print-button"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>طباعة التقرير</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 print:grid-cols-4">
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

        <div className="data-table mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">سجل المصروفات</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={index}>
                    <td>{expense.title}</td>
                    <td>{formatNumber(expense.amount)} د</td>
                    <td>{formatDate(expense.date)}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center">
                      لا توجد مصروفات مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="data-table mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">سجل الحجوزات</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                  <th>النوع</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={index}>
                    <td>{booking.client_name}</td>
                    <td>{formatNumber(booking.price)} د</td>
                    <td>{formatDate(booking.date)}</td>
                    <td>{getBookingTypeText(booking.booking_type)}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      لا توجد حجوزات مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-card {
          @apply rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-colors;
        }

        .print-button {
          @apply flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg 
                 transition-colors text-white print:hidden;
        }

        .data-table {
          @apply rounded-xl bg-white/5 p-6 border border-white/10;
        }

        .data-table table {
          @apply w-full;
        }

        .data-table th {
          @apply p-4 text-right border-b border-white/10 text-white;
        }

        .data-table td {
          @apply p-4 text-right border-b border-white/5 text-white/80;
        }

        .data-table tr:hover td {
          @apply bg-white/5;
        }

        @media print {
          :global(body) {
            background: white !important;
            color: black !important;
          }

          :global(.container) {
            max-width: none !important;
            padding: 0 !important;
          }

          .stats-card {
            background: white !important;
            border: 1px solid #eee !important;
          }

          .stats-card div {
            color: black !important;
          }

          .data-table {
            background: white !important;
            border: none !important;
          }

          .data-table th,
          .data-table td {
            color: black !important;
            border-color: #ddd !important;
          }

          h1, h2 {
            color: black !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </>
  );
}