import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// This page only renders when the app is built statically (output: 'export')
// or during development. It redirects to the default locale.
export default function RootPage() {
  redirect(routing.defaultLocale);
}