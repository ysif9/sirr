// FILE: app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
// 1. Import the LanguageProvider here
import { LanguageProvider } from "@/contexts/LanguageContext"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Anonymous Crime Reporting",
  description: "Safe and secure anonymous crime reporting platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
        {/* 2. Wrap your entire application content with the provider */}
        <LanguageProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}