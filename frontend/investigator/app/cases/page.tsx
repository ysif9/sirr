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
} from "ag-grid-community";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { Loader2, AlertTriangle } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

// Interface for the data coming from the API list view
interface ICaseFromApi {
  id: string;
  status: string;
  priority: string;
  // associated_data might contain more info, but is not in ReportListSerializer
  // We will adapt the grid to show what we have.
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
        // Wait for auth check to complete before fetching
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/reports/");
        // The API returns data in a paginated format under the 'results' key
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

  const colDefs: ColDef<ICaseFromApi>[] = [
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
    },
    { field: "id", headerName: "Case ID", flex: 1, minWidth: 300 },
    { field: "status", headerName: "Status", flex: 1, minWidth: 150 },
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  };

  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Default sorting can be applied here if needed
    params.api.applyColumnState({
      state: [{ colId: "priority", sort: "asc", sortIndex: 0 }],
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