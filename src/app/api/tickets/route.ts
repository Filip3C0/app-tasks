import { NextResponse } from "next/server";
import { updateFirestoreREST } from "@/lib/firestore-rest";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      ticketId,
      code,
      requester,
      sector,
      room,
      description,
      buildingId,
      status,
    } = body as {
      ticketId?: string;
      code?: string;
      requester?: string;
      sector?: string;
      room?: string;
      description?: string;
      buildingId?: string;
      status?: "aberto" | "em_atendimento" | "finalizado";
    };

    if (!ticketId) {
      return NextResponse.json(
        { error: "ticketId é obrigatório" },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    if (typeof code === "string") updates.code = code;
    if (typeof requester === "string") updates.requester = requester;
    if (typeof sector === "string") updates.sector = sector;
    if (typeof room === "string") updates.room = room;
    if (typeof description === "string") updates.description = description;
    if (typeof buildingId === "string") updates.buildingId = buildingId;
    if (typeof status === "string") updates.status = status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo válido para atualizar" },
        { status: 400 },
      );
    }

    updates.updatedAt = new Date();

    try {
      await updateFirestoreREST("tickets", ticketId, updates);
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (msg.includes("404")) {
        return NextResponse.json(
          { error: "Chamado não encontrado" },
          { status: 404 },
        );
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/tickets] Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 },
    );
  }
}
