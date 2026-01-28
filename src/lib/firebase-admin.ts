import "./create-service-account";
import "./init-firebase";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Desabilitar verificação SSL para desenvolvimento (Firestore connection issues)
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

if (!admin.apps.length) {
  console.log("[Firebase-Admin] Inicializando Firebase Admin SDK");
  console.log("[Firebase-Admin] NODE_ENV:", process.env.NODE_ENV);
  console.log("[Firebase-Admin] Project ID:", process.env.FIREBASE_PROJECT_ID);

  try {
    // Tentar usar arquivo serviceAccountKey.json primeiro
    const keyPath = path.join(process.cwd(), "serviceAccountKey.json");

    if (fs.existsSync(keyPath)) {
      console.log("[Firebase-Admin] Usando serviceAccountKey.json");
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
    } else {
      // Fallback para variáveis de ambiente
      console.log("[Firebase-Admin] Usando variáveis de ambiente");

      const missing: string[] = [];
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";

      if (!projectId) missing.push("FIREBASE_PROJECT_ID");
      if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
      if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

      if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
      }

      if (missing.length > 0) {
        const msg = `Missing Firebase credentials: set the following env vars: ${missing.join(", ")}`;
        console.error("[Firebase-Admin] " + msg);
        throw new Error(msg);
      }

      const serviceAccount: any = {
        project_id: projectId,
        projectId: projectId,
        client_email: clientEmail,
        clientEmail: clientEmail,
        private_key: privateKey,
        privateKey: privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
    }

    console.log(
      "[Firebase-Admin] ✓ Firebase Admin SDK inicializado com sucesso",
    );
  } catch (error) {
    console.error(
      "[Firebase-Admin] ❌ Erro ao inicializar Firebase Admin SDK:",
      error,
    );
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
