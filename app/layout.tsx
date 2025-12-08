import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/layout/BottomNav'
import Footer from '@/components/layout/Footer'
import ClientOfflineDetector from '@/components/ui/ClientOfflineDetector'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  title: 'Network Buddy - Smart Business Card Scanner',
  description: 'Scan business cards, research contacts, and get AI-powered conversation starters instantly. Perfect for networking events.',
  keywords: ['business card scanner', 'networking', 'AI', 'contact management', 'CRM'],
  authors: [{ name: 'Network Buddy' }],
  applicationName: 'Network Buddy',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Network Buddy',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Network Buddy" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientOfflineDetector />
        {children}
        <Footer />
        <BottomNav />
      </body>
    </html>
  )
}
