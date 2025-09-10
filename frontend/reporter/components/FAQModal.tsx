"use client"

import React from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { Squircle } from "@squircle-js/react"
import { XMarkIcon } from "./icons/XMarkIcon"
import { ChevronDownIcon } from "./icons/ChevronDownIcon"

interface FAQModalProps {
  onClose: () => void
}

const FAQModal: React.FC<FAQModalProps> = ({ onClose }) => {
  const { t } = useLanguage()
  const [openItems, setOpenItems] = React.useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqs = [
    { question: t("faq1Question"), answer: t("faq1Answer") },
    { question: t("faq2Question"), answer: t("faq2Answer") },
    { question: t("faq3Question"), answer: t("faq3Answer") },
    { question: t("faq4Question"), answer: t("faq4Answer") },
    { question: t("faq5Question"), answer: t("faq5Answer") },
    { question: t("faq6Question"), answer: t("faq6Answer") },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <Squircle
          cornerRadius={20}
          cornerSmoothing={1}
          className="bg-slate-800 border border-white/10 shadow-2xl flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">{t("faqTitle")}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <button onClick={() => toggleItem(index)} className="w-full text-left">
                    <Squircle
                      cornerRadius={12}
                      cornerSmoothing={1}
                      className="w-full p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white pr-4">{faq.question}</span>
                        <ChevronDownIcon
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            openItems.includes(index) ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </Squircle>
                  </button>

                  {openItems.includes(index) && (
                    <div className="mt-2 px-4 py-3 text-gray-300 leading-relaxed">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-white/10">
            <button onClick={onClose} className="w-full">
              <Squircle
                cornerRadius={12}
                cornerSmoothing={1}
                className="w-full py-3 px-4 bg-white text-slate-900 font-semibold hover:bg-gray-200 transition-colors"
              >
                {t("faqClose")}
              </Squircle>
            </button>
          </div>
        </Squircle>
      </div>
    </div>
  )
}

export default FAQModal
