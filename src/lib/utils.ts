import { Booking } from './supabase';
import moment from 'moment';

export function calculateStats(bookings: Booking[]) {
  const totalIncome = bookings.reduce((sum, booking) => sum + booking.price, 0);
  const totalBookings = bookings.length;
  
  const daysInMonth = moment().daysInMonth();
  const totalSlots = daysInMonth * 2; // morning and evening slots
  const occupiedSlots = bookings.reduce(
    (sum, booking) => sum + (booking.booking_type === 'full' ? 2 : 1),
    0
  );
  const occupancyRate = (occupiedSlots / totalSlots) * 100;

  // Calculate trends (mock data - you can implement real comparison)
  const trends = {
    incomeTrend: { value: 12.5, isPositive: true },
    bookingsTrend: { value: 8.3, isPositive: true },
    occupancyTrend: { value: 5.2, isPositive: true }
  };

  return {
    totalIncome,
    totalBookings,
    occupancyRate,
    ...trends
  };
}