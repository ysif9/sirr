"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { CategoryCard } from "./CategoryCard"
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon"
import { Squircle } from "@squircle-js/react"

interface ReportPageProps {
  onNavigate: (page: string) => void
}

const crimeCategories = [
  {
    title: "Violence & Threats Against a Person",
    subtitle: "For acts involving physical harm, the threat of harm, or offenses against a person's liberty.",
  },
  {
    title: "Theft, Burglary & Property Damage",
    subtitle: "For acts involving stolen property or damage to property where no direct force against a person was used.",
  },
  {
    title: "Vehicle-Related Crime",
    subtitle: "For crimes specifically involving motor vehicles.",
  },
  {
    title: "Fraud, Scams & Financial Crime",
    subtitle: "For acts involving deception for financial gain or to compromise personal information.",
  },
  {
    title: "Cybercrime",
    subtitle: "For criminal activity that involves a computer, computer network, or a networked device.",
  },
  {
    title: "Drugs, Weapons & Public Order",
    subtitle: "For offenses related to controlled substances, illegal weapons, and public decency.",
  },
  {
    title: "Environmental Crimes",
    subtitle: "For offenses that harm the natural environment.",
  },
]

const concernCategories = [
  {
    title: "Suspicious Activity",
    subtitle: "For behavior that is not clearly a crime but feels wrong or may be a precursor to a crime.",
  },
  {
    title: "Traffic & Road Safety",
    subtitle: "For issues related to driving and public roads that do not involve a crime against a person.",
  },
  {
    title: "Public Safety & Community Concerns",
    subtitle:
      "For general hazards or non-criminal issues affecting the community. These are often referred to as quality of life or neighborhood disorder issues.",
  },
]

const ReportPage: React.FC<ReportPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage()
  const [view, setView] = useState("main")

  const handleBack = () => {
    if (view === "crime" || view === "concern") {
      setView("main")
    } else {
      onNavigate("landing")
    }
  }

  return (
    <div className="min-h-screen flex flex-col animate-fadeIn">
      <header className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center">
          {/* FIX: The 'as' prop is deprecated. Replaced Squircle with a button wrapping a Squircle for semantic correctness and to resolve type errors. */}
          <button onClick={handleBack} className="group mr-2 focus:outline-none" aria-label={t("backButton")}>
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

          {view === "main" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <CategoryCard
                title="Report a Crime"
                subtitle="For incidents where you believe a law has been broken."
                onClick={() => setView("crime")}
              />
              <CategoryCard
                title="Report a Concern or Non-Criminal Incident"
                subtitle="For public safety issues, suspicious activity, or community alerts."
                onClick={() => setView("concern")}
              />
            </div>
          )}

          {view === "crime" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {crimeCategories.map((category) => (
                <CategoryCard key={category.title} title={category.title} subtitle={category.subtitle} />
              ))}
            </div>
          )}

          {view === "concern" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {concernCategories.map((category) => (
                <CategoryCard key={category.title} title={category.title} subtitle={category.subtitle} />
              ))}
            </div>
          )}
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
