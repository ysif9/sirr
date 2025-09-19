"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import FollowUpModal from "./FollowUpModal"
import BlurText from "./BlurText"
import { Squircle } from "@squircle-js/react"

interface HeroProps {
  onNavigate: (page: string) => void
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { t } = useLanguage()
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)

  return (
    <>
      <section className="relative text-center py-16 md:py-24 px-4">
        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <BlurText
            text={t("heroTitle")}
            delay={150}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tighter mb-4"
          />
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">{t("heroSubtitle")}</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("report")}
              className="group w-full sm:w-auto transition-all duration-300 ease-out transform hover:scale-[1.03] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-slate-900"
            >
              <Squircle
                cornerRadius={12}
                cornerSmoothing={1}
                className="bg-white text-slate-900 font-bold py-4 px-10 text-lg shadow-lg group-hover:bg-gray-100 group-hover:shadow-xl group-hover:shadow-white/10 transition-all duration-300 ease-out"
              >
                {t("startNewReport")}
              </Squircle>
            </button>
            <button
              onClick={() => setIsFollowUpModalOpen(true)}
              className="group w-full sm:w-auto transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Squircle
                cornerRadius={12}
                cornerSmoothing={1}
                className="border border-white/30 group-hover:bg-white/10 group-hover:border-white/40 text-white font-semibold py-4 px-10 text-lg group-hover:shadow-lg group-hover:shadow-white/5 transition-all duration-300 ease-out"
              >
                {t("followUpOnReport")}
              </Squircle>
            </button>
          </div>
          <div className="mt-6 pt-8 max-w-2xl mx-auto text-xs text-gray-400">
            <p>
              {t("legalDisclaimer")}{" "}
              <button onClick={() => onNavigate("terms")} className="underline hover:text-white">
                {t("legalLink")}
              </button>
            </p>
          </div>
        </div>
      </section>
      {isFollowUpModalOpen && <FollowUpModal onClose={() => setIsFollowUpModalOpen(false)} />}
    </>
  )
}

export default Hero

