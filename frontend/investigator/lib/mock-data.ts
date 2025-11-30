// START OF lib/mock-data.ts
import { v4 as uuidv4 } from 'uuid';

// --- TYPE DEFINITIONS FOR API AND UI ---

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "New" | "Assigned" | "Active" | "Closed" | "Flagged for Review";
export type AttachmentType = "Image" | "Video" | "Audio" | "Document";

// Represents an attachment as provided by the backend API
export interface IApiAttachment {
  id: string;
  file: string; // URL to the encrypted file blob
  description: string;
  nonce: string; // Base64 encoded nonce
  mime_type: string;
  file_extension: string;
}

// Represents the AI analysis data from the backend
export interface IAIAnalysis {
  is_spam: boolean;
  confidence: number;
  analyzed_at: string;
  model_version: string;
  spam_reasoning: string;
  urgency: string; // e.g., "low", "medium", "high", "critical"
  urgency_reasoning: string;
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

// Represents an investigator note from the backend
export interface IInvestigatorNote {
  id: string;
  report: string;
  author: string;
  author_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

// Represents an encrypted attachment
export interface IAttachment {
  id: string;
  file: string;
  key_envelope: {
    wrapped_key: string;
    reporter_ephemeral_public_key?: string;
    scheme: string;
  };
  nonce: string;
  description?: string;
  checksum?: string;
  mime_type?: string;
  file_extension?: string;
}

// Represents a reporter note from the backend
export interface IReporterNote {
  id: string;
  content: string;
  attachments: IAttachment[];
  created_at: string;
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

  // AI Analysis Data
  analysis: IAIAnalysis | null;

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
