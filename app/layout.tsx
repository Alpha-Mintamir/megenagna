import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
