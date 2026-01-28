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

      let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
      if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
      }

      console.log("[Firebase-Admin] Private Key Length:", privateKey.length);
      console.log(
        "[Firebase-Admin] Private Key Start:",
        privateKey.substring(0, 50),
      );

      // Provide the service account fields using the snake_case keys
      // that the Firebase Admin SDK expects (e.g. "project_id"). Also
      // include camelCase variants for extra robustness.
      const serviceAccount: any = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        projectId: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: privateKey,
        privateKey: privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
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
