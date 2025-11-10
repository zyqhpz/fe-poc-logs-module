"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { columns, Product } from "./columns";

export default function DemoPage() {
  const [data, setData] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchData = async (skip: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://dummyjson.com/products?limit=${limit}&skip=${skip}`,
      );
      const json = await res.json();
      const mapped = json.products.map((item: Product) => ({
        id: item.id,
        price: item.price,
        title: item.title,
      }));
      setData(mapped);
      setTotal(json.total);
      setHasNextPage(skip + limit < json.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  useEffect(() => {
    fetchData(page * limit);
  }, [page]);

  const handleNext = () => {
    if (hasNextPage) setPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  return (
    <div className="mx-auto px-4 py-10 space-y-4">
      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          <DataTable columns={columns} data={data} />

          <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                variant={index === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(index)}
              >
                {index + 1}
              </Button>
            ))}

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => (hasNextPage ? p + 1 : p))}
              disabled={!hasNextPage}
            >
              Next
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
        </>
      )}
    </div>
  );
}
