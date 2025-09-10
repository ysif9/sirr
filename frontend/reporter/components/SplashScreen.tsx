"use client"

import type React from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { ShieldCheckIcon } from "./icons/ShieldCheckIcon"

const SplashScreen: React.FC = () => {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center h-screen animate-fadeIn p-4 bg-[#0F2230]">
      <ShieldCheckIcon className="w-24 h-24 md:w-32 md:h-32 text-gray-400 mb-6" />
      <h1 className="text-2xl md:text-3xl font-bold text-center text-[#F5F5F5] tracking-tight">{t("splashTitle")}</h1>
      <p className="text-lg md:text-xl text-gray-300 mt-2 font-light">{t("splashSubtitle")}</p>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  )
}

export default SplashScreen
