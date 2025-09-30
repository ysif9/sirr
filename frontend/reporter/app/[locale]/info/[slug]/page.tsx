'use client';

import InfoPage from '@/components/InfoPage';
import AnonymityGuide from '@/components/AnonymityGuide';
import { useRouter } from '@/i18n/navigation';
import { useParams, notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';

export default function InfoSlugPageClient() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  if (slug === 'accessibility' || slug === 'terms') {
    return <InfoPage pageKey={slug} />;
  }

  if (slug === 'anonymity') {
    return (
      <div className="min-h-screen flex flex-col animate-fadeIn bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <header className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto flex items-center">
            <button
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-2 hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </header>
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
          <AnonymityGuide />
        </main>
      </div>
    );
  }

  // Let the [...rest] route handle the 404 page
  notFound();
}