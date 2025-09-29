//START OF i18n.ts
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'ar'];
 
export default getRequestConfig(async ({locale}) => {
  // FIX: Explicitly check for a missing or invalid locale.
  // This robustly handles the `string | undefined` type and narrows
  // it to `string` for the rest of the function.
  if (!locale || !locales.includes(locale)) {
    notFound();
  }
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
//END OF i18n.ts