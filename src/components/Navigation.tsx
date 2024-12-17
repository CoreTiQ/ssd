'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition
          ${pathname === '/' ? 'text-white/90' : 'text-white/60 hover:text-white/90'}`}
      >
        <HomeIcon className="w-6 h-6" />
        <span className="text-xs">الرئيسية</span>
      </Link>

      <Link
        href="/calendar"
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition
          ${pathname === '/calendar' ? 'text-white/90' : 'text-white/60 hover:text-white/90'}`}
      >
        <CalendarDaysIcon className="w-6 h-6" />
        <span className="text-xs">التقويم</span>
      </Link>

      <Link
        href="/expenses"
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition
          ${pathname === '/expenses' ? 'text-white/90' : 'text-white/60 hover:text-white/90'}`}
      >
        <BanknotesIcon className="w-6 h-6" />
        <span className="text-xs">المصروفات</span>
      </Link>
      
      <Link
        href="/stats"
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition
          ${pathname === '/stats' ? 'text-white/90' : 'text-white/60 hover:text-white/90'}`}
      >
        <ChartBarIcon className="w-6 h-6" />
        <span className="text-xs">الإحصائيات</span>
      </Link>
    </nav>
  );
}