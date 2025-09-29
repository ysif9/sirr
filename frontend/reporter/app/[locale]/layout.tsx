// FILE: app/[locale]/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: any // params must be awaited in Next.js 15
}) {
  // await the params proxy before accessing its properties
  const { locale } = await params

  // load messages for this locale (requires next-intl plugin / request config)
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
