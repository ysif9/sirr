import TopNavBar from "@/components/top-nav-bar";

const mockCases = [
  {
    id: "CS-2024-001",
    subject: "Financial Fraud Investigation",
    status: "Open",
    priority: "High",
  },
  {
    id: "CS-2024-002",
    subject: "Cybersecurity Breach at Sector 7",
    status: "In Progress",
    priority: "Critical",
  },
  {
    id: "CS-2024-003",
    subject: "Internal Affairs Review - Q2",
    status: "Closed",
    priority: "Low",
  },
  {
    id: "CS-2024-004",
    subject: "Counter-intelligence Operation 'Phoenix'",
    status: "On Hold",
    priority: "Medium",
  },
];

export default function CasesPage() {
  return (
    <div>
      <TopNavBar />
      <main className="p-4 md:p-8">
        <h1 className="mb-6 text-3xl font-bold">Case Files</h1>
        <div className="rounded-lg border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Case ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Subject
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Priority
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {mockCases.map((caseItem) => (
                  <tr key={caseItem.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">
                      {caseItem.id}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {caseItem.subject}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {caseItem.priority}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {caseItem.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}