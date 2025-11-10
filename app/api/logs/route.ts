import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    skip = 0,
    limit = 10,
    collection,
    start_date,
    end_date,
    sort,
    ...searchFilters
  } = body;

  const token = process.env.NEXT_PUBLIC_API_TOKEN; // keep token safe on server
  const url = `http://10.10.30.38:8080/api/v1/reports/admin/logs/${collection}?skip=${skip}&limit=${limit}`;

  // ✅ Build request payload dynamically
  const payload: Record<string, string> = {
    start_date: start_date || "01-11-2025",
    end_date: end_date || "30-11-2025",
    sort: sort || {
      parameter_name: "_id",
      sort_type: "desc",
    },
  };

  // ✅ Include only one search key if provided (invoice_ref / invoice_no / external_invoice_ref)
  const allowedKeys = ["invoice_ref", "invoice_no", "external_invoice_ref", "path"];
  for (const key of allowedKeys) {
    if (searchFilters[key]) {
      payload[key] = searchFilters[key];
      break; // use only the first found key
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `API responded with ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error fetching request logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch request logs", details: error.message },
      { status: 500 },
    );
  }
}
