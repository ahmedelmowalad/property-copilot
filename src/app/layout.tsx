import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Property Copilot — AI Operations for UAE Property Management',
  description:
    'AI-powered operations assistant for UAE residential real-estate management. Triage tenant requests, draft professional replies, and create maintenance tasks.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50 text-gray-900 antialiased`}>{children}</body>
    </html>
  )
}
