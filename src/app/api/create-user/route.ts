import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, building } = body;

    // 🔑 senha temporária
    const tempPassword = "123456";

    // 1️⃣ Cria no Auth
    const userRecord = await adminAuth.createUser({
      email,
      password: tempPassword,
    });

    // 2️⃣ Salva no Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      role,
      building,
      firstLogin: true,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
