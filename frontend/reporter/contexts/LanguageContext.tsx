//START OF contexts\LanguageContext.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import arMessages from "@/messages/ar.json"
import enMessages from "@/messages/en.json"

type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string | string[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: enMessages,
  ar: arMessages,
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string | string[] => {
    const langMessages = translations[language]

    // A simple resolver for dot notation, e.g., "Hero.title"
    const resolve = (path: string, obj: any): string | string[] | undefined =>
      path.split(".").reduce((prev, curr) => (prev ? prev[curr] : undefined), obj)

    const result = resolve(key, langMessages)

    // Return the key itself if not found or if the result is not a string/array
    if (result === undefined || (typeof result !== "string" && !Array.isArray(result))) {
      return key
    }

    return result
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
//END OF contexts\LanguageContext.tsx