import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import { Providers } from '@/components/Providers'
import { THEME_STORAGE_KEY } from '@/lib/theme'

import './globals.css'

const anuphan = localFont({
  variable: '--font-geist-sans',
  src: [
    { path: '../../public/fonts/Anuphan-Thin.ttf', weight: '100', style: 'normal' },
    { path: '../../public/fonts/Anuphan-ExtraLight.ttf', weight: '200', style: 'normal' },
    { path: '../../public/fonts/Anuphan-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Anuphan-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Anuphan-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Anuphan-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/Anuphan-Bold.ttf', weight: '700', style: 'normal' },
  ],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SMtrack Dashboard',
  description: 'IoT telemetry monitoring dashboard',
}

/** stamp ธีมลง <html> ก่อน paint เพื่อไม่ให้จอกระพริบตอนโหลด */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var mode = stored === 'light' || stored === 'dark' ? stored : 'system';
    var resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${anuphan.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-base-200 font-sans text-base-content antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
