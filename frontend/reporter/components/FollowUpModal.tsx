//START OF components\FollowUpModal.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Squircle } from "@squircle-js/react"
import { XMarkIcon } from "./icons/XMarkIcon"
import { XCircle, Loader2 } from "lucide-react"
import FollowUpPage from "./FollowUpPage"

interface FollowUpModalProps {
  onClose: () => void
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ onClose }) => {
  const t = useTranslations("FollowUpModal")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validatedAccessKey, setValidatedAccessKey] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous errors
    setError(null)
    setIsValidating(true)

    try {
      // Validate the access key by attempting to fetch the report status
      const response = await fetch(`http://localhost:8000/api/follow-up/${referenceNumber.trim()}/`)

      if (!response.ok) {
        if (response.status === 404) {
          setError(t("errorNotFound"))
        } else {
          setError(t("errorGeneric"))
        }
        setIsValidating(false)
        return
      }

      // If validation succeeds, set the validated access key to show FollowUpPage
      setValidatedAccessKey(referenceNumber.trim())
    } catch (err) {
      console.error("Error validating access key:", err)
      setError(t("errorNetwork"))
    } finally {
      setIsValidating(false)
    }
  }

  // If we have a validated access key, show the FollowUpPage
  if (validatedAccessKey) {
    return <FollowUpPage accessKey={validatedAccessKey} onClose={onClose} />
  }

  // Otherwise, show the access key input form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        <Squircle cornerRadius={20} cornerSmoothing={1} className="bg-slate-800 border border-white/10 p-6 shadow-2xl transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{t("title")}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-300 mb-4">{t("description")}</p>

          {/* Error message display - Smooth transition when appearing */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${error ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-500">{t("errorTitle")}</h3>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => {
                  setReferenceNumber(e.target.value)
                  // Clear error when user starts typing
                  if (error) setError(null)
                }}
                placeholder={t("placeholder") as string}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white focus:border-transparent"
                required
                disabled={isValidating}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1" disabled={isValidating}>
                <Squircle
                  cornerRadius={12}
                  cornerSmoothing={1}
                  className="w-full py-3 px-4 border border-white/20 text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("cancel")}
                </Squircle>
              </button>

              <button type="submit" className="flex-1" disabled={!referenceNumber.trim() || isValidating}>
                <Squircle
                  cornerRadius={12}
                  cornerSmoothing={1}
                  className="w-full py-3 px-4 bg-white text-slate-900 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isValidating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isValidating ? t("validating") : t("submit")}
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
//END OF components\FollowUpModal.tsx
