import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const nowUtc = Math.floor(Date.now() / 1000)
  const exp = nowUtc + 24 * 60 * 60

  const tokenPayload = {
    id: "1",
    role: "SUPER_ADMIN",
    exp: exp
  }

  const secret = process.env.NEXT_PUBLIC_JWT_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: "JWT_SECRET not configured" },
      { status: 500 }
    )
  }

  const token = jwt.sign(tokenPayload, secret, { algorithm: "HS256" })

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
