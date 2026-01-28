import { NextResponse } from "next/server";

import { getAndDeleteTempPassword } from "@/lib/temp-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token não informado" },
        { status: 400 },
      );
    }

    const entry = getAndDeleteTempPassword(token);

    if (!entry) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      tempPassword: entry.password,
      expiresAt: new Date(entry.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("[POST /api/users/temp-password] Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro" },
      { status: 500 },
    );
  }
}
