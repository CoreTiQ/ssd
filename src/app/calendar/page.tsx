'use client';

import { useState } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

// مكون خلية اليوم
function DayCell({ date, bookings }: { date: string; bookings: any[] }) {
  const hasFullDay = bookings.some(b => b.booking_type === 'full');
  const hasMorning = bookings.some(b => b.booking_type === 'morning');
  const hasEvening = bookings.some(b => b.booking_type === 'evening');
  const dayNumber = moment(date).date();
  const isToday = moment(date).isSame(moment(), 'day');

  return (
    <div className={`
      relative aspect-square p-2 md:p-3 rounded-xl border
      ${isToday ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 bg-white/5'}
      ${hasFullDay ? 'bg-red-500/10' : ''}
    `}>
      {/* رقم اليوم */}
      <span className="text-xs md:text-sm text-white/80">{dayNumber}</span>

      {/* حالة الحجز */}
      {bookings.length > 0 && (
        <div className="absolute inset-1 flex flex-col justify-center items-center">
          {hasFullDay ? (
            <div className="text-[8px] md:text-xs text-red-400 font-medium text-center">
              محجوز كامل
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 items-center">
              {hasMorning && (
                <div className="text-[8px] md:text-xs text-blue-400 font-medium">
                  صباحي
                </div>
              )}
              {hasEvening && (
                <div className="text-[8px] md:text-xs text-orange-400 font-medium">
                  مسائي
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(moment());
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll()
  });

  const prevMonth = () => setCurrentDate(prev => moment(prev).subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(prev => moment(prev).add(1, 'month'));
  const startOfMonth = moment(currentDate).startOf('month');
  const daysInMonth = currentDate.daysInMonth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-white/60">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="glass-container space-y-6">
        {/* رأس التقويم */}
        <div className="flex items-center justify-between">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ChevronRightIcon className="w-5 h-5 text-white/80" />
          </button>

          <h2 className="text-lg md:text-xl font-bold text-white">
            {currentDate.format('MMMM YYYY')}
          </h2>

          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* دليل الألوان */}
        <div className="flex flex-wrap gap-2 justify-center text-xs md:text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white/5 border border-white/10 rounded"></div>
            <span className="text-white/60">متاح</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500/20 border border-blue-500/30 rounded"></div>
            <span className="text-blue-400">صباحي</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500/20 border border-orange-500/30 rounded"></div>
            <span className="text-orange-400">مسائي</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
            <span className="text-red-400">يوم كامل</span>
          </div>
        </div>

        {/* أيام الأسبوع */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map(day => (
            <div 
              key={day} 
              className="text-center text-[10px] md:text-sm font-medium text-white/70 p-1 md:p-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* أيام الشهر */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* الأيام الفارغة في بداية الشهر */}
          {Array.from({ length: startOfMonth.day() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="aspect-square" />
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
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}