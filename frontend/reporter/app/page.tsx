// FILE: app/page.tsx

"use client"

import { useState, useEffect } from "react"
// 1. Remove the import for LanguageProvider
// import { LanguageProvider } from "../contexts/LanguageContext"
import SplashScreen from "../components/SplashScreen"
import LandingPage from "../components/LandingPage"
import ReportPage from "../components/ReportPage"
import InfoPage from "../components/InfoPage"

type Page = "splash" | "landing" | "report" | "accessibility" | "terms"

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("splash")

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setCurrentPage("landing")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page)
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

  // 2. Remove the <LanguageProvider> wrapper
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">{renderPage()}</div>
  )
}