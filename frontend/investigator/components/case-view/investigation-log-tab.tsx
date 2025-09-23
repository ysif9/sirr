// START OF components/case-view/investigation-log-tab.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ICaseInfo, LogType } from "@/lib/mock-data";

// Import the Timeline components
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";

interface InvestigationLogTabProps {
  caseData: ICaseInfo;
}

const logTypeColors: { [key in LogType]: string } = {
  Interview: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Evidence Collection": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Canvass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Communication: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Analyst Report": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  General: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export default function InvestigationLogTab({ caseData }: InvestigationLogTabProps) {
  // Use a unique key for each log from caseData to avoid issues with React's list rendering
  // Add a default logType if none is provided in mock data for consistency with LogType enum
  const initialLogsWithLogType = caseData.investigatorNotes.map(note => ({
    ...note,
    logType: note.logType || "General" // Ensure all notes have a logType
  }));
  const [logs, setLogs] = useState(initialLogsWithLogType);
  const [filter, setFilter] = useState<LogType | "All">("All");
  const [newLogText, setNewLogText] = useState("");
  const [newLogType, setNewLogType] = useState<LogType>("General");

  const filteredLogs = logs
    .filter((log) => filter === "All" || log.logType === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const logTypes: LogType[] = ["Interview", "Evidence Collection", "Canvass", "Communication", "Analyst Report", "General"];

  const handleAddLog = () => {
    if (newLogText.trim() === "") return;
    const newLogEntry = {
      id: new Date().toISOString(), // Simple unique ID for mock
      timestamp: new Date().toISOString(),
      author: "Admin User", // Placeholder for current user
      logType: newLogType,
      note: newLogText,
    };
    setLogs((prevLogs) => [...prevLogs, newLogEntry]);
    setNewLogText("");
    setNewLogType("General");
    // Close dialog - in a real app, you'd manage dialog state
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant={filter === "All" ? "default" : "outline"} size="sm" onClick={() => setFilter("All")}>All</Button>
          {logTypes.map(type => (
             <Button key={type} variant={filter === type ? "default" : "outline"} size="sm" onClick={() => setFilter(type)}>{type}</Button>
          ))}
        </div>
        
        <Dialog>
            <DialogTrigger asChild>
                <Button>+ Add Log Entry</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Log Entry</DialogTitle>
                    <DialogDescription>Record a new event or finding in the investigation timeline.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select value={newLogType} onValueChange={(value: LogType) => setNewLogType(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select log type" />
                        </SelectTrigger>
                        <SelectContent>
                            {logTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Textarea 
                        placeholder="Write your detailed notes here..." 
                        rows={8} 
                        value={newLogText} 
                        onChange={(e) => setNewLogText(e.target.value)} 
                    />
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleAddLog}>Save Entry</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      
      {/* START: Timeline Component Integration */}
      <Timeline>
        {filteredLogs.map((log) => (
          <TimelineItem key={log.id} className="group-data-[orientation=vertical]/timeline:sm:ms-40" step={0}>
            <TimelineHeader>
              <TimelineSeparator />
              <TimelineDate className="group-data-[orientation=vertical]/timeline:sm:absolute group-data-[orientation=vertical]/timeline:sm:-left-40 group-data-[orientation=vertical]/timeline:sm:w-32 group-data-[orientation=vertical]/timeline:sm:text-right">
                {new Date(log.timestamp).toLocaleString()}
              </TimelineDate>
              <TimelineTitle className="sm:-mt-0.5 flex items-center gap-3">
                 <span className="font-semibold text-sm">{log.author}</span>
                 <Badge className={`${logTypeColors[log.logType]} border-transparent`}>{log.logType}</Badge>
              </TimelineTitle>
              <TimelineIndicator />
            </TimelineHeader>
            <TimelineContent className="p-4 bg-muted rounded-lg border">
              <p className="text-sm whitespace-pre-wrap">{log.note}</p>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
      {/* END: Timeline Component Integration */}
    </div>
  );
}
// END OF components/case-view/investigation-log-tab.tsx