"use client"

import type React from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { CategoryCard } from "./CategoryCard"
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon"
import { Squircle } from "@squircle-js/react"

interface ReportPageProps {
  onNavigate: (page: string) => void
}

const ReportPage: React.FC<ReportPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col animate-fadeIn">
      <header className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center">
          {/* FIX: The 'as' prop is deprecated. Replaced Squircle with a button wrapping a Squircle for semantic correctness and to resolve type errors. */}
          <button
            onClick={() => onNavigate("landing")}
            className="group mr-2 focus:outline-none"
            aria-label={t("backButton")}
          >
            <Squircle
              cornerRadius={10}
              cornerSmoothing={1}
              className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors p-2 group-hover:bg-gray-500 group-hover:bg-opacity-20"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>{t("backButton")}</span>
            </Squircle>
          </button>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">{t("reportPageTitle")}</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t("reportPageSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <CategoryCard
              title="Report a Crime"
              subtitle="For incidents where you believe a law has been broken."
            />
            <CategoryCard
              title="Report a Concern or Non-Criminal Incident"
              subtitle="For public safety issues, suspicious activity, or community alerts."
            />
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default ReportPage
