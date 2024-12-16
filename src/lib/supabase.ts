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
 created_at: string;
 is_free: boolean; // إضافة حقل الحجز المجاني
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
         price: booking.is_free ? 0 : booking.price // التأكد من أن السعر 0 إذا كان الحجز مجانياً
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
       .eq('date', date);

     if (error) throw error;
     return data as Booking[];
   },

   async delete(id: number) {
     const { error } = await supabase
       .from('bookings')
       .delete()
       .eq('id', id);

     if (error) throw error;
   }
 }
};

// Helper function to check if a date slot is available
export async function isSlotAvailable(date: string, type: 'morning' | 'evening' | 'full') {
 const { data, error } = await supabase
   .from('bookings')
   .select('booking_type')
   .eq('date', date);

 if (error) throw error;

 if (data.length === 0) return true;
 
 // التحقق من الحجوزات الموجودة
 const hasFullDay = data.some(b => b.booking_type === 'full');
 const hasMorning = data.some(b => b.booking_type === 'morning');
 const hasEvening = data.some(b => b.booking_type === 'evening');

 // إذا كان هناك حجز ليوم كامل، لا يمكن إضافة أي حجز
 if (hasFullDay) return false;

 // إذا كان الحجز المطلوب ليوم كامل، يجب ألا يكون هناك أي حجوزات أخرى
 if (type === 'full') return !hasMorning && !hasEvening;

 // التحقق من نوع الحجز المطلوب
 return type === 'morning' ? !hasMorning : !hasEvening;
}