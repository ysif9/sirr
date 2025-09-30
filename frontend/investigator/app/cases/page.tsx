"use client";

import TopNavBar from "@/components/top-nav-bar";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  ValueFormatterParams,
  ICellRendererParams,
  CellValueChangedEvent,
  CellClickedEvent,
  ITooltipParams,
  ValueGetterParams,
} from "ag-grid-community";
import { useState, useCallback, useEffect, FC, useMemo, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { Loader2, AlertTriangle, Star, Paperclip, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

ModuleRegistry.registerModules([AllCommunityModule]);

// Interface updated to match the new API response for the case list
interface ICaseFromApi {
  id: string;
  important: boolean;
  label: string | null;
  status: "new" | "opened" | "closed";
  created_at: string; // Submission Date
  last_access_date: string | null;
  attachment_count: number;
}

// --- Custom Cell Renderers ---

const ImportantCellRenderer: FC<ICellRendererParams<ICaseFromApi, boolean>> = ({ value }) => {
  const isImportant = !!value;

  return (
    <div className="flex h-full items-center justify-center">
      <button
        aria-label={isImportant ? "Mark as not important" : "Mark as important"}
        title={isImportant ? "Mark as not important" : "Mark as important"}
        className="p-1"
      >
        {isImportant ? (
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />
        ) : (
          <Star className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-yellow-500" />
        )}
      </button>
    </div>
  );
};

const StatusCellRenderer: FC<ICellRendererParams<ICaseFromApi, ICaseFromApi["status"]>> = ({ value }) => {
  if (!value) return null;

  const statusMap: Record<string, { text: string; className: string }> = {
    new: { text: "New", className: "bg-blue-500 hover:bg-blue-600" },
    opened: { text: "Opened", className: "bg-amber-500 hover:bg-amber-600" },
    closed: { text: "Closed", className: "bg-green-600 hover:bg-green-700" },
  };

  const statusInfo = statusMap[value] || { text: value.charAt(0).toUpperCase() + value.slice(1), className: "bg-gray-500" };

  return (
    <div className="flex h-full items-center">
      <span
        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-center text-xs font-semibold uppercase leading-none text-white ${statusInfo.className}`}
      >
        {statusInfo.text}
      </span>
    </div>
  );
};

const AttachmentCountCellRenderer: FC<ICellRendererParams<ICaseFromApi, number>> = ({ value }) => {
  const count = value ?? 0;

  if (count > 0) {
    return (
      <div className="flex h-full items-center" title={`${count} attachment(s)`}>
        <Paperclip className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{count}</span>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center">
      <span className="text-sm text-muted-foreground">0</span>
    </div>
  );
};

/**
 * Minimal icon-only "Open" button renderer
 * - Small, icon-only button (uses Button size="icon" variant="ghost" from your UI)
 * - Uses title + aria-label for an accessible tooltip
 * - Stops event propagation so row click/selection isn't triggered
 */
const OpenCaseCellRenderer: FC<ICellRendererParams<ICaseFromApi>> = ({ data }) => {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // prevent any other row click events
    if (data) {
      router.push(`/cases/${data.id}`);
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        title="Open case"
        aria-label={`Open case ${data?.id ?? ""}`}
        className="p-1"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function CasesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [rowData, setRowData] = useState<ICaseFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);

  const fetchCases = useCallback(async () => {
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
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleUpdate = useCallback(async (id: string, field: string, value: any) => {
    try {
      await apiClient.patch(`/reports/${id}/`, { [field]: value });
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      // NOTE: In a real app, you would show a toast notification and revert the grid data.
    }
  }, []);

  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ICaseFromApi>) => {
      if (event.oldValue !== event.newValue) {
        handleUpdate(event.data.id, event.colDef.field!, event.newValue);
      }
    },
    [handleUpdate]
  );

  const onCellClicked = useCallback(
    (event: CellClickedEvent<ICaseFromApi>) => {
      if (event.colDef.field === "important" && event.data) {
        const currentStatus = !!event.value;
        const newStatus = !currentStatus;
        // Optimistically update the UI
        event.node.setDataValue("important", newStatus);
        // Fire off the API request
        handleUpdate(event.data.id, "important", newStatus);
      }
    },
    [handleUpdate]
  );

  const filteredData = useMemo(() => {
    return showOnlyImportant ? rowData.filter((row) => row.important) : rowData;
  }, [rowData, showOnlyImportant]);

  // --- Column Definitions ---
  const colDefs: ColDef<ICaseFromApi>[] = useMemo(
    () => [
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        resizable: false,
        pinned: "left",
        filter: false,
      },
      {
        headerName: "Action",
        cellRenderer: OpenCaseCellRenderer,
        width: 80, // tightened width since it's now an icon-only action
        resizable: false,
        sortable: false,
        filter: false,
        pinned: "left",
      },
      {
        field: "important",
        headerName: "",
        cellRenderer: ImportantCellRenderer,
        width: 60,
        resizable: false,
        sortable: false,
        filter: false,
        pinned: "left",
        cellClass: "group flex justify-center",
        headerTooltip: "Mark as important",
      },
      {
        headerName: "Report #",
        // guard against node.rowIndex being null/undefined
        valueGetter: (params: ValueGetterParams<ICaseFromApi>) => {
          const idx = params.node?.rowIndex;
          return typeof idx === "number" && idx >= 0 ? idx + 1 : "";
        },
        minWidth: 120,
        flex: 1,
      },
      {
        field: "label",
        headerName: "Label",
        editable: true,
        minWidth: 150,
        flex: 1,
        valueFormatter: (params) => params.value || "",
        cellEditor: "agTextCellEditor",
        cellEditorPopup: true,
        cellClass: (params) => (!params.value ? "italic text-muted-foreground" : ""),
        cellRenderer: (params: { value: any }) => (params.value ? params.value : "Add label"),
      },
      {
        field: "status",
        headerName: "Status",
        cellRenderer: StatusCellRenderer,
        minWidth: 120,
        flex: 1,
      },
      {
        field: "attachment_count",
        headerName: "Attachments",
        cellRenderer: AttachmentCountCellRenderer,
        width: 130,
      },
      {
        field: "created_at",
        headerName: "Submission Date & Time",
        minWidth: 220,
        sort: "desc",
        valueFormatter: (params: ValueFormatterParams) =>
          params.value ? new Date(params.value).toLocaleString() : "N/A",
        tooltipValueGetter: (params: ITooltipParams) => params.value,
      },
      {
        field: "last_access_date",
        headerName: "Last Access Date & Time",
        minWidth: 220,
        valueFormatter: (params: ValueFormatterParams) =>
          params.value ? new Date(params.value).toLocaleString() : "N/A",
        tooltipValueGetter: (params: ITooltipParams) => params.value,
      },
    ],
    []
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const handleRefresh = () => {
    fetchCases();
  };

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
        rowData={filteredData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        onCellClicked={onCellClicked}
        pagination={true}
        paginationPageSize={20}
        enableBrowserTooltips={true}
        suppressRowClickSelection={true}
        quickFilterText={quickFilterText}
      />
    );
  };

  return (
    <div>
      <TopNavBar />
      <main className="p-4 md:p-8">
        <h1 className="mb-6 text-3xl font-bold">Case Files</h1>
        <div className="mb-4 flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search reports..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            className="max-w-xs"
          />
          <Button
            variant={showOnlyImportant ? "secondary" : "outline"}
            onClick={() => setShowOnlyImportant((prev) => !prev)}
            title={showOnlyImportant ? "Show all cases" : "Show only important cases"}
          >
            <Star className="mr-2 h-4 w-4" />
            {showOnlyImportant ? "Show All" : "Only Important"}
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="ag-theme-quartz" style={{ height: "calc(100vh - 15rem)", width: "100%" }}>
          {renderGrid()}
        </div>
      </main>
    </div>
  );
}