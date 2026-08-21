import { NextRequest, NextResponse } from "next/server";
import { validateOperator, createSessionValue, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Operator ID dan Passphrase wajib diisi." },
        { status: 400 }
      );
    }

    const isValid = validateOperator(username, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Kredensial Operator tidak valid. Akses ditolak." },
        { status: 401 }
      );
    }

    const sessionValue = createSessionValue(username);

    const response = NextResponse.json({
      success: true,
      operator: username.trim(),
      message: `Akses diberikan. Selamat datang, Operator ${username}.`,
    });

    // Set Secure HttpOnly cookie for 7 days
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server gateway." },
      { status: 500 }
    );
  }
}
