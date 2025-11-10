"use client";

import { Button } from "@/components/ui/button";

const MAX_VISIBLE_PAGES = 5; // how many page buttons to show around current

export function Pagination({
  page,
  totalPages,
  hasNextPage,
  setPage,
}: {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  setPage: (page: number) => void;
}) {
  // Compute which pages to show
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= MAX_VISIBLE_PAGES + 2) {
      // If small number of pages, show all
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      // Always show first & last
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);

      if (page > 2) pages.push(0, "…");
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 3) pages.push("…", totalPages - 1);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(Math.max(0, page - 1))}
        disabled={page === 0}
      >
        Previous
      </Button>

      {/* Page Buttons */}
      {visiblePages.map((p, i) =>
        typeof p === "number" ? (
          <Button
            key={i}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => setPage(p)}
          >
            {p + 1}
          </Button>
        ) : (
          <span key={i} className="px-2 text-gray-500">
            {p}
          </span>
        ),
      )}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(page + 1)}
        disabled={!hasNextPage}
      >
        Next
      </Button>
    </div>
  );
}
