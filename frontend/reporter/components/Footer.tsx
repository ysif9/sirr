//START OF components\Footer.tsx
"use client"

import type React from "react"
import { useTranslations, useLocale } from "next-intl"; // FIX: Correct import path
import { GlobeIcon } from "./icons/GlobeIcon"
import { Squircle } from "@squircle-js/react"
import { useRouter } from "next/navigation"

interface FooterProps {
  onNavigate: (page: string) => void
  onOpenFaq: () => void
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenFaq }) => {
  const t = useTranslations("Footer")
  const locale = useLocale()
  const router = useRouter()

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    
    // Perform navigation to change the locale
    router.push(`/${newLocale}`);
  }

  const links = [
    { text: t("accessibility") as string, action: () => onNavigate("accessibility") },
    { text: t("termsPrivacy") as string, action: () => onNavigate("terms") },
    { text: t("faqLink") as string, action: onOpenFaq },
  ]

  return (
    <footer className="py-12 px-4 bg-gradient-to-t from-slate-900/30 to-transparent">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((link, index) => (
            <button
              key={index}
              onClick={link.action}
              className="text-sm text-gray-400 hover:text-white transition-all duration-300 ease-out transform hover:scale-[1.02]"
            >
              {link.text}
            </button>
          ))}
        </div>
        <div>
          <button
            onClick={toggleLanguage}
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
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
//END OF components\Footer.tsx