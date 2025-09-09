"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { CategoryCard } from "./CategoryCard"
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon"
import { Squircle } from "@squircle-js/react"

interface Category {
  title: string
  subtitle: string
  subcategories?: Category[]
  examples?: string[]
}

interface ReportPageProps {
  onNavigate: (page: string) => void
}

const crimeCategories: Category[] = [
  {
    title: "Violence & Threats Against a Person",
    subtitle: "For acts involving physical harm, the threat of harm, or offenses against a person's liberty.",
    subcategories: [
      {
        title: "Assault / Attack",
        subtitle: "Someone was physically attacked or injured.",
      },
      {
        title: "Robbery / Mugging",
        subtitle: "Property was taken from a person by force or threat.",
      },
      {
        title: "Threats, Harassment, or Stalking",
        subtitle: "Being threatened with harm or persistently harassed.",
      },
      {
        title: "Extortion or Blackmail",
        subtitle: "Demanding money, services, or property through coercion or threats to reveal compromising information.",
      },
      {
        title: "Sexual Offense",
        subtitle: "Any unwanted act of a sexual nature.",
        examples: ["Rape, sexual assault, unwanted groping."],
      },
      {
        title: "Kidnapping or Abduction",
        subtitle: "Someone was taken or is being held against their will.",
      },
      {
        title: "Domestic & Family Violence",
        subtitle: "An act of violence or abuse between family members, household members, or intimate partners.",
        examples: ["Physical assault by a spouse, threats from a family member."],
        subcategories: [
          {
            title: "Child Abuse or Neglect",
            subtitle: "Specific reporting for harm or neglect of a minor, including witnessing violence in the home.",
          },
          {
            title: "Elder Abuse",
            subtitle: "Harm, neglect, or financial exploitation of an elderly person.",
          },
        ],
      },
      {
        title: "Human Trafficking",
        subtitle: "Forcing, tricking, or coercing a person into labor, services, or commercial sex.",
      },
      {
        title: "Hate Crime or Bias-Motivated Incident",
        subtitle: "A crime motivated by prejudice against a protected characteristic.",
      },
    ],
  },
  {
    title: "Theft, Burglary & Property Damage",
    subtitle: "For acts involving stolen property or damage to property where no direct force against a person was used.",
    subcategories: [
      {
        title: "Burglary / Break-in",
        subtitle: "Someone unlawfully entered a building to commit a crime.",
      },
      {
        title: "Theft of Personal Property",
        subtitle: "Property was stolen without force or a break-in.",
        examples: ["Package theft, shoplifting, pickpocketing, theft of a bicycle."],
      },
      {
        title: "Mail Theft",
        subtitle: "Theft of letters, packages, or other items from a mailbox or porch.",
      },
      {
        title: "Vandalism / Property Damage",
        subtitle: "Willful damage or destruction of property.",
      },
      {
        title: "Arson",
        subtitle: "Deliberately setting a fire.",
      },
      {
        title: "Criminal Trespassing",
        subtitle: "Unlawfully entering or remaining on someone else's property without permission.",
      },
    ],
  },
  {
    title: "Vehicle-Related Crime",
    subtitle: "For crimes specifically involving motor vehicles.",
    subcategories: [
        {
            title: "Motor Vehicle Theft",
            subtitle: "A car, motorcycle, or other vehicle was stolen.",
        },
        {
            title: "Theft from a Vehicle",
            subtitle: "Items were stolen from inside or taken off a vehicle.",
        },
        {
            title: "Hit & Run Collision",
            subtitle: "A driver involved in a collision left the scene without providing information.",
        },
        {
            title: "Vehicle Vandalism",
            subtitle: "Willful damage to a vehicle.",
        },
    ]
  },
  {
    title: "Fraud, Scams & Financial Crime",
    subtitle: "For acts involving deception for financial gain or to compromise personal information.",
    subcategories: [
        {
            title: "Fraud / Scam",
            subtitle: "Deceived for money or personal information.",
            examples: ["Online scams, phishing emails, credit card fraud, insurance fraud."],
        },
        {
            title: "Identity Theft",
            subtitle: "Someone used your personal information without permission.",
        },
        {
            title: "Counterfeiting or Forgery",
            subtitle: "Use of fake money, documents, or goods.",
        },
    ]
  },
  {
    title: "Cybercrime",
    subtitle: "For criminal activity that involves a computer, computer network, or a networked device.",
    subcategories: [
        {
            title: "Hacking",
            subtitle: "Unauthorized access to a computer, network, or online account.",
        },
        {
            title: "Online Harassment, Threats, or Cyberstalking",
            subtitle: "The use of the internet to threaten, harass, or make unwanted advances.",
        },
        {
            title: "Phishing / Spoofing",
            subtitle: "Deceptive emails, texts (smishing), or websites to steal personal information.",
        },
        {
            title: "Ransomware Attack",
            subtitle: "Malicious software blocking access to a computer until a sum of money is paid.",
        },
        {
            title: "Distribution of Illegal Online Content",
            subtitle: "Reporting websites or users sharing illegal material, such as child exploitation or terrorist content.",
        },
        {
            title: "Online Impersonation",
            subtitle: "Someone creating a fake online profile or account to deceive others.",
        },
    ]
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

const concernCategories: Category[] = [
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
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>([])
  const [categoryStack, setCategoryStack] = useState<Category[][]>([])

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setCategoryStack([...categoryStack, displayedCategories])
      setDisplayedCategories(category.subcategories)
    } else {
      // This is a leaf category. For now, we'll just log it.
      // TODO: Implement navigation to the report details page.
      console.log("Selected leaf category:", category.title)
    }
  }

  const handleBack = () => {
    if (categoryStack.length > 0) {
      const previousCategories = categoryStack[categoryStack.length - 1]
      setCategoryStack(categoryStack.slice(0, -1))
      setDisplayedCategories(previousCategories)
    } else if (view === "crime" || view === "concern") {
      setView("main")
      setDisplayedCategories([])
    } else {
      onNavigate("landing")
    }
  }

  const selectReportType = (type: "crime" | "concern") => {
    setView(type)
    setDisplayedCategories(type === "crime" ? crimeCategories : concernCategories)
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
                onClick={() => selectReportType("crime")}
              />
              <CategoryCard
                title="Report a Concern or Non-Criminal Incident"
                subtitle="For public safety issues, suspicious activity, or community alerts."
                onClick={() => selectReportType("concern")}
              />
            </div>
          )}

          {(view === "crime" || view === "concern") && displayedCategories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {displayedCategories.map(category => (
                <CategoryCard
                  key={category.title}
                  title={category.title}
                  subtitle={category.subtitle}
                  onClick={() => handleCategoryClick(category)}
                />
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
