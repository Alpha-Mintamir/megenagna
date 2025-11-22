import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/components/LanguageProvider'

export const metadata: Metadata = {
  title: 'Megenagna - መገናኛ | Ethiopian Calendar Scheduler',
  description: 'Megenagna - The meeting place for Ethiopian teams. Schedule meetings using the Ethiopian calendar and find the best time for everyone.',
  keywords: ['Megenagna', 'መገናኛ', 'Ethiopian calendar', 'scheduler', 'availability', 'team scheduling', 'Ethiopia'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-support" content="enabled" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
