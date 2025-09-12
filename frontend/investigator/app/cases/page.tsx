"use client";

import TopNavBar from "@/components/top-nav-bar";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useState } from "react";

// Register AG Grid modules globally.
ModuleRegistry.registerModules([AllCommunityModule]);

// New interface for the report data structure
interface IReportInfo {
  ReportInfoID: number;
  ReportInfoLabel: string;
  ReportInfoStatus: 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
  ReportInfoSubmissionDate: string; // Using ISO string format for dates
  ReportInfoUpdateDate: string;
  ReportInfoExpirationDate: string;
  ReportInfoReadReceipt: boolean;
  ReportInfoComments: string;
  ReportInfoFiles: number;
  ReportInfoIdentity: string;
  ReportInfoRecipientCount: number;
}

// New mock data matching the requested columns
const mockReports: IReportInfo[] = [
  {
    ReportInfoID: 101,
    ReportInfoLabel: "Q1 Financial Anomaly Report",
    ReportInfoStatus: "Approved",
    ReportInfoSubmissionDate: "2024-01-15T10:30:00Z",
    ReportInfoUpdateDate: "2024-01-20T14:00:00Z",
    ReportInfoExpirationDate: "2025-01-15T10:30:00Z",
    ReportInfoReadReceipt: true,
    ReportInfoComments: "Reviewed by compliance team. No issues found.",
    ReportInfoFiles: 3,
    ReportInfoIdentity: "Analyst-042",
    ReportInfoRecipientCount: 5,
  },
  {
    ReportInfoID: 102,
    ReportInfoLabel: "Sector 7 Breach Analysis",
    ReportInfoStatus: "In Review",
    ReportInfoSubmissionDate: "2024-02-10T09:00:00Z",
    ReportInfoUpdateDate: "2024-02-11T11:20:00Z",
    ReportInfoExpirationDate: "2025-02-10T09:00:00Z",
    ReportInfoReadReceipt: false,
    ReportInfoComments: "Awaiting feedback from the cybersecurity division.",
    ReportInfoFiles: 8,
    ReportInfoIdentity: "Investigator-007",
    ReportInfoRecipientCount: 3,
  },
  {
    ReportInfoID: 103,
    ReportInfoLabel: "Internal Affairs Q2 Summary",
    ReportInfoStatus: "Submitted",
    ReportInfoSubmissionDate: "2024-03-01T16:45:00Z",
    ReportInfoUpdateDate: "2024-03-01T16:45:00Z",
    ReportInfoExpirationDate: "2025-03-01T16:45:00Z",
    ReportInfoReadReceipt: false,
    ReportInfoComments: "Initial submission for departmental review.",
    ReportInfoFiles: 1,
    ReportInfoIdentity: "Admin-001",
    ReportInfoRecipientCount: 12,
  },
  {
    ReportInfoID: 104,
    ReportInfoLabel: "Operation Phoenix Debrief",
    ReportInfoStatus: "Rejected",
    ReportInfoSubmissionDate: "2024-03-05T12:00:00Z",
    ReportInfoUpdateDate: "2024-03-07T18:10:00Z",
    ReportInfoExpirationDate: "2024-09-05T12:00:00Z",
    ReportInfoReadReceipt: true,
    ReportInfoComments: "Insufficient data. Requires resubmission with more evidence.",
    ReportInfoFiles: 5,
    ReportInfoIdentity: "FieldAgent-013",
    ReportInfoRecipientCount: 2,
  },
];

export default function CasesPage() {
  const [rowData, setRowData] = useState<IReportInfo[]>(mockReports);

  // Updated column definitions for the new data structure
  const [colDefs] = useState<ColDef<IReportInfo>[]>([
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',
      lockPosition: 'left',
      suppressMovable: true,
      filter: false, // Disable filter for the checkbox column
    },
    { field: "ReportInfoID", headerName: "ID", width: 100 },
    { field: "ReportInfoLabel", headerName: "Label", flex: 2, minWidth: 250 },
    { field: "ReportInfoStatus", headerName: "Status", flex: 1, minWidth: 120 },
    {
      field: "ReportInfoSubmissionDate",
      headerName: "Submission Date",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "ReportInfoUpdateDate",
      headerName: "Update Date",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "ReportInfoExpirationDate",
      headerName: "Expiration Date",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "ReportInfoReadReceipt",
      headerName: "Read",
      width: 100,
      // Replaced emoji with text for clarity
      cellRenderer: (params: { value: boolean }) => params.value ? 'Yes' : 'No',
      cellStyle: { textAlign: 'center' }
    },
    { field: "ReportInfoComments", headerName: "Comments", flex: 2, minWidth: 300, tooltipField: "ReportInfoComments" },
    { field: "ReportInfoFiles", headerName: "Files", width: 100 },
    { field: "ReportInfoIdentity", headerName: "Identity", flex: 1, minWidth: 150 },
    { field: "ReportInfoRecipientCount", headerName: "Recipients", width: 120 },
  ]);

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,         // Default filter is true for other columns
    resizable: true,
    floatingFilter: true,
  };

  return (
    <div>
      <TopNavBar />
      <main className="p-4 md:p-8">
        <h1 className="mb-6 text-3xl font-bold">Case Files</h1>
        <div
          className="ag-theme-quartz"
          style={{ height: "calc(100vh - 12rem)", width: "100%" }}
        >
          <AgGridReact<IReportInfo>
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple" // Enable multi-row selection with checkboxes
            suppressRowClickSelection={true} // Prevents row selection when clicking anywhere on the row
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
          />
        </div>
      </main>
    </div>
  );
}