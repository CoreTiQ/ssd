/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // تكوين الصور
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // تكوين i18n للغة العربية
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
    localeDetection: false,
  },

  // تحسينات الأداء
  experimental: {
    optimizeFonts: true,
    scrollRestoration: true,
    legacyBrowsers: false,
  },

  // تكوين الامان
  poweredByHeader: false,
  compress: true,

  // إعدادات التطوير
  webpack: (config, { dev, isServer }) => {
    // تحسينات webpack
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      });
    }

    return config;
  },

  // تكوين الـ headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // تكوين إعادة التوجيه
  async redirects() {
    return [];
  },

  // تكوين إعادة الكتابة
  async rewrites() {
    return [];
  }
};

// تصدير التكوين مع دعم PWA
module.exports = withPWA(nextConfig);