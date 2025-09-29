// FILE: app/[locale]/page.tsx

"use client"

import { useState, useEffect } from "react"
import SplashScreen from "../../components/SplashScreen"
import LandingPage from "../../components/LandingPage"
import ReportPage from "../../components/ReportPage"
import InfoPage from "../../components/InfoPage"

// To avoid name collision, we rename this type.
type PageView = "splash" | "landing" | "report" | "accessibility" | "terms"

// The function MUST be named `Page` to be recognized by the Next.js router.
export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageView>("splash")

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setCurrentPage("landing")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageView)
  }

  const renderPage = () => {
    switch (currentPage) {
      case "splash":
        return <SplashScreen />
      case "landing":
        return <LandingPage onNavigate={handleNavigate} />
      case "report":
        return <ReportPage onNavigate={handleNavigate} />
      case "accessibility":
        return <InfoPage pageKey="accessibility" onNavigate={handleNavigate} />
      case "terms":
        return <InfoPage pageKey="terms" onNavigate={handleNavigate} />
      default:
        return <LandingPage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">{renderPage()}</div>
  )
}