import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Renovation Optimiser',
  description:
    'Planning approval probability and ROI for your renovation. Evidence-based decisions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="min-h-screen antialiased font-sans bg-neutral-50 text-neutral-900">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
