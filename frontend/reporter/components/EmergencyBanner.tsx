"use client"

import type React from "react"
import { useTranslations } from "next-intl"

const EmergencyBanner: React.FC = () => {
  const t = useTranslations("EmergencyBanner")

  return (
    <div className="bg-red-600 text-white text-center p-4 text-xs md:text-sm font-semibold shadow-lg">
      <p>{t("notSubstitute")}</p>
      <p>
        {t("dialEmergency")}{" "}
        <a href="tel:122" className="underline font-bold">
          122
        </a>{" "}
        {t("immediately")}
      </p>
    </div>
  )
}

export default EmergencyBanner
