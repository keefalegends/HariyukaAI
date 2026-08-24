import { NextRequest, NextResponse } from "next/server";
import { parseSessionValue, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);

  if (!cookie?.value) {
    return NextResponse.json({ authenticated: false, operator: null });
  }

  const session = parseSessionValue(cookie.value);
  if (!session?.username) {
    return NextResponse.json({ authenticated: false, operator: null });
  }

  return NextResponse.json({
    authenticated: true,
    operator: session.username,
  });
}
