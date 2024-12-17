import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import localFont from 'next/font/local';
import Navigation from '@/components/Navigation';

const font = localFont({
  src: './fonts/Cairo-Arabic-Variable.ttf',
  variable: '--font-cairo'
});

// فصل إعدادات viewport عن metadata
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'نظام حجز الفيلا',
  description: 'نظام إدارة حجوزات وإيجارات الفيلا اليومية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={font.className}>
      <body className="bg-gradient">
        <Providers>
          <main className="pb-20">
            {children}
          </main>
          <Navigation />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '10px',
              },
            }} 
          />
        </Providers>
      </body>
    </html>
  );
}