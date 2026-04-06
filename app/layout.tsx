import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
            <a href="/" className="text-xl font-bold text-blue-400">
              🚀 StartupValidator
              </a>
            <a href="/ideas" className="text-sm text-gray-400 hover:text-white transition">
              Dashboard →
            </a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}