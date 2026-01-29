import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

async function sendToTokens(
  tokens: string[],
  payload: admin.messaging.MessagingPayload,
) {
  if (tokens.length === 0) return;

  const messaging = admin.messaging();
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 500) {
    chunks.push(tokens.slice(i, i + 500));
  }

  await Promise.all(
    chunks.map((chunk) =>
      messaging.sendEachForMulticast({ tokens: chunk, ...payload }),
    ),
  );
}

export const notifyFieldOnTicketCreated = onDocumentCreated(
  "tickets/{ticketId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const ticket = snap.data() as any;
    const buildingId = ticket.buildingId as string | undefined;
    if (!buildingId) return;

    const usersSnap = await admin
      .firestore()
      .collection("users")
      .where("role", "==", "field")
      .where("buildingId", "==", buildingId)
      .get();

    if (usersSnap.empty) return;

    const userIds = usersSnap.docs.map((d) => d.id);

    const allTokens: string[] = [];
    const chunkSize = 10;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const slice = userIds.slice(i, i + chunkSize);
      const tokensSnap = await admin
        .firestore()
        .collection("fcmTokens")
        .where("userId", "in", slice)
        .get();

      tokensSnap.forEach((t) => allTokens.push(t.id));
    }

    if (allTokens.length === 0) return;

    const title = ticket.code ? `Novo chamado ${ticket.code}` : "Novo chamado";
    const body = ticket.requester
      ? `Solicitante: ${ticket.requester}`
      : `Prédio: ${buildingId}`;

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title,
        body,
      },
      data: {
        ticketId: event.params.ticketId,
        buildingId,
        status: ticket.status ?? "aberto",
      },
    };

    await sendToTokens(allTokens, payload);
  },
);
