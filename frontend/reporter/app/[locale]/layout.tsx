import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Suspense } from 'react';
import './styles.css';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { LoaderProvider } from '@/contexts/LoaderContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: 'Anonymous Crime Reporting',
  description: 'Safe and secure anonymous crime reporting platform',
  generator: 'v0.app'
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  // Await params before accessing its properties
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
        <LoaderProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Analytics />
          </NextIntlClientProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}