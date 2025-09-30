"use client"

import type React from "react"
import { useMessages } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon"
import { Squircle } from "@squircle-js/react"

interface InfoPageProps {
  pageKey: "accessibility" | "terms"
}

const InfoPage: React.FC<InfoPageProps> = ({ pageKey }) => {
  const messages = useMessages() as any; // Cast to any to simplify navigation

  const capitalizedPageKey = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
  
  const title = messages.InfoPages[capitalizedPageKey].title as string;
  const content = messages.InfoPages[capitalizedPageKey].content as string[];

  const renderParagraph = (text: string, index: number) => {
    const parts = text.split("**")
    return (
      <p key={index}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-bold text-white">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </p>
    )
  }

  return (
    <div className="min-h-screen flex flex-col animate-fadeIn bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex items-center">
          <Link
            href="/"
            className="group mr-2 focus:outline-none"
            aria-label="Back"
          >
            <Squircle
              cornerRadius={10}
              cornerSmoothing={1}
              className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors p-2 group-hover:bg-gray-500 group-hover:bg-opacity-20"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </Squircle>
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter mb-8">{title}</h1>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              {Array.isArray(content) ? content.map(renderParagraph) : <p>{content}</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default InfoPage