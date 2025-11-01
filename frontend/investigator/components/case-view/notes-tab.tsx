"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Lock, Unlock, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api";
import type { IInvestigatorNote } from "@/lib/mock-data";

interface NotesTabProps {
  reportId: string;
}

export default function NotesTab({ reportId }: NotesTabProps) {
  const [notes, setNotes] = useState<IInvestigatorNote[]>([]);
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
    </div>
  );
}

