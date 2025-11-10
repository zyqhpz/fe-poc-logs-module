import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { skip = 0, limit = 10 } = body;

  const token = process.env.NEXT_PUBLIC_API_TOKEN; // keep token safe on server
  const url = `http://10.10.30.38:8080/api/v1/reports/admin/logs/third-party-api-logs?skip=${skip}&limit=${limit}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      start_date: "01-11-2025",
      end_date: "30-11-2025",
      sort: {
        parameter_name: "_id",
        sort_type: "desc",
      },
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
