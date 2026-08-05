import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import GoogleAnalytics from '@/components/shared/GoogleAnalytics'
import './globals.css'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'DBSN Digital Ecosystem',
  description: 'Solusi Energi Terbarukan untuk Masa Depan Indonesia',
  metadataBase: new URL('https://dayaberkah.id'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    locale: 'id_ID',
    siteName: 'DBSN Dayaberkah.id',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GSC_VERIFICATION} />
        )}
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-700 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <GoogleAnalytics />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
