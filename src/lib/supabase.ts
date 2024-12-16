import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tlpwjfzkvbafpvoowakq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscHdqZnprdmJhZnB2b293YWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNzU4OTUsImV4cCI6MjA0OTc1MTg5NX0.aRDbF8UVRVli_uLQXlc0nS9FgLyvretqw1xu8YAjHGo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Booking = {
  id: number;
  client_name: string;
  date: string;
  booking_type: 'morning' | 'evening' | 'full';
  price: number;
  notes?: string;
  phone?: string;
  created_at: string;
  is_free: boolean;
};

// Database functions
export const db = {
  bookings: {
    async getAll() {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },

    async create(booking: Omit<Booking, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...booking,
          price: booking.is_free ? 0 : booking.price,
          phone: booking.phone || null // تعيين القيمة الافتراضية لرقم الهاتف
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
      
    async getByDate(date: string) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', date)
        .order('booking_type', { ascending: true }); // ترتيب حسب نوع الحجز

      if (error) throw error;
      return data as Booking[];
    },

    async delete(id: number) {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // دالة جديدة للبحث عن الحجوزات حسب رقم الهاتف
    async getByPhone(phone: string) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('phone', phone)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    }
  }
};

// Helper function to check if a date slot is available
export async function isSlotAvailable(date: string, type: 'morning' | 'evening' | 'full') {
  const { data, error } = await supabase
    .from('bookings')
    .select('*') // تحديث لجلب كل البيانات
    .eq('date', date);

  if (error) throw error;

  if (data.length === 0) return true;
  
  const hasFullDay = data.some(b => b.booking_type === 'full');
  const hasMorning = data.some(b => b.booking_type === 'morning');
  const hasEvening = data.some(b => b.booking_type === 'evening');

  if (hasFullDay) return false;

  if (type === 'full') return !hasMorning && !hasEvening;

  return type === 'morning' ? !hasMorning : !hasEvening;
}

// دالة جديدة للتحقق من الحجوزات المستقبلية
export async function getFutureBookings() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as Booking[];
}

// دالة جديدة للحصول على إحصائيات الحجوزات
export async function getBookingStats(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  const stats = {
    totalBookings: data.length,
    totalIncome: data.reduce((sum, booking) => sum + booking.price, 0),
    freeBookings: data.filter(b => b.is_free).length,
    morningBookings: data.filter(b => b.booking_type === 'morning').length,
    eveningBookings: data.filter(b => b.booking_type === 'evening').length,
    fullDayBookings: data.filter(b => b.booking_type === 'full').length
  };

  return stats;
}