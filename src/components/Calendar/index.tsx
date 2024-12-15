'use client';

import { useState } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import DayCell from './DayCell';
import DayDetailsModal from './DayDetailsModal';
import BookingModal from './BookingModal';
import { Button } from '../ui/Button';

// تهيئة اللغة العربية لمكتبة moment
moment.locale('ar', {
  months: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ],
  weekdays: [
    'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ]
});

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // جلب الحجوزات
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll(),
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // ثوابت التقويم
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const startOfMonth = moment(currentDate).startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  
  // حجوزات اليوم المحدد
  const selectedDateBookings = selectedDate 
    ? bookings.filter(b => b.date === selectedDate)
    : [];

  // حساب نسبة الإشغال
  const calculateOccupancyRate = () => {
    const monthBookings = bookings.filter(b => 
      moment(b.date).format('MM-YYYY') === currentDate.format('MM-YYYY')
    );
    const totalSlots = daysInMonth * 2; // صباحي ومسائي
    const occupiedSlots = monthBookings.reduce((sum, booking) => 
      sum + (booking.booking_type === 'full' ? 2 : 1), 0
    );
    return Math.round((occupiedSlots / totalSlots) * 100);
  };

  // حساب إجمالي الدخل
  const calculateTotalIncome = () => {
    return bookings
      .filter(b => moment(b.date).format('MM-YYYY') === currentDate.format('MM-YYYY'))
      .reduce((sum, b) => sum + b.price, 0)
      .toFixed(3);
  };

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="glass-container animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mx-auto mb-8"></div>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-container mb-16 sm:mb-20">
        {/* رأس التقويم والتنقل بين الشهور */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost"
            onClick={() => setCurrentDate(prev => moment(prev).subtract(1, 'month'))}
            className="sm:p-2"
          >
            <span className="hidden sm:inline">الشهر السابق</span>
            <span className="sm:hidden">السابق</span>
          </Button>

          <h2 className="title-large text-center">
            {currentDate.format('MMMM YYYY')}
          </h2>

          <Button
            variant="ghost"
            onClick={() => setCurrentDate(prev => moment(prev).add(1, 'month'))}
            className="sm:p-2"
          >
            <span className="hidden sm:inline">الشهر التالي</span>
            <span className="sm:hidden">التالي</span>
          </Button>
        </div>

        {/* أيام الأسبوع */}
        <div className="calendar-grid mb-4">
          {days.map(day => (
            <div key={day} className="calendar-header">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* شبكة التقويم */}
        <div className="calendar-grid">
          {/* الأيام الفارغة في بداية الشهر */}
          {Array.from({ length: startOfMonth.day() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="calendar-day opacity-50" />
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
                onClick={() => {
                  setSelectedDate(date);
                  setIsBookingModalOpen(false);
                }}
              />
            );
          })}

          {/* الأيام الفارغة في نهاية الشهر */}
          {Array.from({ 
            length: (42 - (startOfMonth.day() + daysInMonth)) 
          }).map((_, i) => (
            <div key={`empty-end-${i}`} className="calendar-day opacity-50" />
          ))}
        </div>

        {/* الإحصائيات */}
        <div className="stats-grid">
          <div className="glass-card">
            <div className="text-white/60 text-xs sm:text-sm">الحجوزات</div>
            <div className="stats-value">
              {bookings.filter(b => 
                moment(b.date).format('MM-YYYY') === currentDate.format('MM-YYYY')
              ).length}
            </div>
          </div>
          
          <div className="glass-card">
            <div className="text-white/60 text-xs sm:text-sm">الدخل</div>
            <div className="stats-value">
              {calculateTotalIncome()} د.ك
            </div>
          </div>

          <div className="glass-card sm:col-span-2 md:col-span-1">
            <div className="text-white/60 text-xs sm:text-sm">نسبة الإشغال</div>
            <div className="stats-value">
              {calculateOccupancyRate()}%
            </div>
          </div>
        </div>

        {/* النوافذ المنبثقة */}
        {selectedDate && !isBookingModalOpen && (
          <DayDetailsModal
            date={selectedDate}
            bookings={selectedDateBookings}
            onClose={() => setSelectedDate(null)}
            onAddBooking={() => setIsBookingModalOpen(true)}
          />
        )}

        {selectedDate && isBookingModalOpen && (
          <BookingModal
            date={selectedDate}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedDate(null);
            }}
          />
        )}
      </div>

      {/* شريط التنقل للموبايل */}
      <div className="mobile-nav md:hidden">
        <Button 
          variant="ghost" 
          onClick={() => {
            setCurrentDate(moment());
            setSelectedDate(null);
          }}
        >
          اليوم
        </Button>
        <Button 
          variant="primary"
          onClick={() => {
            setSelectedDate(moment().format('YYYY-MM-DD'));
            setIsBookingModalOpen(true);
          }}
        >
          حجز جديد
        </Button>
      </div>
    </>
  );
}