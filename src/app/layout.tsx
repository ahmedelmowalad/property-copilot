import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HomeFlow — Real Estate Operations Platform',
  description:
    'HomeFlow connects WhatsApp, phone calls, and your entire real estate operation in one AI-powered platform. Manage properties, tenants, maintenance, and communications for UAE residential real estate.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50 text-gray-900 antialiased`}>{children}</body>
    </html>
  )
}
