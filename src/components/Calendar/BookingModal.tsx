'use client';

import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface BookingModalProps {
 date: string;
 onClose: () => void;
}

export default function BookingModal({ date, onClose }: BookingModalProps) {
 const [form, setForm] = useState({
   client_name: '',
   booking_type: 'morning',
   price: '',
   notes: ''
 });

 const queryClient = useQueryClient();

 // التحقق من الحجوزات المتاحة
 const checkExistingBookings = async () => {
   const { data: existingBookings } = await supabase
     .from('bookings')
     .select('*')
     .eq('date', date);

   if (existingBookings && existingBookings.length > 0) {
     const hasFullDay = existingBookings.some(b => b.booking_type === 'full');
     const hasMorning = existingBookings.some(b => b.booking_type === 'morning');
     const hasEvening = existingBookings.some(b => b.booking_type === 'evening');

     // التحقق من نوع الحجز المطلوب إضافته
     if (hasFullDay) {
       throw new Error('هذا اليوم محجوز بالكامل');
     }

     if (form.booking_type === 'full' && (hasMorning || hasEvening)) {
       throw new Error('لا يمكن إضافة حجز يوم كامل، يوجد حجز جزئي');
     }

     if (form.booking_type === 'morning' && hasMorning) {
       throw new Error('الفترة الصباحية محجوزة مسبقاً');
     }

     if (form.booking_type === 'evening' && hasEvening) {
       throw new Error('الفترة المسائية محجوزة مسبقاً');
     }
   }

   return true;
 };

 const { mutate, isLoading } = useMutation({
   mutationFn: async () => {
     // التحقق من الحجوزات أولاً
     await checkExistingBookings();

     // إضافة الحجز إذا كان متاحاً
     const { data, error } = await supabase
       .from('bookings')
       .insert([{
         client_name: form.client_name,
         date,
         booking_type: form.booking_type,
         price: Number(form.price),
         notes: form.notes
       }])
       .select()
       .single();

     if (error) throw error;
     return data;
   },
   onSuccess: () => {
     queryClient.invalidateQueries(['bookings']);
     toast.success('تم إضافة الحجز بنجاح');
     onClose();
   },
   onError: (error: any) => {
     toast.error(error.message || 'حدث خطأ أثناء إضافة الحجز');
   }
 });

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   
   if (!form.client_name.trim()) {
     toast.error('الرجاء إدخال اسم العميل');
     return;
   }

   if (!form.price || Number(form.price) <= 0) {
     toast.error('الرجاء إدخال سعر صحيح');
     return;
   }

   mutate();
 };

 return (
   <Dialog open={true} onClose={onClose} className="relative z-50">
     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
     
     <div className="fixed inset-0 flex items-center justify-center p-4">
       <Dialog.Panel className="modal-content">
         <Dialog.Title className="text-xl font-bold text-white mb-6">
           إضافة حجز جديد
         </Dialog.Title>

         <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-white/80 mb-1">
               اسم العميل
             </label>
             <Input
               type="text"
               value={form.client_name}
               onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
               placeholder="أدخل اسم العميل"
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-white/80 mb-1">
               نوع الحجز
             </label>
             <Select
               value={form.booking_type}
               onChange={e => setForm(f => ({ ...f, booking_type: e.target.value }))}
               options={[
                 { value: 'morning', label: 'صباحي' },
                 { value: 'evening', label: 'مسائي' },
                 { value: 'full', label: 'يوم كامل' }
               ]}
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-white/80 mb-1">
               السعر (د.ك)
             </label>
             <Input
               type="number"
               step="0.001"
               value={form.price}
               onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
               placeholder="0.000"
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-white/80 mb-1">
               ملاحظات
             </label>
             <Input
               type="text"
               value={form.notes}
               onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
               placeholder="أضف أي ملاحظات إضافية"
             />
           </div>

           <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
             <Button variant="ghost" onClick={onClose}>
               إلغاء
             </Button>
             <Button type="submit" isLoading={isLoading}>
               حفظ الحجز
             </Button>
           </div>
         </form>
       </Dialog.Panel>
     </div>
   </Dialog>
 );
}