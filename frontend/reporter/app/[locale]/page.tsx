import LandingPage from '@/components/LandingPage';
import SplashScreen from '@/components/SplashScreen';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function IndexPage({ params }: Props) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Suspense fallback={<SplashScreen />}>
        <LandingPage />
      </Suspense>
    </div>
  );
}