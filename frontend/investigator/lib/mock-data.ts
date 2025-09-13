import { crimeTypeList } from "./crime-types";

// Define types based on requirements
export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "New" | "Assigned" | "Active" | "Closed" | "Flagged for Review";

export interface ICaseInfo {
  priority: Priority;
  caseId: string;
  status: Status;
  crimeType: string;
  location: string;
  submittedAt: string; // ISO string format for dates
  assignedTo: string;
}

// Helper to format crime type string from snake_case to Title Case
const formatCrimeType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "); // Changed from " / " to a space
};

// Generate realistic mock data
export const generateMockCases = (count: number): ICaseInfo[] => {
  const cases: ICaseInfo[] = [];
  const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];
  const statuses: Status[] = [
    "New",
    "Assigned",
    "Active",
    "Closed",
    "Flagged for Review",
  ];
  const investigators = [
    "Jane Smith",
    "Harvey Specter",
    "Mike Ross",
    "Olivia Benson",
    "Elliot Stabler",
    "Unassigned",
  ];
  const locations = [
    "123 Maple St",
    "456 Oak Ave",
    "Downtown Core",
    "North Park",
    "Southside District",
    "West End",
    "The Marina",
  ];

  for (let i = 0; i < count; i++) {
    const date = new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ); // last 30 days
    cases.push({
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      caseId: `C24-${String(1234 + i).padStart(6, "0")}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      crimeType: formatCrimeType(
        crimeTypeList[Math.floor(Math.random() * crimeTypeList.length)]
      ),
      location: locations[Math.floor(Math.random() * locations.length)],
      submittedAt: date.toISOString(),
      assignedTo:
        investigators[Math.floor(Math.random() * investigators.length)],
    });
  }
  return cases;
};

// Pre-generate the data so the component doesn't regenerate on every render
export const mockCasesData = generateMockCases(100);