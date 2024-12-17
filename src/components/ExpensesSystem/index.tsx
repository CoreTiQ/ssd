'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';

export function ExpensesSystem() {
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => db.expenses.getAll()
  });

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="glass-container">
      <h1 className="text-2xl font-bold mb-6">إدارة المصروفات</h1>
      {/* المحتوى سيأتي هنا */}
    </div>
  );
}