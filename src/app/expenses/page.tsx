'use client';

import { ExpensesSystem } from '@/components/ExpensesSystem';

export default function ExpensesPage() {
  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">إدارة المصروفات</h1>
      </header>
      <ExpensesSystem />
    </main>
  );
}