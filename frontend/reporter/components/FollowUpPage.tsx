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
  XCircle,
  Paperclip
} from "lucide-react"
import nacl from "tweetnacl"
import { getAdminPublicKey } from "../lib/api"

interface Attachment {
  id: string
  file: string
  key_envelope: {
    wrapped_key: string
    scheme: string
  }
  nonce: string
  description?: string
  checksum?: string
  mime_type?: string
  file_extension?: string
}

interface InvestigatorNote {
  id: string
  content: string
  author_name: string
  created_at: string
}

interface ReporterNote {
  id: string
  content: string
  attachments: Attachment[]
  created_at: string
}

// Unified note type that combines both investigator and reporter notes
interface UnifiedNote {
  id: string
  content: string
  created_at: string
  source: 'investigator' | 'reporter'
  // Optional fields based on source
  author_name?: string // Only for investigator notes
  attachments?: Attachment[] // Only for reporter notes
}

interface ReportStatus {
  id: string
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
  reporter_notes: ReporterNote[]
}

interface FollowUpPageProps {
  accessKey: string
  onClose: () => void
}

// Helper functions for encryption
const uint8ArrayToBase64 = (array: Uint8Array): string => {
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
}

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

const fileToUint8Array = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper function to get generic attachment name based on mime type
const getGenericAttachmentName = (mimeType?: string): string => {
  if (!mimeType) return 'File attachment'
  if (mimeType.startsWith('image/')) return 'Image attachment'
  if (mimeType.startsWith('video/')) return 'Video attachment'
  if (mimeType.startsWith('audio/')) return 'Audio attachment'
  if (mimeType.includes('pdf')) return 'PDF attachment'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Document attachment'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet attachment'
  return 'File attachment'
}

// Component for displaying attachment indicator (reporters cannot decrypt their own attachments)
const AttachmentIndicator = ({
  attachment
}: {
  attachment: Attachment
}) => {
  const genericName = getGenericAttachmentName(attachment.mime_type)

  return (
    <div className="flex items-center gap-2 text-xs text-purple-400/70">
      <Paperclip className="h-3 w-3" />
      <span className="truncate max-w-[200px]">{genericName}</span>
      <span title="Encrypted attachment">
        <Shield className="h-3 w-3 ml-1" />
      </span>
    </div>
  )
}

const FollowUpPage: React.FC<FollowUpPageProps> = ({ accessKey, onClose }) => {
  const t = useTranslations("FollowUpPage")
  const locale = useLocale()
  const isRTL = locale === 'ar'
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to merge and sort notes chronologically (oldest first)
  const mergeAndSortNotes = (
    investigatorNotes: InvestigatorNote[],
    reporterNotes: ReporterNote[]
  ): UnifiedNote[] => {
    const unifiedNotes: UnifiedNote[] = [
      ...investigatorNotes.map(note => ({
        id: note.id,
        content: note.content,
        created_at: note.created_at,
        source: 'investigator' as const,
        author_name: note.author_name,
      })),
      ...reporterNotes.map(note => ({
        id: note.id,
        content: note.content,
        created_at: note.created_at,
        source: 'reporter' as const,
        attachments: note.attachments,
      })),
    ]

    // Sort by created_at timestamp (oldest first)
    return unifiedNotes.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateA - dateB
    })
  }

  // Reporter note creation state
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [noteFile, setNoteFile] = useState<File | null>(null)
  const [submittingNote, setSubmittingNote] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)

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

  const submitReporterNote = async () => {
    if (!noteContent.trim()) {
      setNoteError("Please enter a note")
      return
    }

    if (!reportStatus?.id) {
      setNoteError("Report ID not found")
      return
    }

    try {
      setSubmittingNote(true)
      setNoteError(null)

      // Get admin public key for encryption
      const adminPublicKeyResponse = await getAdminPublicKey()
      const adminPublicKey = base64ToUint8Array(adminPublicKeyResponse.public_key_bundle.identity_key_x25519)

      // Prepare payload with attachments metadata
      const attachmentsMetadata: any[] = []
      const formData = new FormData()

      // Encrypt attachment if present
      if (noteFile) {
        const attachmentId = uuidv4()
        const attachmentKey = nacl.randomBytes(nacl.secretbox.keyLength)
        const attachmentNonce = nacl.randomBytes(nacl.secretbox.nonceLength)
        const fileBytes = await fileToUint8Array(noteFile)

        const encryptedFileBytes = nacl.secretbox(fileBytes, attachmentNonce, attachmentKey)
        const encryptedFileBlob = new Blob([new Uint8Array(encryptedFileBytes)], { type: noteFile.type })

        // Generate ephemeral key pair for this attachment
        const reporterEphemeralKeyPair = nacl.box.keyPair()

        // Wrap the attachment key
        const attachKeyWrapNonce = nacl.randomBytes(nacl.box.nonceLength)
        const encryptedAttachmentKey = nacl.box(
          attachmentKey,
          attachKeyWrapNonce,
          adminPublicKey,
          reporterEphemeralKeyPair.secretKey
        )
        const wrappedAttachmentKeyWithNonce = new Uint8Array(
          attachKeyWrapNonce.length + encryptedAttachmentKey.length
        )
        wrappedAttachmentKeyWithNonce.set(attachKeyWrapNonce)
        wrappedAttachmentKeyWithNonce.set(encryptedAttachmentKey, attachKeyWrapNonce.length)

        attachmentsMetadata.push({
          id: attachmentId,
          nonce: uint8ArrayToBase64(attachmentNonce),
          key_envelope: {
            reporter_ephemeral_public_key: uint8ArrayToBase64(reporterEphemeralKeyPair.publicKey),
            wrapped_key: uint8ArrayToBase64(wrappedAttachmentKeyWithNonce),
            scheme: "x25519-xchacha20poly1305",
          },
        })

        // Add encrypted file to form data
        formData.append(attachmentId, encryptedFileBlob, noteFile.name)
      }

      // Create payload
      const payload = {
        report: reportStatus.id,
        content: noteContent,
        access_key: accessKey,
        attachments: attachmentsMetadata,
      }

      formData.append("payload", JSON.stringify(payload))

      const response = await fetch("http://localhost:8000/api/reporter-notes/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = "Failed to submit note"
        try {
          // Read response as text first
          const responseText = await response.text()
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.detail || JSON.stringify(errorData)
          } catch (jsonError) {
            // If not JSON (e.g., HTML error page)
            console.error("Server error response:", responseText)
            errorMessage = `Server error (${response.status}): ${response.statusText}`
          }
        } catch (e) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Reset form and close modal
      setNoteContent("")
      setNoteFile(null)
      setShowNoteModal(false)

      // Refresh report status to show new note
      await fetchReportStatus()
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Failed to submit note")
    } finally {
      setSubmittingNote(false)
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

                {/* Unified Notes Section */}
                <Squircle cornerRadius={16} cornerSmoothing={1} className="bg-white/5 border border-white/10 p-5">
                  <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h3 className={`text-sm font-medium text-gray-400 ${isRTL ? 'text-right' : ''}`}>
                        {t("notesTitle") || "Notes & Updates"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowNoteModal(true)}
                      className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-medium rounded-lg transition-colors border border-purple-500/30"
                    >
                      + Add Note
                    </button>
                  </div>

                  {(() => {
                    const mergedNotes = mergeAndSortNotes(
                      reportStatus.investigator_notes || [],
                      reportStatus.reporter_notes || []
                    )

                    if (mergedNotes.length > 0) {
                      return (
                        <div className="space-y-3">
                          {mergedNotes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-4 rounded-lg ${isRTL ? 'text-right' : ''} ${
                                note.source === 'investigator'
                                  ? 'bg-green-500/10 border border-green-500/20'
                                  : 'bg-purple-500/10 border border-purple-500/20'
                              }`}
                            >
                              {/* Note header with source indicator */}
                              <div className={`flex items-start gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {note.source === 'investigator' ? (
                                  <>
                                    <Shield className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-green-400">
                                        {t("updateFromInvestigator") || "Update from Investigator"}
                                      </p>
                                      {note.author_name && (
                                        <p className="text-xs text-green-300/70 mt-0.5">
                                          {note.author_name}
                                        </p>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="h-4 w-4 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <div className="h-2 w-2 rounded-full bg-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-purple-400">
                                        {t("yourNote") || "Your Note"}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Note content */}
                              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed mb-2">
                                {note.content}
                              </p>

                              {/* Attachments for reporter notes */}
                              {note.source === 'reporter' && note.attachments && note.attachments.length > 0 && (
                                <div className="mt-2 space-y-1 pt-2 border-t border-purple-500/20">
                                  <p className="text-xs text-purple-400/50 mb-1">Attachments:</p>
                                  {note.attachments.map((attachment) => (
                                    <AttachmentIndicator
                                      key={attachment.id}
                                      attachment={attachment}
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Timestamp */}
                              <p className={`text-xs text-gray-500 ${isRTL ? 'text-right' : ''}`}>
                                {formatDate(note.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )
                    }

                    return (
                      <div className="text-center py-8">
                        <Info className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">
                          {t("noNotesAvailable") || "No notes or updates yet"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("noNotesDescription") || "Notes and updates from investigators will appear here. You can also add your own notes."}
                        </p>
                      </div>
                    )
                  })()}
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

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Squircle
            cornerRadius={24}
            cornerSmoothing={1}
            className="bg-slate-900 border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add a Note</h2>
                <button
                  onClick={() => {
                    setShowNoteModal(false)
                    setNoteContent("")
                    setNoteFile(null)
                    setNoteError(null)
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {noteError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{noteError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Note Content
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter additional information about your report..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[120px] resize-y"
                    disabled={submittingNote}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attachment (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30"
                    disabled={submittingNote}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowNoteModal(false)
                      setNoteContent("")
                      setNoteFile(null)
                      setNoteError(null)
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors border border-white/10"
                    disabled={submittingNote}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReporterNote}
                    disabled={submittingNote || !noteContent.trim()}
                    className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingNote ? "Submitting..." : "Submit Note"}
                  </button>
                </div>
              </div>
            </div>
          </Squircle>
        </div>
      )}
    </div>
  )
}

export default FollowUpPage

