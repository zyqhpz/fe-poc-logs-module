import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const token = process.env.NEXT_PUBLIC_API_TOKEN;

  const url = `http://10.10.30.38:8080/api/v1/reports/admin/logs/trace-by-id?log_id=${id}`;

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
