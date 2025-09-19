"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  MapPin,
  FileAudio,
  Image,
  Video,
  FileText,
  User,
  PlusCircle,
} from "lucide-react";
import TopNavBar from "@/components/top-nav-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { mockCasesData } from "@/lib/mock-data";
import type { ICaseInfo, INote } from "@/lib/mock-data";

// Helper component for priority badge
const PriorityBadge = ({ priority }: { priority: ICaseInfo["priority"] }) => {
  const styleMap = {
    Critical: "bg-red-500 hover:bg-red-500/80 text-white",
    High: "bg-orange-400 hover:bg-orange-400/80 text-white",
    Medium: "bg-yellow-400 hover:bg-yellow-400/80 text-black",
    Low: "bg-sky-500 hover:bg-sky-500/80 text-white",
  };
  return <Badge className={`${styleMap[priority]} border-transparent`}>{priority}</Badge>;
};

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseID as string;
  const caseData = mockCasesData.find((c) => c.caseId === caseId);

  // State for Investigator Notes
  const [notes, setNotes] = useState<INote[]>(caseData?.investigatorNotes || []);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim() === "") return;
    const note: INote = {
      id: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      author: "Admin User", // In a real app, this would be the logged-in user
      note: newNote,
    };
    setNotes([...notes, note]);
    setNewNote("");
  };

  if (!caseData) {
    return (
      <div>
        <TopNavBar />
        <main className="p-4 md:p-8">
          <h1 className="text-2xl font-bold">Case not found.</h1>
        </main>
      </div>
    );
  }

  const attachmentIcons = {
    Image: <Image className="h-5 w-5" />,
    Video: <Video className="h-5 w-5" />,
    Audio: <FileAudio className="h-5 w-5" />,
    Document: <FileText className="h-5 w-5" />,
  };

  return (
    <div>
      <TopNavBar />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Top-of-Page Prominence Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {caseData.caseId}: <span className="text-muted-foreground">{caseData.crimeType}</span>
            </h1>
            <div className="flex items-center gap-2">
              <Button>Assign</Button>
              <Button variant="secondary">Change Status</Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
            <PriorityBadge priority={caseData.priority} />
            <a href="#" className="flex items-center gap-2 hover:text-primary">
              <MapPin className="h-4 w-4" /> {caseData.location}
            </a>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Incident: {new Date(caseData.submittedAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              {caseData.attachments.map((att) => (
                <span key={att.id} title={`${att.type}: ${att.fileName}`}>{attachmentIcons[att.type]}</span>
              ))}
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap">{caseData.incident_description}</p></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Timeline / Chronology</CardTitle></CardHeader>
              <CardContent>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>
                  {caseData.timeline.map((event, index) => (
                    <div key={index} className="relative mb-6">
                      <div className="absolute -left-1.5 top-1.5 size-3 rounded-full bg-primary -translate-x-1/2"></div>
                      <p className="font-semibold">{event.event}</p>
                      <p className="text-sm text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                      {event.user && <p className="text-xs text-muted-foreground">By: {event.user}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Attachments / Media</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {caseData.attachments.map(att => (
                  <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="group block aspect-square bg-muted rounded-lg overflow-hidden">
                    {att.type === 'Image' ? <img src={att.url} alt={att.fileName} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        {attachmentIcons[att.type]}
                        <span className="text-xs mt-2 text-center break-all px-1">{att.fileName}</span>
                      </div>
                    )}
                  </a>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Investigator Notes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {notes.map(note => (
                    <div key={note.id} className="p-3 bg-muted rounded-md text-sm">
                      <p className="whitespace-pre-wrap">{note.note}</p>
                      <p className="text-xs text-muted-foreground mt-2 text-right">
                        - {note.author} on {new Date(note.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Textarea placeholder="Add a new note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                  <Button onClick={handleAddNote} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Note</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* --- REPORTER INFO CARD HAS BEEN REMOVED --- */}
            
            <Card>
                <CardHeader><CardTitle>Location & Map</CardTitle></CardHeader>
                <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Map Placeholder</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Options to view nearby cases or layer on other data can be added here.</p>
                </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Suspect(s) & Victim(s)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {caseData.personsInvolved.map(person => (
                  <div key={person.id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="flex items-center gap-2"><User className="h-4 w-4" /> {person.name} {person.age && `(Age: ${person.age})`}</strong>
                      <Badge variant={person.type === 'Suspect' ? 'destructive' : 'secondary'}>{person.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{person.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}