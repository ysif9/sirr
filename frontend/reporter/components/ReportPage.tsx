"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { CategoryCard } from "./CategoryCard"
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon"
import { ChildrenIcon } from "./icons/ChildrenIcon"
import { DomesticAbuseIcon } from "./icons/DomesticAbuseIcon"
import { InternetCrimeIcon } from "./icons/InternetCrimeIcon"
import { HumanTraffickingIcon } from "./icons/HumanTraffickingIcon"
import { SexualAssaultIcon } from "./icons/SexualAssaultIcon"
import { RestrainingOrderIcon } from "./icons/RestrainingOrderIcon"
import { StalkingIcon } from "./icons/StalkingIcon"
import { HateCrimesIcon } from "./icons/HateCrimesIcon"
import { BombIcon } from "./icons/BombIcon"
import { OrganizedCrimeIcon } from "./icons/OrganizedCrimeIcon"
import { WhistleblowerIcon } from "./icons/WhistleblowerIcon"
import { InternationalCrimesIcon } from "./icons/InternationalCrimesIcon"
import { TheftIcon } from "./icons/TheftIcon"
import { Squircle } from "@squircle-js/react"
import { SearchIcon } from "./icons/SearchIcon"

interface ReportPageProps {
  onNavigate: (page: string) => void
}

const ReportPage: React.FC<ReportPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { icon: ChildrenIcon, titleKey: "categoryChildrenTitle", subtitleKey: "categoryChildrenSubtitle" },
    { icon: DomesticAbuseIcon, titleKey: "categoryDomesticAbuseTitle", subtitleKey: "categoryDomesticAbuseSubtitle" },
    { icon: InternetCrimeIcon, titleKey: "categoryInternetCrimeTitle", subtitleKey: "categoryInternetCrimeSubtitle" },
    {
      icon: HumanTraffickingIcon,
      titleKey: "categoryHumanTraffickingTitle",
      subtitleKey: "categoryHumanTraffickingSubtitle",
    },
    { icon: SexualAssaultIcon, titleKey: "categorySexualAssaultTitle", subtitleKey: "categorySexualAssaultSubtitle" },
    {
      icon: RestrainingOrderIcon,
      titleKey: "categoryRestrainingOrdersTitle",
      subtitleKey: "categoryRestrainingOrdersSubtitle",
    },
    { icon: StalkingIcon, titleKey: "categoryStalkingTitle", subtitleKey: "categoryStalkingSubtitle" },
    { icon: HateCrimesIcon, titleKey: "categoryHateCrimesTitle", subtitleKey: "categoryHateCrimesSubtitle" },
    { icon: BombIcon, titleKey: "categoryBombThreatTitle", subtitleKey: "categoryBombThreatSubtitle" },
    {
      icon: OrganizedCrimeIcon,
      titleKey: "categoryOrganizedCrimeTitle",
      subtitleKey: "categoryOrganizedCrimeSubtitle",
    },
    { icon: WhistleblowerIcon, titleKey: "categoryWhistleblowerTitle", subtitleKey: "categoryWhistleblowerSubtitle" },
    {
      icon: InternationalCrimesIcon,
      titleKey: "categoryInternationalCrimesTitle",
      subtitleKey: "categoryInternationalCrimesSubtitle",
    },
    { icon: TheftIcon, titleKey: "categoryTheftTitle", subtitleKey: "categoryTheftSubtitle" },
  ] as const

  const filteredCategories = categories.filter((category) => {
    const title = t(category.titleKey).toLowerCase()
    const subtitle = t(category.subtitleKey).toLowerCase()
    const query = searchQuery.toLowerCase()
    return title.includes(query) || subtitle.includes(query)
  })

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

          <div className="mb-12 max-w-2xl mx-auto">
            <label htmlFor="category-search" className="sr-only">
              {t("searchCategoryPlaceholder")}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 rtl:pl-0 rtl:pr-4">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                id="category-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-2xl border-white/10 bg-white/5 py-3 pl-11 pr-4 rtl:pl-4 rtl:pr-11 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-white"
                placeholder={t("searchCategoryPlaceholder")}
              />
            </div>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => (
                <CategoryCard
                  key={index}
                  icon={category.icon}
                  title={t(category.titleKey)}
                  subtitle={t(category.subtitleKey)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400">
                {t("noCategoriesFound")} "{searchQuery}"
              </p>
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
