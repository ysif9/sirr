"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { Squircle } from "@squircle-js/react"
import { XMarkIcon } from "./icons/XMarkIcon"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQModalProps {
  onClose: () => void
}

const FAQModal: React.FC<FAQModalProps> = ({ onClose }) => {
  const t = useTranslations("FAQModal")

  const faqs = [
    { question: t("q1.question"), answer: t("q1.answer") },
    { question: t("q2.question"), answer: t("q2.answer") },
    { question: t("q3.question"), answer: t("q3.answer") },
    { question: t("q4.question"), answer: t("q4.answer") },
    { question: t("q5.question"), answer: t("q5.answer") },
    { question: t("q6.question"), answer: t("q6.answer") },
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
            <h2 className="text-xl font-bold text-white">{t("title")}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white/5 border border-white/10 rounded-lg transition-colors"
                >
                  <AccordionTrigger className="w-full text-left p-4 font-semibold text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 pb-4 pt-0 text-gray-300 leading-relaxed">{faq.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="p-6 border-t border-white/10">
            <button onClick={onClose} className="w-full">
              <Squircle
                cornerRadius={12}
                cornerSmoothing={1}
                className="w-full py-3 px-4 bg-white text-slate-900 font-semibold hover:bg-gray-200 transition-colors"
              >
                {t("close")}
              </Squircle>
            </button>
          </div>
        </Squircle>
      </div>
    </div>
  )
}

export default FAQModal