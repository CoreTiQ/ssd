import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Booking = {
  id: number;
  client_name: string;
  date: string;
  booking_type: 'morning' | 'evening' | 'full';
  price: number;
  notes?: string;
  created_at: string;
};

export const bookingsApi = {
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
      .insert([booking])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};