import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Rocket, LayoutDashboard } from 'lucide-react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Startup Validator',
  description: 'Validate your startup idea with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-blue-400 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              StartupValidator
            </a>
            <a href="/ideas" className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
        <SpeedInsights />
      </body>
    </html>
  )
}