import InfoPage from '@/components/InfoPage';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function InfoSlugPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (slug !== 'accessibility' && slug !== 'terms') {
    return null; // Or a notFound() call
  }

  return <InfoPage pageKey={slug} />;
}