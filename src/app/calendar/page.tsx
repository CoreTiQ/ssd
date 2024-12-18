'use client';

import { useState, useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/ar';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

moment.locale('ar');

interface DayCellProps {
  date: string;
  bookings: any[];
  isCurrentMonth: boolean;
}

function DayCell({ date, bookings, isCurrentMonth }: DayCellProps) {
  const hasFullDay = bookings.some(b => b.booking_type === 'full');
  const hasMorning = bookings.some(b => b.booking_type === 'morning');
  const hasEvening = bookings.some(b => b.booking_type === 'evening');
  const dayNumber = moment(date).date();
  const isToday = moment(date).isSame(moment(), 'day');
  const isPast = moment(date).isBefore(moment(), 'day');

  return (
    <div 
      className={`
        relative aspect-square
        ${isToday ? 'ring-1 ring-blue-500' : ''}
        ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
        ${isPast ? 'opacity-60' : ''}
        flex flex-col items-center
        rounded-lg overflow-hidden
        bg-slate-800/40
        hover:bg-slate-700/40
        transition-all duration-200
        select-none
      `}
    >
      {/* رقم اليوم */}
      <div className="p-1.5 text-center w-full">
        <span className="text-sm text-white/80 font-medium">{dayNumber}</span>
      </div>

      {/* نقاط الحجز */}
      {bookings.length > 0 && (
        <div className="absolute bottom-2">
          {hasFullDay ? (
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow shadow-red-500/50 animate-pulse" />
          ) : (
            <div className="flex gap-1.5">
              {hasMorning && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow shadow-blue-500/50" />
              )}
              {hasEvening && (
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow shadow-orange-500/50" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CalendarHeaderProps {
  currentDate: moment.Moment;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function CalendarHeader({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <button 
        onClick={onPrevMonth}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <ChevronRightIcon className="w-5 h-5 text-white/70" />
      </button>
      <h2 className="text-lg font-semibold text-white">
        {currentDate.format('MMMM YYYY')}
      </h2>
      <button 
        onClick={onNextMonth}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5 text-white/70" />
      </button>
    </div>
  );
}

function CalendarLegend() {
  return (
    <div className="flex items-center justify-center gap-4 mb-4 text-[10px]">
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
        <span className="text-red-400">يوم كامل</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
        <span className="text-blue-400">صباحي</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div>
        <span className="text-orange-400">مسائي</span>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(moment());
  const shortDays = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

  const { data: bookings = [], isLoading } = useQuery({
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

  const calendarDays = useMemo(() => {
    const startOfMonth = moment(currentDate).startOf('month');
    const endOfMonth = moment(currentDate).endOf('month');
    const startDay = startOfMonth.day();
    const daysInMonth = currentDate.daysInMonth();

    return Array.from({ length: 42 }, (_, i) => {
      const date = moment(startOfMonth).add(i - startDay, 'days');
      return {
        date: date.format('YYYY-MM-DD'),
        isCurrentMonth: date.isBetween(startOfMonth.subtract(1, 'day'), endOfMonth.add(1, 'day')),
        bookings: bookings.filter(b => b.date === date.format('YYYY-MM-DD'))
      };
    });
  }, [currentDate, bookings]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-white/60">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-2 py-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-xl">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={() => setCurrentDate(prev => moment(prev).subtract(1, 'month'))}
          onNextMonth={() => setCurrentDate(prev => moment(prev).add(1, 'month'))}
        />
        
        <CalendarLegend />

        {/* أيام الأسبوع */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {shortDays.map(day => (
            <div 
              key={day} 
              className="text-center text-[10px] font-medium text-white/70 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* أيام الشهر */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <DayCell
              key={`${day.date}-${index}`}
              date={day.date}
              bookings={day.bookings}
              isCurrentMonth={day.isCurrentMonth}
            />
          ))}
        </div>
      </div>
    </div>
  );
}