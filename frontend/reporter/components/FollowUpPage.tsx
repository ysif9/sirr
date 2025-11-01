"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Squircle } from "@squircle-js/react"
import { XMarkIcon } from "./icons/XMarkIcon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Info,
  Shield,
  Eye,
  XCircle
} from "lucide-react"

interface InvestigatorNote {
  id: string
  content: string
  author_name: string
  created_at: string
}

interface ReportStatus {
  access_key: string
  status: string
  status_display: string
  priority: string
  priority_display: string
  created_at: string
  last_access_by_reporter: string | null
  assigned_at: string | null
  opened_at: string | null
  closed_at: string | null
  investigator_notes: InvestigatorNote[]
}

interface FollowUpPageProps {
  accessKey: string
  onClose: () => void
}

const FollowUpPage: React.FC<FollowUpPageProps> = ({ accessKey, onClose }) => {
  const t = useTranslations("FollowUpPage")
  const locale = useLocale()
  const isRTL = locale === 'ar'
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReportStatus()
  }, [accessKey])

  const fetchReportStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:8000/api/follow-up/${accessKey}/`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t("errorNotFound"))
        }
        throw new Error(t("errorFetchFailed"))
      }

      const data = await response.json()
      setReportStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorUnexpected"))
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes("new")) return <FileText className="h-5 w-5" />
    if (statusLower.includes("opened") || statusLower.includes("investigation")) return <Eye className="h-5 w-5" />
    if (statusLower.includes("resolved") || statusLower.includes("closed")) return <CheckCircle2 className="h-5 w-5" />
    return <Clock className="h-5 w-5" />
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes("new")) return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    if (statusLower.includes("opened") || statusLower.includes("investigation")) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    if (statusLower.includes("resolved")) return "bg-green-500/10 text-green-500 border-green-500/20"
    if (statusLower.includes("closed")) return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    return "bg-slate-500/10 text-slate-500 border-slate-500/20"
  }

  const getPriorityIcon = (priority: string) => {
    const priorityLower = priority.toLowerCase()
    if (priorityLower.includes("critical") || priorityLower.includes("urgent") || priorityLower.includes("high")) {
      return <AlertTriangle className="h-5 w-5" />
    }
    if (priorityLower.includes("medium")) return <AlertCircle className="h-5 w-5" />
    return <Info className="h-5 w-5" />
  }

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority.toLowerCase()
    if (priorityLower.includes("critical") || priorityLower.includes("urgent")) {
      return "bg-red-500/10 text-red-500 border-red-500/20"
    }
    if (priorityLower.includes("high")) return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    if (priorityLower.includes("medium")) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    return "bg-blue-500/10 text-blue-500 border-blue-500/20"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getContextualMessage = (status: string, priority: string) => {
    const statusLower = status.toLowerCase()
    const priorityLower = priority.toLowerCase()

    // When status is "new" (submitted/pending)
    if (statusLower === 'new') {
      return t("statusMessageNew")
    }

    // When status is "opened" (in progress) and priority is critical
    if (statusLower === 'opened' && priorityLower === 'critical') {
      return t("statusMessageCritical")
    }

    // When status is "opened" (in progress) and priority is high
    if (statusLower === 'opened' && priorityLower === 'high') {
      return t("statusMessageHighPriority")
    }

    // When status is "opened" (in progress) with medium priority
    if (statusLower === 'opened' && priorityLower === 'medium') {
      return t("statusMessageMediumPriority")
    }

    // When status is "opened" (in progress) with low priority
    if (statusLower === 'opened' && priorityLower === 'low') {
      return t("statusMessageLowPriority")
    }

    // When status is "opened" (in progress) - fallback for opened status
    if (statusLower === 'opened') {
      return t("statusMessageInProgress")
    }

    // When status is "closed" (resolved)
    if (statusLower === 'closed') {
      return t("statusMessageClosed")
    }

    // Fallback
    return t("statusMessageDefault")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-4xl my-8">
        <Squircle
          cornerRadius={24}
          cornerSmoothing={1}
          className="bg-slate-800 border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-white/10 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-white/5 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <h2 className="text-2xl font-bold text-white">{t("title")}</h2>
                <p className="text-sm text-gray-400">{t("subtitle")}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              aria-label={t("closeAriaLabel")}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full bg-white/5" />
                <Skeleton className="h-32 w-full bg-white/5" />
                <Skeleton className="h-48 w-full bg-white/5" />
              </div>
            )}

            {error && (
              <div className={`flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="font-semibold text-red-500">{t("errorTitle")}</h3>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Emergency Disclaimer - Always visible */}
            {!loading && (
              <div className={`flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>

                <div className="text-center flex-1">
                  <h3 className="font-semibold text-red-500">{t("emergencyDisclaimerTitle")}</h3>
                  <p className="text-sm text-red-400 mt-1">{t("emergencyDisclaimerText")}</p>
                </div>
              </div>
            )}

            {!loading && !error && reportStatus && (
              <>
                {/* Access Key Display */}
                <div className={`p-4 bg-white/5 border border-white/10 rounded-xl ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-xs text-gray-400 mb-1">{t("accessKeyLabel")}</p>
                  <p className="text-sm font-mono text-white break-all">{reportStatus.access_key}</p>
                </div>

                {/* Status Message Card */}
                <Squircle cornerRadius={16} cornerSmoothing={1} className="bg-blue-500/10 border border-blue-500/20 p-5">
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className={isRTL ? 'text-right' : ''}>
                      <h3 className="text-base font-semibold text-blue-400 mb-1">{t("reportStatusTitle")}</h3>
                      <p className="text-sm text-blue-300 leading-relaxed">
                        {getContextualMessage(reportStatus.status, reportStatus.priority)}
                      </p>
                    </div>
                  </div>
                </Squircle>

                {/* Timeline Information */}
                <Squircle cornerRadius={16} cornerSmoothing={1} className="bg-white/5 border border-white/10 p-5">
                  <h3 className={`text-sm font-medium text-gray-400 mb-4 ${isRTL ? 'text-right' : ''}`}>{t("timelineTitle")}</h3>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm text-gray-300">{t("timelineSubmitted")}</span>
                      <span className="text-sm text-white font-medium">{formatDate(reportStatus.created_at)}</span>
                    </div>
                    {reportStatus.assigned_at && (
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm text-gray-300">{t("timelineAssigned")}</span>
                        <span className="text-sm text-white font-medium">{formatDate(reportStatus.assigned_at)}</span>
                      </div>
                    )}
                    {reportStatus.opened_at && (
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm text-gray-300">{t("timelineOpened")}</span>
                        <span className="text-sm text-white font-medium">{formatDate(reportStatus.opened_at)}</span>
                      </div>
                    )}
                    {reportStatus.closed_at && (
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm text-gray-300">{t("timelineClosed")}</span>
                        <span className="text-sm text-white font-medium">{formatDate(reportStatus.closed_at)}</span>
                      </div>
                    )}
                    {reportStatus.last_access_by_reporter && (
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm text-gray-300">{t("timelineLastChecked")}</span>
                        <span className="text-sm text-white font-medium">{formatDate(reportStatus.last_access_by_reporter)}</span>
                      </div>
                    )}
                  </div>
                </Squircle>

                {/* Investigator Notes */}
                <Squircle cornerRadius={16} cornerSmoothing={1} className="bg-white/5 border border-white/10 p-5">
                  <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <FileText className="h-5 w-5 text-gray-400" />
                    <h3 className={`text-sm font-medium text-gray-400 ${isRTL ? 'text-right' : ''}`}>{t("investigatorNotesTitle")}</h3>
                  </div>

                  {reportStatus.investigator_notes && reportStatus.investigator_notes.length > 0 ? (
                    <div className="space-y-3">
                      {reportStatus.investigator_notes.map((note) => (
                        <div
                          key={note.id}
                          className={`p-4 bg-green-500/10 border border-green-500/20 rounded-lg ${isRTL ? 'text-right' : ''}`}
                        >
                          <div className={`flex items-start gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Shield className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-green-400">{t("updateFromInvestigator")}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed mb-2">
                            {note.content}
                          </p>
                          <p className={`text-xs text-gray-500 ${isRTL ? 'text-right' : ''}`}>
                            {formatDate(note.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">{t("noNotesAvailable")}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t("noNotesDescription")}
                      </p>
                    </div>
                  )}
                </Squircle>

                {/* Information Banner */}
                <div className="flex flex-col items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-500 text-sm">{t("infoBannerTitle")}</h3>
                    <p className="text-xs text-blue-400 mt-1">
                      {t("infoBannerDescription")}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <button onClick={onClose} className="w-full">
              <Squircle
                cornerRadius={12}
                cornerSmoothing={1}
                className="w-full py-3 px-4 bg-white text-slate-900 font-semibold hover:bg-gray-200 transition-colors"
              >
                {t("closeButton")}
              </Squircle>
            </button>
          </div>
        </Squircle>
      </div>
    </div>
  )
}

export default FollowUpPage

