import ReportPage from '@/components/ReportPage';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ReportIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ReportPage />;
}