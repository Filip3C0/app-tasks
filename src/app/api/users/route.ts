import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
// Prefer admin SDK for reliability on Vercel

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, building } = body;

    if (!action || !userId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // ==========================
    // 🔥 EXCLUIR USUÁRIO
    // ==========================
    if (action === "delete") {
      console.log("[POST /api/users] Deletando via Admin SDK...");

      await adminAuth.deleteUser(userId);
      await adminDb.collection("users").doc(userId).delete();

      console.log("[POST /api/users] ✓ Usuário deletado com sucesso");
      return NextResponse.json({ success: true });
    }

    // ==========================
    // 🔁 RESETAR SENHA
    // ==========================
    if (action === "reset-password") {
      const user = await adminAuth.getUser(userId);

      const resetLink = await adminAuth.generatePasswordResetLink(user.email!);

      // aqui você pode:
      // - enviar email
      // - logar
      // - integrar com EmailJS / Resend

      return NextResponse.json({
        success: true,
        resetLink,
      });
    }

    // ==========================
    // 🏢 ALTERAR PRÉDIO
    // ==========================
    if (action === "change-building") {
      if (!building) {
        return NextResponse.json(
          { error: "Prédio não informado" },
          { status: 400 },
        );
      }

      await adminDb.collection("users").doc(userId).update({
        buildingId: building,
        updatedAt: new Date(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  console.log("[PUT /api/users] Requisição recebida");

  try {
    console.log("[PUT /api/users] Lendo body...");
    const body = await req.json();
    const { action, userId, buildingId } = body;

    console.log("[PUT /api/users] Body recebido:", {
      action,
      userId,
      buildingId,
    });

    if (!action || !userId) {
      console.log("[PUT /api/users] Dados inválidos");
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // ==========================
    // 🔁 RESETAR SENHA
    // ==========================
    if (action === "reset-password") {
      console.log("[PUT /api/users] Ação: reset-password");

      try {
        const user = await adminAuth.getUser(userId);

        const resetLink = await adminAuth.generatePasswordResetLink(
          user.email!,
        );

        console.log("[PUT /api/users] Reset link gerado");

        // Atualizar o Firestore para registrar que uma senha foi resetada
        console.log(
          "[PUT /api/users] Iniciando atualização de lastPasswordReset em background...",
        );
        await adminDb.collection("users").doc(userId).update({
          lastPasswordReset: new Date(),
        });
        console.log("[PUT /api/users] ✓ lastPasswordReset atualizado");

        return NextResponse.json({
          success: true,
          resetLink,
        });
      } catch (resetError) {
        console.error("[PUT /api/users] Erro ao gerar reset link:", resetError);
        throw resetError;
      }
    }

    // ==========================
    // 🔐 DEFINIR SENHA TEMPORÁRIA (ADMIN)
    // ==========================
    if (action === "set-temp-password") {
      console.log("[PUT /api/users] Ação: set-temp-password");

      try {
        const user = await adminAuth.getUser(userId);

        const tempPassword = "123456";
        await adminAuth.updateUser(userId, { password: tempPassword });

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        await adminDb.collection("users").doc(userId).update({
          firstLogin: true,
          tempPasswordSetAt: new Date().toISOString(),
          tempPasswordExpiresAt: expiresAt.toISOString(),
        });

        console.log(
          "[PUT /api/users] Senha temporária definida para",
          user.email,
        );

        const { randomBytes } = await import("crypto");
        const token = randomBytes(32).toString("hex");

        const { setTempPassword } = await import("@/lib/temp-store");
        setTempPassword(token, tempPassword, 2 * 60 * 1000); // 2 minutos

        return NextResponse.json({
          success: true,
          token,
          expiresAt: expiresAt.toISOString(),
        });
      } catch (err) {
        console.error(
          "[PUT /api/users] Erro ao definir senha temporária:",
          err,
        );
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Erro" },
          { status: 500 },
        );
      }
    }

    // ==========================
    // 🏢 ALTERAR PRÉDIO
    // ==========================
    if (action === "change-building") {
      console.log("[PUT /api/users] Ação: change-building");

      if (!buildingId) {
        console.log("[PUT /api/users] buildingId não informado");
        return NextResponse.json(
          { error: "Prédio não informado" },
          { status: 400 },
        );
      }

      console.log(
        "[PUT /api/users] Iniciando atualização do usuário:",
        userId,
        "com buildingId:",
        buildingId,
      );

      await adminDb.collection("users").doc(userId).update({
        buildingId,
        updatedAt: new Date(),
      });

      console.log("[PUT /api/users] ✓ Update completado com sucesso");
      return NextResponse.json({ success: true });
    }

    console.log("[PUT /api/users] Ação inválida:", action);
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("[PUT /api/users] ❌ Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  console.log("[DELETE /api/users] Requisição recebida");

  try {
    const body = await req.json();
    const { userId } = body;

    console.log("[DELETE /api/users] Deletando usuário:", userId);

    if (!userId) {
      return NextResponse.json({ error: "UserId inválido" }, { status: 400 });
    }

    // ==========================
    // 🔥 EXCLUIR USUÁRIO
    // ==========================
    // Tenta deletar no Auth; se não existir, loga e segue para Firestore
    try {
      await adminAuth.deleteUser(userId);
      console.log("[DELETE /api/users] ✓ Auth user deletado");
    } catch (authErr: any) {
      if (authErr?.code === "auth/user-not-found") {
        console.warn("[DELETE /api/users] usuário não encontrado no Auth");
      } else {
        console.error("[DELETE /api/users] Erro ao deletar no Auth", authErr);
        return NextResponse.json(
          { error: authErr?.message || "Erro ao deletar usuário no Auth" },
          { status: 500 },
        );
      }
    }

    // Deleta no Firestore (idempotente)
    try {
      await adminDb.collection("users").doc(userId).delete();
      console.log("[DELETE /api/users] ✓ Documento do Firestore deletado");
    } catch (fsErr: any) {
      console.error(
        "[DELETE /api/users] Erro ao deletar documento do Firestore",
        fsErr,
      );
      return NextResponse.json(
        { error: fsErr?.message || "Erro ao deletar usuário no Firestore" },
        { status: 500 },
      );
    }

    console.log("[DELETE /api/users] ✓ Usuário deletado com sucesso");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/users] ❌ Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 },
    );
  }
}
