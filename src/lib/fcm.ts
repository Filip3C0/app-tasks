import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";
import { httpsCallable } from "firebase/functions";
import { functions, messaging as messagingInstance } from "./firebase";
import { firebaseClientConfig } from "./firebase";

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function registerFieldPushToken(userId: string) {
  if (typeof window === "undefined") return null;
  if (!functions) return null;

  const supported = await isSupported();
  if (!supported) return null;

  // Push API precisa de contexto seguro: https ou http://localhost
  const isSecure = window.isSecureContext || window.location.hostname === "localhost";
  if (!isSecure) {
    console.warn("[fcm] contexto inseguro", {
      origin: window.location.origin,
      isSecureContext: window.isSecureContext,
    });
    return null;
  }

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

  console.info("[fcm] config", {
    origin: window.location.origin,
    projectId: firebaseClientConfig.projectId,
    senderId,
    vapidKeyPrefix: vapidKey.slice(0, 12),
  });

  let swReg: ServiceWorkerRegistration;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));

    // Verifica se o SW está acessível (evita 404 silencioso)
    await fetch(`/firebase-messaging-sw.js`, { cache: "no-store" });

    swReg = await navigator.serviceWorker.register(`/firebase-messaging-sw.js`, {
      scope: `/`,
    });
    await navigator.serviceWorker.ready;

    // Garante que exista um controller antes de seguir
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        const listener = () => {
          navigator.serviceWorker.removeEventListener("controllerchange", listener);
          resolve();
        };
        navigator.serviceWorker.addEventListener("controllerchange", listener);
      });
    }
  } catch (err) {
    console.warn("[fcm] falha ao registrar service worker", err);
    return null;
  }

  const messaging = messagingInstance ?? getMessaging();

  let token: string | null = null;
  try {
    // Log permissões do Push antes do getToken
    const permState = await swReg.pushManager.permissionState({ userVisibleOnly: true });
    console.info("[fcm] push permissionState", permState);

    token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });
  } catch (err: any) {
    console.warn("[fcm] getToken falhou", {
      code: err?.code,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
      origin: window.location.origin,
      isSecureContext: window.isSecureContext,
    });
    return null;
  }

  if (!token) {
    console.warn("[fcm] getToken retornou null");
    return null;
  }

  const registerFn = httpsCallable(functions, "registerFcmToken");
  await registerFn({ token, platform: "web" });

  // Foreground handler to surface a system notification when the tab está aberta
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "Chamado";
    const body = payload.notification?.body || "";

    if (Notification.permission === "granted") {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.showNotification(title, {
          body,
          data: payload.data,
        });
      });
    }
  });

  return token;
}
