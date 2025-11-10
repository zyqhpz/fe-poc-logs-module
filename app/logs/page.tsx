"use client";

import { DataTable } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { columns, LogEntry } from "./columns";

export default function LogsPage() {
  const [data, setData] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [total, setTotal] = useState(0);

  const [selectedTab, setSelectedTab] = useState("request-logs");

  const [searchKey, setSearchKey] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const limit = 10;

  const tabs = [
    { label: "Request Logs", value: "request-logs" },
    { label: "Error Logs", value: "error-logs" },
    { label: "3rd Party API Logs", value: "third-party-api-logs" },
  ];

  const fetchLogs = async (skip = 0) => {
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        skip,
        limit,
        start_date: "01-11-2025",
        end_date: "30-11-2025",
        sort: {
          parameter_name: "_id",
          sort_type: "desc",
        },
        collection: selectedTab,
      };

      // Include search key if value is filled
      if (searchValue.trim()) {
        payload[searchKey] = searchValue.trim();
      }

      const res = await fetch(`/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch logs: ${res.status}`);
      }

      const json = await res.json();
      const list = json?.data?.list;

      setData(list?.data ?? []);
      setTotal(list?.record_total ?? 0);
      setHasNextPage(skip + limit < (list?.record_total ?? 0));
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧩 Fetch when page changes
  useEffect(() => {
    fetchLogs(page * limit);
  }, [page]);

  // 🧩 Reset and fetch when tab changes
  useEffect(() => {
    setData([]);
    setPage(0);
    setTotal(0);
    setSearchValue("");
    setSearchKey("");

    const timeout = setTimeout(() => {
      fetchLogs(0);
    }, 0);
    return () => clearTimeout(timeout);
  }, [selectedTab]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = () => {
    setPage(0);
    fetchLogs(0);
  };

  const resetButton = () => {
    setSearchKey("");
    setSearchValue("");
    setPage(0);
    fetchLogs(0);
  };

  return (
    <div className="mx-auto px-4 py-10 space-y-4">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded-md ${selectedTab === tab.value
                ? "bg-gray-600 text-amber-100"
                : "bg-gray-100"
              }`}
            onClick={() => setSelectedTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔍 Search Section */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <h2 className="text-lg font-semibold">Logs</h2>

        <div className="flex items-center gap-2">
          <Select value={searchKey} onValueChange={setSearchKey}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select search key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="external_invoice_ref">
                External Invoice Ref
              </SelectItem>
              <SelectItem value="invoice_no">Invoice No</SelectItem>
              <SelectItem value="invoice_ref">Invoice Ref</SelectItem>
              <SelectItem value="path">Path</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder={`Enter ${searchKey.replaceAll("_", " ")}...`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-[260px]"
          />

          <Button
            onClick={handleSearch}
            variant="default"
            disabled={isLoading || !searchValue.trim()}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>

          <Button
            onClick={resetButton}
            variant="outline"
            disabled={isLoading && !searchValue.trim()}
          >
            Reset
          </Button>
        </div>
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
