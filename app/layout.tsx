import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Password Checker',
  description: 'A simple password strength checker',
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
