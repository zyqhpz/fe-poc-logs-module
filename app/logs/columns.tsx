import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, GitBranch } from "lucide-react";
import { useState } from "react";

// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const loglevelColorMap: Record<string, string> = {
  ERROR: "bg-red-500/20 text-red-700 border border-red-500/30",
  INFO: "bg-green-500/20 text-green-700 border border-green-500/30",
  WARNING: "bg-yellow-500/20 text-yellow-800 border border-yellow-500/30",
};

export type LogEntry = {
  id: string;
  description: string;
  invoice_no: string;
  invoice_ref: string;
  external_invoice_ref: string;
  process_time_seconds: number;
  level: string;
  service: string;
  response_code: number;
  timestamp: string;
  breakdown: Record<string, any>;
  path: string;
  data: Record<string, any>;
};

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "path",
    header: "Path",
  },
  {
    accessorKey: "process_time_seconds",
    header: "Processed Time (s)",
  },
  {
    accessorKey: "invoice_no",
    header: "Invoice No",
  },
  {
    accessorKey: "invoice_ref",
    header: "Invoice Ref",
  },
  {
    accessorKey: "external_invoice_ref",
    header: "External Invoice Ref",
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const level = row.getValue("level") as string;

      const style =
        loglevelColorMap[level.toUpperCase()] ||
        "bg-gray-500/20 text-gray-700 border border-gray-500/30";

      return (
        <Badge className={`${style} font-medium px-3 py-1`}>
          {level.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "response_code",
    header: "Response Code",
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const log = row.original;
      const requestBody = log?.data?.request?.body || {};
      const logLevelClass =
        loglevelColorMap[log.level.toUpperCase()] ||
        "bg-gray-500/20 text-gray-700 border border-gray-500/30";

      const viewDetails = () => {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw]! w-[90vw]! max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <p>
                  <strong>ID:</strong> {log.id}
                </p>
                <p>
                  <strong>Service:</strong> {log.service}
                </p>
                <p>
                  <strong>Path:</strong> {log.path}
                </p>
                <p>
                  <strong>Level:</strong>{" "}
                  <Badge className={`${logLevelClass} font-medium px-3 py-1`}>
                    {log.level.toUpperCase()}
                  </Badge>
                </p>
                <p>
                  <strong>Response Code:</strong> {log.response_code}
                </p>
                <p>
                  <strong>Timestamp:</strong> {log.timestamp}
                </p>

                <div>
                  <strong>Breakdown:</strong>
                  <pre className="mt-1 rounded-md bg-muted p-2 text-xs overflow-x-auto">
                    {JSON.stringify(log.breakdown ?? {}, null, 2)}
                  </pre>
                </div>

                <div>
                  <strong>Request Body:</strong>
                  <pre className="mt-1 rounded-md bg-muted p-2 text-xs overflow-x-auto">
                    {Object.keys(requestBody).length ? (
                      <SyntaxHighlighter
                        language="json"
                        style={oneDark}
                        wrapLongLines={true}
                      >
                        {JSON.stringify(requestBody ?? {}, null, 2)}
                      </SyntaxHighlighter>
                    ) : (
                      "No request body available."
                    )}
                  </pre>
                </div>

                <div>
                  <strong>Data:</strong>
                  {/* <pre className="mt-1 rounded-md bg-muted p-2 text-xs overflow-x-auto">
                  {JSON.stringify(log.data ?? {}, null, 2)}
                </pre> */}
                  {/* <pre className="mt-1 rounded-md bg-muted p-2 text-xs overflow-x-auto">
                  <ReactJson
                    src={log.data ?? {}}
                    name={false}                   // hide root label
                    theme="rjv-default"            // other nice ones: "monokai", "ocean", "bright"
                    collapsed={false}                  // collapse nested objects
                    displayDataTypes={false}
                    enableClipboard={false}
                  />
                </pre> */}

                  <pre className="mt-1 rounded-md bg-muted p-2 text-xs overflow-x-auto">
                    <SyntaxHighlighter
                      language="json"
                      style={oneDark}
                      wrapLongLines={true}
                    >
                      {JSON.stringify(log.data ?? {}, null, 2)}
                    </SyntaxHighlighter>
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      };

      const tracingDetails = () => {
        const log = row.original;
        const [traceData, setTraceData] = useState<any>(null);
        const [loading, setLoading] = useState(false);

        const handleTrace = async () => {
          try {
            setLoading(true);
            const res = await fetch(`/api/trace/${log.id}`);
            const json = await res.json();
            setTraceData(json);
          } catch (err) {
            console.error("Trace fetch failed:", err);
          } finally {
            setLoading(false);
          }
        };

        const logBox = (key: string, data: any) => (
          <div className="mb-4" key={key}>
            <h3 className="mb-2 font-semibold">{key}</h3>
            <pre className="rounded-md bg-muted p-2 text-xs overflow-x-auto">
              <SyntaxHighlighter
                language="json"
                style={oneDark}
                wrapLongLines={true}
              >
                {JSON.stringify(data ?? {}, null, 2)}
              </SyntaxHighlighter>
            </pre>
          </div>
        );

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTrace}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" />
                {loading ? "Tracing..." : "Trace"}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[90vw]! w-[90vw]! max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Trace Details</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Trace information for Log ID:{" "}
                <span className="font-bold">{log.id}</span>
              </DialogDescription>

              {!traceData ? (
                <p className="text-center text-gray-500">
                  No trace data available.
                </p>
              ) : (
                <>
                  {/* 1️⃣ Always show request_logs first */}
                  {traceData.data.request_logs &&
                    logBox("request_logs", traceData.data.request_logs)}

                  {/* 2️⃣ Then third_party_api_logs if exists */}
                  {traceData.data.third_party_api_logs &&
                    logBox(
                      "third_party_api_logs",
                      traceData.data.third_party_api_logs,
                    )}

                  {/* 3️⃣ Finally, error_logs */}
                  {traceData.data.error_logs &&
                    logBox("error_logs", traceData.data.error_logs)}

                  {/* 4️⃣ Optional: render any other unknown keys */}
                  {Object.entries(traceData.data)
                    .filter(
                      ([key]) =>
                        ![
                          "request_logs",
                          "third_party_api_logs",
                          "error_logs",
                        ].includes(key),
                    )
                    .map(([key, data]) => logBox(key, data))}
                </>
              )}
            </DialogContent>
          </Dialog>
        );
      };

      return (
        <div className="flex gap-2">
          {viewDetails()}
          {tracingDetails()}
        </div>
      );
    },
  },
];
