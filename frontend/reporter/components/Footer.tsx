"use client"

import type React from "react"
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { GlobeIcon } from "./icons/GlobeIcon"
import { Squircle } from "@squircle-js/react"

interface FooterProps {
  onOpenFaq: () => void
}

const Footer: React.FC<FooterProps> = ({ onOpenFaq }) => {
  const t = useTranslations("Footer")
  const locale = useLocale()
  const pathname = usePathname();

  const otherLocale = locale === 'en' ? 'ar' : 'en';

  const links = [
    { text: t("accessibility") as string, href: "/info/accessibility" },
    { text: t("termsPrivacy") as string, href: "/info/terms" },
  ];

  return (
    <footer className="py-12 px-4 bg-gradient-to-t from-slate-900/30 to-transparent">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-all duration-300 ease-out transform hover:scale-[1.02]"
            >
              {link.text}
            </Link>
          ))}
           <button
              onClick={onOpenFaq}
              className="text-sm text-gray-400 hover:text-white transition-all duration-300 ease-out transform hover:scale-[1.02]"
            >
              {t("faqLink")}
            </button>
        </div>
        <div>
          <Link
            href={pathname}
            locale={otherLocale}
            className="group focus:outline-none transition-all duration-300 ease-out transform hover:scale-[1.02]"
            aria-label="Toggle language"
          >
            <Squircle
              cornerRadius={10}
              cornerSmoothing={1}
              className="flex items-center gap-2 text-gray-400 p-2 group-hover:text-white transition-all duration-300 ease-out group-hover:bg-white/5 group-hover:shadow-md group-hover:shadow-white/5"
            >
              <GlobeIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
              <span className="text-sm font-medium">{locale === "en" ? "English" : "العربية"}</span>
            </Squircle>
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer