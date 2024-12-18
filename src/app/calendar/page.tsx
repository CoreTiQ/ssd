'use client';

import { useState } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

function DayCell({ date, bookings }: { date: string; bookings: any[] }) {
  const hasFullDay = bookings.some(b => b.booking_type === 'full');
  const hasMorning = bookings.some(b => b.booking_type === 'morning');
  const hasEvening = bookings.some(b => b.booking_type === 'evening');
  const dayNumber = moment(date).date();
  const isToday = moment(date).isSame(moment(), 'day');
  const isPast = moment(date).isBefore(moment(), 'day');

  return (
    <div className={`
      relative rounded-2xl p-3
      ${isToday ? 'ring-2 ring-blue-500' : ''}
      ${isPast ? 'opacity-50' : ''}
      ${hasFullDay ? 'bg-gradient-to-br from-red-950/50 to-red-900/30' : 
        (hasMorning && hasEvening) ? 'bg-gradient-to-br from-purple-950/50 to-purple-900/30' :
        hasMorning ? 'bg-gradient-to-br from-blue-950/50 to-blue-900/30' :
        hasEvening ? 'bg-gradient-to-br from-orange-950/50 to-orange-900/30' : 
        'bg-slate-800/40'}
      hover:bg-slate-700/40 transition-all duration-300
      min-h-[80px] md:min-h-[100px]
      flex flex-col justify-between
      border border-white/5
    `}>
      {/* رقم اليوم */}
      <div className="text-lg md:text-xl font-medium text-white/90">
        {dayNumber}
      </div>

      {/* حالة الحجز */}
      {bookings.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          {hasFullDay ? (
            <div className="text-xs text-red-400/90 font-medium bg-red-500/10 px-2 py-0.5 rounded-full text-center">
              يوم كامل
            </div>
          ) : (
            <>
              {hasMorning && (
                <div className="text-xs text-blue-400/90 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full text-center">
                  صباحي
                </div>
              )}
              {hasEvening && (
                <div className="text-xs text-orange-400/90 font-medium bg-orange-500/10 px-2 py-0.5 rounded-full text-center">
                  مسائي
                </div>
              )}
            </>
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

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-white/60">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
        {/* راس التقويم */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setCurrentDate(prev => moment(prev).subtract(1, 'month'))}>
            <ChevronRightIcon className="w-6 h-6 text-white/70 hover:text-white/90" />
          </button>
          <h2 className="text-2xl font-bold text-white">
            {currentDate.format('MMMM YYYY')}
          </h2>
          <button onClick={() => setCurrentDate(prev => moment(prev).add(1, 'month'))}>
            <ChevronLeftIcon className="w-6 h-6 text-white/70 hover:text-white/90" />
          </button>
        </div>

        {/* دليل الرموز */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <span>متاح</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <div className="w-3 h-3 rounded-full bg-blue-500/20"></div>
            <span>صباحي</span>
          </div>
          <div className="flex items-center gap-2 text-orange-400 text-sm">
            <div className="w-3 h-3 rounded-full bg-orange-500/20"></div>
            <span>مسائي</span>
          </div>
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
            <span>يوم كامل</span>
          </div>
        </div>

        {/* ايام الاسبوع */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {days.map(day => (
            <div key={day} className="text-center text-sm font-medium text-white/70 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* خلايا التقويم */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: moment(currentDate).startOf('month').day() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: currentDate.daysInMonth() }).map((_, i) => {
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