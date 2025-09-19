import { crimeTypeList } from "./crime-types";
import { v4 as uuidv4 } from 'uuid'; // You'll need to install uuid: npm install uuid @types/uuid

// --- NEW DETAILED INTERFACES ---

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "New" | "Assigned" | "Active" | "Closed" | "Flagged for Review";
export type PersonType = "Suspect" | "Victim" | "Witness";
export type AttachmentType = "Image" | "Video" | "Audio" | "Document";

export interface IReporter {
  name: string;
  contact: string;
  isAnonymous: boolean;
  reportingHistory: number;
  credibilityScore: number;
}

export interface ITimelineEvent {
  timestamp: string;
  event: string;
  user?: string;
}

export interface IPerson {
  id: string;
  type: PersonType;
  name: string;
  age?: number;
  description: string;
}

export interface IAttachment {
  id: string;
  type: AttachmentType;
  fileName: string;
  url: string;
  timestamp: string;
}

export interface INote {
  id: string;
  timestamp: string;
  author: string;
  note: string;
}

// --- EXPANDED ICaseInfo INTERFACE ---
export interface ICaseInfo {
  // Core list fields
  priority: Priority;
  caseId: string;
  status: Status;
  crimeType: string;
  location: string;
  submittedAt: string; // Incident Timestamp
  assignedTo: string;

  // New detail fields
  reportedAt: string; // Submission Timestamp
  incident_description: string;
  reporter: IReporter;
  timeline: ITimelineEvent[];
  personsInvolved: IPerson[];
  attachments: IAttachment[];
  investigatorNotes: INote[];
}

// Helper functions for data generation
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Helper to format crime type string from snake_case to Title Case
const formatCrimeType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


// --- UPDATED MOCK DATA GENERATION ---

export const generateMockCases = (count: number): ICaseInfo[] => {
  const cases: ICaseInfo[] = [];
  const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];
  const statuses: Status[] = ["New", "Assigned", "Active", "Closed", "Flagged for Review"];
  const investigators = ["Jane Smith", "Harvey Specter", "Mike Ross", "Olivia Benson", "Elliot Stabler", "Unassigned"];
  const locations = ["123 Maple St", "456 Oak Ave", "Downtown Core", "North Park", "Southside District", "West End", "The Marina"];
  const reporterNames = ["John Doe", "Anonymous", "Samantha Ray", "Michael Chen", "Emily White"];
  const noteAuthors = ["Det. Miller", "Sgt. Jones", "Admin", "Forensics"];

  for (let i = 0; i < count; i++) {
    const incidentDate = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    const reportedDate = new Date(incidentDate.getTime() + Math.random() * (24 * 60 * 60 * 1000)); // Reported within 24h of incident
    const caseId = `C24-${String(1234 + i).padStart(6, "0")}`;
    const assignedTo = getRandomElement(investigators);
    const reporterName = getRandomElement(reporterNames);

    cases.push({
      priority: getRandomElement(priorities),
      caseId: caseId,
      status: getRandomElement(statuses),
      crimeType: formatCrimeType(getRandomElement(crimeTypeList)),
      location: getRandomElement(locations),
      submittedAt: incidentDate.toISOString(),
      reportedAt: reportedDate.toISOString(),
      assignedTo: assignedTo,
      
      incident_description: "A detailed narrative of the incident goes here. The reporter described seeing two individuals arguing near the main intersection. The argument escalated, and one individual was seen pushing the other to the ground before fleeing the scene. The reporting party was approximately 50 feet away and could provide a general description of the suspect.",
      
      reporter: {
        name: reporterName,
        contact: reporterName === "Anonymous" ? "N/A" : `user${i}@example.com`,
        isAnonymous: reporterName === "Anonymous",
        reportingHistory: Math.floor(Math.random() * 5),
        credibilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
      },

      timeline: [
        { timestamp: incidentDate.toISOString(), event: "Incident Occurred" },
        { timestamp: reportedDate.toISOString(), event: "Case Reported", user: reporterName },
        { timestamp: new Date(reportedDate.getTime() + 3600*1000).toISOString(), event: "Case Triaged", user: "System" },
        ...(assignedTo !== "Unassigned" ? [{ timestamp: new Date(reportedDate.getTime() + 2 * 3600 * 1000).toISOString(), event: "Case Assigned", user: "Admin" }] : []),
      ],

      personsInvolved: [
        { id: uuidv4(), type: "Victim", name: "Jane Doe", age: 34, description: "Wearing a red jacket and blue jeans. Appeared distressed." },
        { id: uuidv4(), type: "Suspect", name: "Unknown", description: "Male, approx. 6' tall, wearing a dark hoodie and black pants. Fled east on Main St." },
      ],

      attachments: [
        { id: uuidv4(), type: "Image", fileName: "scene_photo_1.jpg", url: `https://picsum.photos/seed/${caseId}1/400/300`, timestamp: reportedDate.toISOString() },
        { id: uuidv4(), type: "Video", fileName: "bystander_video.mp4", url: "#", timestamp: reportedDate.toISOString() },
      ],

      investigatorNotes: [
        { id: uuidv4(), timestamp: new Date(reportedDate.getTime() + 3 * 3600*1000).toISOString(), author: "Det. Miller", note: "Initial review complete. Will attempt to contact RP for more details." }
      ]
    });
  }
  return cases;
};

// Pre-generate the data so the component doesn't regenerate on every render
export const mockCasesData = generateMockCases(100);