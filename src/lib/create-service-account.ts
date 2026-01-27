import fs from "fs";
import path from "path";

// Se em desenvolvimento, criar arquivo serviceAccountKey.json temporário
if (
  process.env.NODE_ENV === "development" &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  try {
    const keyPath = path.join(process.cwd(), "serviceAccountKey.json");

    // Só criar se não existir
    if (!fs.existsSync(keyPath)) {
      const serviceAccountKey = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: "key-id",
        private_key: process.env.FIREBASE_PRIVATE_KEY.includes("\\n")
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : process.env.FIREBASE_PRIVATE_KEY,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: "client-id",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40tasks-field-services.iam.gserviceaccount.com",
      };

      fs.writeFileSync(keyPath, JSON.stringify(serviceAccountKey, null, 2));
      console.log(
        "[Firebase Init] serviceAccountKey.json created at:",
        keyPath,
      );
    }
  } catch (error) {
    console.error(
      "[Firebase Init] Error creating serviceAccountKey.json:",
      error,
    );
  }
}

export {};
