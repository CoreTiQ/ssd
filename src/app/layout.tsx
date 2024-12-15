import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import localFont from 'next/font/local';

const font = localFont({
  src: './fonts/Cairo-Arabic-Variable.ttf',
  variable: '--font-cairo'
});

export const metadata = {
  title: 'نظام حجز الفيلا',
  description: 'نظام إدارة حجوزات وإيجارات الفيلا اليومية',
  viewport: 'width=device-width, initial-scale=1',
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
          {children}
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