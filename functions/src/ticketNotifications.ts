import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
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

    const batch = admin.firestore().batch();

    usersSnap.forEach((userDoc) => {
      const notifRef = admin.firestore().collection("notifications").doc();
      batch.set(notifRef, {
        userId: userDoc.id,
        ticketId: event.params.ticketId,
        buildingId,
        code: ticket.code ?? "",
        requester: ticket.requester ?? "",
        status: ticket.status ?? "aberto",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    });

    await batch.commit();
  },
);
