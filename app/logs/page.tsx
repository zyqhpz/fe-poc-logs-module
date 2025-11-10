"use client";

import { DataTable } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import { useEffect, useState } from "react";
import { columns, LogEntry } from "./columns";

export default function LogsPage() {
  const [data, setData] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [total, setTotal] = useState(0);

  const [selectedTab, setSelectedTab] = useState("request-logs");

  const limit = 10;

  const tabs = [
    { label: "Request Logs", value: "request-logs" },
    { label: "Error Logs", value: "error-logs" },
    { label: "3rd Party API Logs", value: "third-party-logs" },
  ];

  const fetchLogs = async (skip: number) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/" + selectedTab, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skip, limit }),
      });

      const json = await res.json();
      setData(json.data.list.data ?? []);
      setTotal(json.data.list.record_total ?? 0);
      setHasNextPage(skip + limit < (json.data.list.record_total ?? 0));
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page * limit);
  }, [page, selectedTab]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto px-4 py-10 space-y-4">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded-md ${
              selectedTab === tab.value
                ? "bg-gray-600 text-amber-100"
                : "bg-gray-100"
            }`}
            onClick={() => setSelectedTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Logs</h2>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading logs...</p>
      ) : (
        <>
          <DataTable columns={columns} data={data} />

          <Pagination
            page={page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            setPage={setPage}
          />

          <p className="text-center text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
        </>
      )}
    </div>
  );
}
