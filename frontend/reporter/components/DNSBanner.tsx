"use client"

import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export default function DNSBanner() {
  const t = useTranslations("DNSBanner")

  return (
    <div className="dark bg-sky-900/40 border-t border-b border-sky-400/20 px-4 py-3 text-center">
      <Link href="/info/anonymity" className="group inline-flex items-center justify-center text-sm text-sky-200 hover:text-white transition-colors">
        <ShieldCheckIcon
          className="me-2 h-5 w-5 text-sky-400 transition-transform group-hover:scale-110"
          aria-hidden="true"
        />
        <span className="font-semibold me-1">{t("safetyFirst")}</span>
        <span className="hidden sm:inline">{t("learnAnonymity")}</span>
        <span className="sm:hidden">{t("viewGuide")}</span>
        <ArrowRightIcon
          className="ms-2 inline-flex opacity-70 transition-transform group-hover:translate-x-0.5"
          size={16}
          aria-hidden="true"
        />
      </Link>
    </div>
  )
}
