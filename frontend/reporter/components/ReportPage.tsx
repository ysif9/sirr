"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "../contexts/LanguageContext"
import { CategoryCard } from "./CategoryCard"
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon"
import { Squircle } from "@squircle-js/react"
import { getReportTypes, getCategoriesForReportType, getFormsForCategory, FormDefinition } from "@/lib/crime-forms"

const reportTypes = getReportTypes()

const ReportPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage()
  const router = useRouter()

  const [view, setView] = useState<"main" | "categories" | "forms">("main")
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleBack = () => {
    if (view === "forms") {
      setView("categories")
      setSelectedCategory(null)
    } else if (view === "categories") {
      setView("main")
      setSelectedReportType(null)
    } else {
      onNavigate("landing")
    }
  }

  const selectReportType = (typeKey: string) => {
    setSelectedReportType(typeKey)
    setView("categories")
  }

  const selectCategory = (categoryKey: string) => {
    setSelectedCategory(categoryKey)
    setView("forms")
  }

  const selectForm = (formKey: string) => {
    if (selectedReportType && selectedCategory) {
      router.push(`/report/${selectedReportType}/${selectedCategory}/${formKey}`)
    }
  }

  const renderContent = () => {
    if (view === "forms" && selectedReportType && selectedCategory) {
      const forms = getFormsForCategory(selectedReportType, selectedCategory)
      if (!forms) return <p>No forms found for this category.</p>
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(forms).map(([key, form]) => {
            const formDef = form as FormDefinition
            return (
              <CategoryCard
                key={key}
                title={formDef.title}
                subtitle={`Report an incident of ${formDef.title.toLowerCase()}.`}
                onClick={() => selectForm(key)}
                size="small"
              />
            )
          })}
        </div>
      )
    }

    if (view === "categories" && selectedReportType) {
      const categories = getCategoriesForReportType(selectedReportType)
      if (!categories) return <p>No categories found.</p>
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(categories).map(([key, category]) => (
            <CategoryCard
              key={key}
              title={category.title}
              subtitle={category.subtitle}
              onClick={() => selectCategory(key)}
            />
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {Object.entries(reportTypes).map(([key, type]) => (
          <CategoryCard key={key} title={type.title} subtitle={type.subtitle} onClick={() => selectReportType(key)} />
        ))}
      </div>
    )
  }

  const getPageTitle = () => {
    if (view === "forms" && selectedReportType && selectedCategory) {
      const categories = getCategoriesForReportType(selectedReportType)
      if (categories) {
        const category = categories[selectedCategory as keyof typeof categories] as { title?: string }
        return category?.title || "Select Form"
      }
    }
    if (view === "categories" && selectedReportType) {
      const reportType = reportTypes[selectedReportType as keyof typeof reportTypes]
      return reportType?.title || "Select Category"
    }
    return t("reportPageTitle")
  }

  const getPageSubtitle = () => {
    if (view === "forms") {
      return "Please select the specific type of incident you wish to report."
    }
    if (view === "categories") {
      return "Choose the category that best describes your report."
    }
    return t("reportPageSubtitle")
  }

  return (
    <div className="min-h-screen flex flex-col animate-fadeIn">
      <header className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center">
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">{getPageTitle()}</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{getPageSubtitle()}</p>
          </div>
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
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