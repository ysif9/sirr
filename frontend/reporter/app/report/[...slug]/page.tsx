// FILE: app/report/[...slug]/page.tsx

"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getFormDefinition, FormDefinition } from "@/lib/crime-forms"
import CrimeReportForm from "@/components/report/CrimeReportForm"
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon"
import { Squircle } from "@squircle-js/react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ReportFormPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useLanguage()
  const [formDef, setFormDef] = useState<FormDefinition | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const slug = (params.slug as string[]) || []
  const [reportType, category, subcrime] = slug

  useEffect(() => {
    if (reportType && category && subcrime) {
      const definition = getFormDefinition(reportType, category, subcrime)
      setFormDef(definition || null)
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [reportType, category, subcrime])

  if (isLoading) {
    return <div className="text-white text-center pt-40">Loading form...</div>
  }

  if (!formDef) {
    return <div className="text-white text-center pt-40">Report form not found.</div>
  }

  return (
    // FIX: Added the gradient background classes to this div to match the app's theme
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col animate-fadeIn">
      <header className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center">
          <button
            onClick={() => router.back()}
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">{formDef.title}</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Please fill out the form below. All information is submitted anonymously.
            </p>
          </div>
          <CrimeReportForm formDefinition={formDef} />
        </div>
      </main>
    </div>
  )
}