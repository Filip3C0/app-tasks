import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import { firebaseClientConfig } from "./firebase";

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function registerFieldPushToken(userId: string) {
  if (typeof window === "undefined") return null;
  if (!functions) return null;

  const supported = await isSupported();
  if (!supported) return null;

  if (!vapidKey) {
    console.warn("[fcm] NEXT_PUBLIC_FIREBASE_VAPID_KEY ausente");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const senderId = firebaseClientConfig.messagingSenderId;
  if (!senderId) {
    console.warn("[fcm] messagingSenderId ausente no config");
    return null;
  }

  // Garantir que o SW receba o senderId via querystring
  const swReg = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?senderId=${encodeURIComponent(senderId)}`,
  );

  const messaging = getMessaging();
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: swReg,
  });
  if (!token) return null;

  const registerFn = httpsCallable(functions, "registerFcmToken");
  await registerFn({ token, platform: "web" });

  return token;
}
