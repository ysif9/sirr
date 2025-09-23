// START OF lib/mock-data.ts
import { crimeTypeList } from "./crime-types";
import { v4 as uuidv4 } from 'uuid';

// --- NEW/UPDATED INTERFACES ---

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "New" | "Assigned" | "Active" | "Closed" | "Flagged for Review";
export type PersonType = "Suspect" | "Victim" | "Witness";
export type AttachmentType = "Image" | "Video" | "Audio" | "Document";
export type LogType = "Interview" | "Evidence Collection" | "Canvass" | "Communication" | "Analyst Report" | "General";

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

export interface IVehicle {
  id: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  description: string;
}

export interface INote {
  id: string;
  timestamp: string;
  author: string;
  logType: LogType;
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
  reporter: IReporter;
  timeline: ITimelineEvent[];
  personsInvolved: IPerson[];
  attachments: IAttachment[];
  investigatorNotes: INote[];
  vehicles: IVehicle[];
  
  // New fields for dynamic form rendering
  formKey: {
    reportTypeKey: string;
    categoryKey: string;
    formKey: string;
  };
  formData: { [key: string]: any; };
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
  const locations = ["123 Maple St, North Park", "456 Oak Ave, Downtown", "789 Pine Ln, Southside", "101 River Rd, West End"];
  const reporterNames = ["John Doe", "Anonymous", "Samantha Ray", "Michael Chen"];
  const noteAuthors = ["Det. Miller", "Sgt. Jones", "Forensics Unit", "Capt. Rodriguez"];
  const logTypes: LogType[] = ["Interview", "Evidence Collection", "Canvass", "Communication", "Analyst Report", "General"];

  for (let i = 0; i < count; i++) {
    const incidentDate = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    const reportedDate = new Date(incidentDate.getTime() + Math.random() * (24 * 60 * 60 * 1000));
    const caseId = `VC2023-${String(891 + i).padStart(4, "0")}`;
    const assignedTo = getRandomElement(investigators);
    const reporterName = getRandomElement(reporterNames);

    cases.push({
      priority: getRandomElement(priorities),
      caseId: caseId,
      status: getRandomElement(statuses),
      // For consistency, let's use the burglary form for all mock cases
      crimeType: "Report a Burglary / Break-in",
      location: getRandomElement(locations),
      submittedAt: incidentDate.toISOString(),
      reportedAt: reportedDate.toISOString(),
      assignedTo: assignedTo,
      
      reporter: {
        name: reporterName,
        contact: reporterName === "Anonymous" ? "N/A" : `user${i}@example.com`,
        isAnonymous: reporterName === "Anonymous",
        reportingHistory: Math.floor(Math.random() * 5),
        credibilityScore: Math.floor(Math.random() * 40) + 60,
      },

      timeline: [
        { timestamp: incidentDate.toISOString(), event: "Incident Occurred" },
        { timestamp: reportedDate.toISOString(), event: "Case Reported", user: reporterName },
        { timestamp: new Date(reportedDate.getTime() + 3600*1000).toISOString(), event: "Case Triaged", user: "System" },
        ...(assignedTo !== "Unassigned" ? [{ timestamp: new Date(reportedDate.getTime() + 2 * 3600 * 1000).toISOString(), event: "Case Assigned", user: "Admin" }] : []),
      ],

      personsInvolved: [
        { id: uuidv4(), type: "Victim", name: "Jane Doe", age: 34, description: "Homeowner, discovered the break-in." },
        { id: uuidv4(), type: "Witness", name: "Bob Neighbor", description: "Saw a suspicious vehicle around the time of the incident." },
      ],
      
      vehicles: [
          {id: uuidv4(), make: "Ford", model: "Transit", licensePlate: "AB12 3CD", description: "White van seen leaving the area hastily. Reported by witness."}
      ],

      attachments: [
        { id: uuidv4(), type: "Image", fileName: "doorbell_cam.jpg", url: `https://picsum.photos/seed/${caseId}1/400/300`, timestamp: reportedDate.toISOString() },
        { id: uuidv4(), type: "Image", fileName: "forced_entry.jpg", url: `https://picsum.photos/seed/${caseId}2/400/300`, timestamp: reportedDate.toISOString() },
        { id: uuidv4(), type: "Video", fileName: "security_footage.mp4", url: "#", timestamp: reportedDate.toISOString() },
      ],

      investigatorNotes: [
        { id: uuidv4(), timestamp: new Date(reportedDate.getTime() + 8 * 3600*1000).toISOString(), author: "Det. Miller", logType: "Canvass", note: "Conducted neighborhood canvass. Spoke with witness Bob Neighbor who reported seeing a white van. No other witnesses came forward." },
        { id: uuidv4(), timestamp: new Date(reportedDate.getTime() + 4 * 3600*1000).toISOString(), author: "Sgt. Jones", logType: "Evidence Collection", note: "Forensics team collected fingerprints from the point of entry. Evidence submitted to lab." },
        { id: uuidv4(), timestamp: new Date(reportedDate.getTime() + 3 * 3600*1000).toISOString(), author: "Det. Miller", logType: "Interview", note: "Initial interview with victim completed. Victim is compiling a list of stolen items." }
      ],

      // Corresponds to lib/crime-forms.ts -> theftBurglaryFormSteps
      formKey: {
        reportTypeKey: "report_a_crime",
        categoryKey: "theft_burglary_property_damage",
        formKey: "burglary_break_in",
      },
      formData: {
        location: "123 Maple St, North Park",
        property_type: "House",
        time_discovered: incidentDate.toISOString(),
        was_anything_stolen: "Yes",
        stolen_items: [
            { item_name: "MacBook Pro 16\"", item_value: 2500, item_description: "Serial: C02Z1234ABCD" },
            { item_name: "Assorted Jewelry", item_value: 5000, item_description: "Gold necklace, diamond earrings" },
        ],
        was_anything_damaged: "Yes",
        damage_description: "Back door frame was splintered during forced entry. Window pane on the door was shattered.",
        suspect_info: "Witness saw one individual, male, wearing dark clothing and a baseball cap, getting into a white van.",
        vehicle_involved: "Yes",
        vehicle_description: "White Ford Transit van, possibly late model. Partial license plate might be AB12.",
        evidence_upload: true, // Indicates files were uploaded
        witness_present: "Yes"
      }
    });
  }
  return cases;
};

// Pre-generate the data so the component doesn't regenerate on every render
export const mockCasesData = generateMockCases(20);
// END OF lib/mock-data.ts