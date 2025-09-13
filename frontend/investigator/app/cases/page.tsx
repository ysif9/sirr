"use client";

import TopNavBar from "@/components/top-nav-bar";
import "ag-grid-community/styles/ag-theme-quartz.css"; // Core CSS
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  GridReadyEvent,
  ICellRendererParams,
  RowClickedEvent, // Import RowClickedEvent
} from "ag-grid-community";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
// NEW: Import mock data and types from external files
import { mockCasesData, ICaseInfo, Priority } from "@/lib/mock-data";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom Cell Renderer Component for Priority (no changes here)
const PriorityCellRenderer = (
  params: ICellRendererParams<ICaseInfo, Priority>
) => {
  if (!params.value) return null;
  const priority = params.value;
  let colorClass = "";
  switch (priority) {
    case "Critical":
      colorClass = "bg-red-500";
      break;
    case "High":
      colorClass = "bg-orange-400";
      break;
    case "Medium":
      colorClass = "bg-yellow-400";
      break;
    case "Low":
      colorClass = "bg-sky-500";
      break;
  }
  return (
    <div className="flex items-center gap-2 h-full">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass}`}
      ></span>
      <span>{priority}</span>
    </div>
  );
};

// Custom Comparator for Priority Sorting (no changes here)
const priorityOrder: { [key in Priority]: number } = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};
const priorityComparator = (valueA: Priority, valueB: Priority) => {
  const rankA = priorityOrder[valueA] || 5;
  const rankB = priorityOrder[valueB] || 5;
  return rankA - rankB;
};

export default function CasesPage() {
  const router = useRouter(); // Initialize router
  const [rowData] = useState<ICaseInfo[]>(mockCasesData);

  // Column Definitions (no changes here)
  const colDefs: ColDef<ICaseInfo>[] = [
    {
      headerName: "",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: "left",
      lockPosition: "left",
      suppressMovable: true,
      filter: false,
    },
    {
      field: "priority",
      headerName: "Priority",
      cellRenderer: PriorityCellRenderer,
      comparator: priorityComparator,
      width: 120,
    },
    { field: "caseId", headerName: "Case ID", width: 140 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "crimeType", headerName: "Crime Type", flex: 2, minWidth: 200 },
    { field: "location", headerName: "Location", flex: 1, minWidth: 150 },
    {
      field: "submittedAt",
      headerName: "Submitted At",
      flex: 1,
      minWidth: 200,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString() : "",
    },
    { field: "assignedTo", headerName: "Assigned To", flex: 1, minWidth: 150 },
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  };

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.setFilterModel({
      status: {
        filterType: "text",
        type: "notEqual",
        filter: "Closed",
      },
    });
    params.api.applyColumnState({
      state: [
        { colId: "submittedAt", sort: "desc", sortIndex: 0 },
        { colId: "priority", sort: "asc", sortIndex: 1 },
      ],
      defaultState: { sort: null },
    });
  }, []);

  // --- NEW: ROW CLICK HANDLER ---
  const handleRowClick = useCallback(
    (event: RowClickedEvent<ICaseInfo>) => {
      if (event.data) {
        router.push(`/cases/${event.data.caseId}`);
      }
    },
    [router]
  );

  return (
    <div>
      <TopNavBar />
      <main className="p-4 md:p-8">
        <h1 className="mb-6 text-3xl font-bold">Case Files</h1>
        <div
          className="ag-theme-quartz"
          style={{ height: "calc(100vh - 12rem)", width: "100%" }}
        >
          <AgGridReact<ICaseInfo>
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            onRowClicked={handleRowClick} // Add this event handler
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
          />
        </div>
      </main>
    </div>
  );
}