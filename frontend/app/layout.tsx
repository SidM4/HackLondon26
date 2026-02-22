import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import './globals.css'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Meridian | AI-Powered Planning Approval Predictions',
  description:
    'Predict your renovation approval probability with AI. Backed by thousands of historical planning decisions, get instant insights and boost your chances.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="min-h-screen antialiased font-[var(--font-roboto)] bg-white text-slate-blue overflow-x-hidden">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
