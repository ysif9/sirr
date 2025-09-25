"use client";

import TopNavBar from "@/components/top-nav-bar";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  GridReadyEvent,
  RowClickedEvent,
  ValueFormatterParams,
} from "ag-grid-community";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { Loader2, AlertTriangle } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

// Interface updated to match the new fields from the API
interface ICaseFromApi {
  id: string;
  created_at: string;
  status: string;
  score: number;
  last_access_by_reporter: string | null;
}

export default function CasesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [rowData, setRowData] = useState<ICaseFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      if (!isAuthenticated) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/reports/");
        setRowData(response.data.results || []);
      } catch (err) {
        console.error("Failed to fetch cases:", err);
        setError("Failed to load case data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [isAuthenticated]);

  // Column definitions updated to match the requirements
  const colDefs: ColDef<ICaseFromApi>[] = [
    {
      headerName: "",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      resizable: false,
      filter: false,
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 220,
      valueFormatter: (params: ValueFormatterParams) =>
        params.value ? new Date(params.value).toLocaleString() : "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      // Example of cell styling based on value
      cellStyle: params => {
        if (params.value === 'submitted') {
            return { color: 'white', backgroundColor: '#3b82f6' };
        }
        return null;
      }
    },
    { field: "score", headerName: "Score", width: 100 },
    {
      field: "last_access_by_reporter",
      headerName: "Last Access",
      width: 220,
      valueFormatter: (params: ValueFormatterParams) =>
        params.value ? new Date(params.value).toLocaleString() : "N/A",
    },
    { field: "id", headerName: "Case ID", flex: 1, minWidth: 250 },
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  };

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.applyColumnState({
      state: [{ colId: "created_at", sort: "desc" }],
      defaultState: { sort: null },
    });
  }, []);

  const handleRowClick = useCallback(
    (event: RowClickedEvent<ICaseFromApi>) => {
      if (event.data) {
        router.push(`/cases/${event.data.id}`);
      }
    },
    [router]
  );

  const renderGrid = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading cases...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="mt-4 text-destructive-foreground">{error}</p>
        </div>
      );
    }
    return (
      <AgGridReact<ICaseFromApi>
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        rowSelection="multiple"
        onRowClicked={handleRowClick}
        pagination={true}
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
      />
    );
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
          {renderGrid()}
        </div>
      </main>
    </div>
  );
}