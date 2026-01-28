"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/layout/loading-screen";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.replace("/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth as any, async (user) => {
      if (!user || !db) {
        router.replace("/login");
        return;
      }

      const snap = await getDoc(doc(db as any, "users", user.uid));
      const data = snap.data();

      if (data?.firstLogin) {
        router.replace("/change-password");
        return;
      }

      if (data?.role === "admin") router.replace("/admin");
      if (data?.role === "service") router.replace("/service");
      if (data?.role === "field") router.replace("/field");
    });

    return () => unsubscribe();
  }, [router]);

  return <LoadingScreen />;
}
