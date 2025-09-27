// START OF lib/mock-data.ts
import { v4 as uuidv4 } from 'uuid';

// --- TYPE DEFINITIONS FOR API AND UI ---

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "New" | "Assigned" | "Active" | "Closed" | "Flagged for Review";
export type PersonType = "Suspect" | "Victim" | "Witness";
export type AttachmentType = "Image" | "Video" | "Audio" | "Document";
export type LogType = "Interview" | "Evidence Collection" | "Canvass" | "Communication" | "Analyst Report" | "General";

// Represents an attachment as provided by the backend API
export interface IApiAttachment {
  id: string;
  file: string; // URL to the encrypted file blob
  description: string;
  nonce: string; // Base64 encoded nonce
  mime_type: string;
  file_extension: string;
}

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

// The primary data structure for the case detail view in the UI
export interface ICaseInfo {
  // Core fields
  priority: Priority;
  caseId: string;
  status: string;
  crimeType: string;
  location: string;
  submittedAt: string;
  assignedTo: string;
  reportedAt: string;
  reporter: IReporter;

  // Dynamic/Complex fields
  timeline: ITimelineEvent[];
  personsInvolved: IPerson[];
  vehicles: IVehicle[];
  investigatorNotes: INote[];
  
  // Data for decryption and form rendering
  attachments: IApiAttachment[];
  attachmentKeys: { [attachmentId: string]: string }; // map of attachmentId -> base64 key
  formKey: {
    reportTypeKey: string;
    categoryKey: string;
    formKey: string;
  };
  formData: { [key: string]: any; };
}
// END OF lib/mock-data.ts