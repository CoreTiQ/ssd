'use client';

import { useState } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import DayCell from '@/components/DayCell';
import BookingModal from '@/components/BookingModal';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll()
  });

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const startOfMonth = moment(currentDate).startOf('month');
  const daysInMonth = currentDate.daysInMonth();

  if (isLoading) {
    return <div className="text-center py-8 text-white">جاري التحميل...</div>;
  }

  const onPreviousMonth = () => setCurrentDate(prev => moment(prev).subtract(1, 'month'));
  const onNextMonth = () => setCurrentDate(prev => moment(prev).add(1, 'month'));

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <div className="glass-container space-y-6">
        {/* رأس التقويم */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onPreviousMonth}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
          >
            الشهر السابق
          </button>

          <h2 className="text-2xl font-bold text-white">
            {currentDate.format('MMMM YYYY')}
          </h2>

          <button
            onClick={onNextMonth}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
          >
            الشهر التالي
          </button>
        </div>

        {/* أيام الأسبوع */}
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div key={day} className="text-center font-bold bg-white/5 p-3 rounded-lg text-white">
              {day}
            </div>
          ))}
        </div>

        {/* خلايا التقويم */}
        <div className="grid grid-cols-7 gap-2">
          {/* الأيام الفارغة في بداية الشهر */}
          {Array.from({ length: startOfMonth.day() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="bg-white/5 rounded-lg aspect-square" />
          ))}

          {/* أيام الشهر */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = moment(currentDate).date(i + 1).format('YYYY-MM-DD');
            const dayBookings = bookings.filter(b => b.date === date);

            return (
              <DayCell
                key={date}
                date={date}
                bookings={dayBookings}
                onClick={() => setSelectedDate(date)}
              />
            );
          })}
        </div>

        {/* نافذة الحجز */}
        {selectedDate && (
          <BookingModal
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </main>
  );
}