"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Lock, Unlock, AlertCircle, FileText, Paperclip, ImageIcon, ShieldCheck, VideoIcon, FileAudio } from "lucide-react";
import apiClient from "@/lib/api";
import type { IInvestigatorNote, IReporterNote, IAttachment } from "@/lib/mock-data";
import { decryptAttachment } from "@/lib/crypto";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface NotesTabProps {
  reportId: string;
}

// Helper function to get file type icon
const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <FileText className="h-12 w-12 text-muted-foreground" />;
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-12 w-12 text-muted-foreground" />;
  if (mimeType.startsWith("video/")) return <VideoIcon className="h-12 w-12 text-muted-foreground" />;
  if (mimeType.startsWith("audio/")) return <FileAudio className="h-12 w-12 text-muted-foreground" />;
  return <FileText className="h-12 w-12 text-muted-foreground" />;
};

const getFileType = (mimeType?: string) => {
  if (!mimeType) return "Document";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  return "Document";
};

// Helper function to get generic attachment name based on mime type
const getGenericAttachmentName = (mimeType?: string): string => {
  if (!mimeType) return 'File attachment';
  if (mimeType.startsWith('image/')) return 'Image attachment';
  if (mimeType.startsWith('video/')) return 'Video attachment';
  if (mimeType.startsWith('audio/')) return 'Audio attachment';
  if (mimeType.includes('pdf')) return 'PDF attachment';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Document attachment';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet attachment';
  return 'File attachment';
};

// Dialog component for viewing a single reporter note attachment
const ReporterNoteAttachmentDialog = ({
  attachment,
  reporterNoteId
}: {
  attachment: IAttachment
  reporterNoteId: string
}) => {
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileType = getFileType(attachment.mime_type);

  // Cleanup object URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (decryptedUrl) {
        URL.revokeObjectURL(decryptedUrl);
      }
    };
  }, [decryptedUrl]);

  const handleDecryptAndDisplay = async () => {
    if (!attachment.nonce) {
      setError("Missing nonce for decryption.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDecryptedUrl(null);

    try {
      // Get the decryption key from the backend (investigator is authenticated)
      const response = await apiClient.post(`/reporter-notes/${reporterNoteId}/decrypt_attachments/`, {});

      if (!response.data || !response.data.attachment_keys) {
        throw new Error("Failed to decrypt attachment keys");
      }

      const attachmentKey = response.data.attachment_keys[attachment.id];

      if (!attachmentKey) {
        throw new Error("Missing decryption key");
      }

      // Decrypt the attachment
      const blob = await decryptAttachment(
        attachment.file,
        attachmentKey,
        attachment.nonce
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        setDecryptedUrl(url);
      } else {
        throw new Error("Decryption failed. The file may be corrupt or the key is incorrect.");
      }
    } catch (err) {
      console.error("Decryption error:", err);
      setError(err instanceof Error ? err.message : "Failed to decrypt attachment");
    } finally {
      setIsLoading(false);
    }
  };

  const genericName = getGenericAttachmentName(attachment.mime_type);

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{genericName}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 mt-4">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {decryptedUrl ? (
            fileType === 'Image' ? (
              <img src={decryptedUrl} alt="Decrypted content" className="w-full h-full object-contain" />
            ) : fileType === 'Video' ? (
              <video src={decryptedUrl} controls className="w-full h-full" />
            ) : (
              <a href={decryptedUrl} download={genericName} className="text-primary hover:underline">
                Download decrypted file
              </a>
            )
          ) : (
            <div className="text-center p-4">
              {getFileIcon(attachment.mime_type)}
              <p className="text-muted-foreground mt-2 text-sm">Preview of encrypted file.</p>
              <Button onClick={handleDecryptAndDisplay} disabled={isLoading} className="mt-4">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Decrypt and View
                  </>
                )}
              </Button>
              {error && <p className="text-destructive text-xs mt-2">{error}</p>}
            </div>
          )}
        </div>
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>End-to-End Encrypted</AlertTitle>
          <AlertDescription>
            This file is stored encrypted and is decrypted only on your device.
          </AlertDescription>
        </Alert>
        <div>
          <h3 className="font-semibold">Metadata</h3>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li><span className="font-medium text-foreground">Attachment ID:</span> {attachment.id.slice(0, 8)}</li>
            {attachment.mime_type && (
              <li><span className="font-medium text-foreground">File Type:</span> {attachment.mime_type}</li>
            )}
          </ul>
        </div>
      </div>
    </DialogContent>
  );
};

export default function NotesTab({ reportId }: NotesTabProps) {
  const [notes, setNotes] = useState<IInvestigatorNote[]>([]);
  const [reporterNotes, setReporterNotes] = useState<IReporterNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  // New note form state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState<"internal" | "external">("internal");
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch notes when component mounts
  useEffect(() => {
    fetchNotes();
    fetchReporterNotes();
  }, [reportId]);

  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/investigator-notes/", {
        params: { report: reportId },
      });
      setNotes(response.data.results || response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch notes:", err);
      setError("Failed to load notes. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReporterNotes = async () => {
    try {
      const response = await apiClient.get("/reporter-notes/", {
        params: { report: reportId },
      });
      setReporterNotes(response.data.results || response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch reporter notes:", err);
      // Don't set error state here - reporter notes are optional
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!newNoteContent.trim()) {
      setFormError("Note content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/investigator-notes/", {
        report: reportId,
        content: newNoteContent.trim(),
        is_internal: newNoteType === "internal",
      });

      // Add the new note to the list
      setNotes([response.data, ...notes]);

      // Reset form
      setNewNoteContent("");
      setNewNoteType("internal");
      setShowNewNoteForm(false);
    } catch (err: any) {
      console.error("Failed to create note:", err);
      setFormError(
        err.response?.data?.detail ||
        err.response?.data?.content?.[0] ||
        "Failed to create note. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Note Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investigator Notes</h2>
          <p className="text-sm text-muted-foreground">
            Document findings, observations, and actions taken during the investigation
          </p>
        </div>
        {!showNewNoteForm && (
          <Button onClick={() => setShowNewNoteForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* New Note Form */}
      {showNewNoteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
            <CardDescription>
              Create a new note for this report. Internal notes are only visible to investigators and admins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitNote} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-type">Note Type</Label>
                <Select
                  value={newNoteType}
                  onValueChange={(value) => setNewNoteType(value as "internal" | "external")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="note-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">
                      <div className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        Internal (Investigators & Admins Only)
                      </div>
                    </SelectItem>
                    <SelectItem value="external">
                      <div className="flex items-center">
                        <Unlock className="mr-2 h-4 w-4" />
                        External (Shared with Reporter)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note-content">Note Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Enter your note here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                  className="resize-none"
                />
              </div>

              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Note"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewNoteForm(false);
                    setNewNoteContent("");
                    setNewNoteType("internal");
                    setFormError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No notes have been added to this report yet.
              </p>
              {!showNewNoteForm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowNewNoteForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Note
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className={note.is_internal ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-green-500"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{note.author_name}</CardTitle>
                      <Badge variant={note.is_internal ? "secondary" : "default"}>
                        {note.is_internal ? (
                          <>
                            <Lock className="mr-1 h-3 w-3" />
                            Internal
                          </>
                        ) : (
                          <>
                            <Unlock className="mr-1 h-3 w-3" />
                            External
                          </>
                        )}
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(note.created_at)}
                      {note.updated_at !== note.created_at && " (edited)"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{note.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reporter Notes Section */}
      {reporterNotes.length > 0 && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-purple-500" />
            <h3 className="text-xl font-bold">Reporter's Notes</h3>
            <Badge variant="outline" className="ml-2">
              {reporterNotes.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Additional information provided by the reporter after initial submission
          </p>

          <div className="space-y-4">
            {reporterNotes.map((note) => (
              <Card key={note.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">Reporter</CardTitle>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Reporter Note
                        </Badge>
                      </div>
                      <CardDescription>
                        {formatDate(note.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {note.attachments.map((attachment) => (
                          <Dialog key={attachment.id}>
                            <DialogTrigger asChild>
                              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md border border-purple-200 transition-colors">
                                <Paperclip className="h-4 w-4" />
                                <span className="truncate max-w-[200px]">
                                  {getGenericAttachmentName(attachment.mime_type)}
                                </span>
                              </button>
                            </DialogTrigger>
                            <ReporterNoteAttachmentDialog
                              attachment={attachment}
                              reporterNoteId={note.id}
                            />
                          </Dialog>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

