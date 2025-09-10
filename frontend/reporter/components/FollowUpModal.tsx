"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { Squircle } from "@squircle-js/react"
import { XMarkIcon } from "./icons/XMarkIcon"

interface FollowUpModalProps {
  onClose: () => void
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ onClose }) => {
  const { t } = useLanguage()
  const [referenceNumber, setReferenceNumber] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle follow-up logic here
    console.log("Following up on report:", referenceNumber)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Squircle cornerRadius={20} cornerSmoothing={1} className="bg-slate-800 border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{t("followUpTitle")}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-300 mb-6">{t("followUpDescription")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={t("followUpPlaceholder")}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1">
                <Squircle
                  cornerRadius={12}
                  cornerSmoothing={1}
                  className="w-full py-3 px-4 border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
                >
                  {t("followUpCancel")}
                </Squircle>
              </button>

              <button type="submit" className="flex-1" disabled={!referenceNumber.trim()}>
                <Squircle
                  cornerRadius={12}
                  cornerSmoothing={1}
                  className="w-full py-3 px-4 bg-white text-slate-900 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("followUpSubmit")}
                </Squircle>
              </button>
            </div>
          </form>
        </Squircle>
      </div>
    </div>
  )
}

export default FollowUpModal
