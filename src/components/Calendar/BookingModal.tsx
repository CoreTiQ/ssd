'use client';

import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
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

  // جلب حجوزات اليوم المحدد
  const { data: existingBookings = [] } = useQuery({
    queryKey: ['bookings', date],
    queryFn: () => db.bookings.getByDate(date)
  });

  // التحقق من الحجوزات المتاحة
  const hasFullDay = existingBookings.some(b => b.booking_type === 'full');
  const hasMorning = existingBookings.some(b => b.booking_type === 'morning');
  const hasEvening = existingBookings.some(b => b.booking_type === 'evening');

  // تحديد الخيارات المتاحة للحجز
  const availableTypes = [
    { value: 'morning', label: 'صباحي', disabled: hasMorning || hasFullDay },
    { value: 'evening', label: 'مسائي', disabled: hasEvening || hasFullDay },
    { value: 'full', label: 'يوم كامل', disabled: hasMorning || hasEvening || hasFullDay }
  ].filter(type => !type.disabled);

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: () => db.bookings.create({
      client_name: form.client_name,
      date,
      booking_type: form.booking_type as 'morning' | 'evening' | 'full',
      price: Number(form.price),
      notes: form.notes
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('تم إضافة الحجز بنجاح');
      onClose();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إضافة الحجز');
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

          {availableTypes.length > 0 ? (
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
                  options={availableTypes}
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
          ) : (
            <div className="text-center py-8">
              <div className="text-white/60 mb-4">
                عذراً، هذا اليوم محجوز بالكامل
              </div>
              <Button variant="ghost" onClick={onClose}>
                إغلاق
              </Button>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}