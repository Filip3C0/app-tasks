"use client";

import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/layout/loading-screen";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      const data = snap.data();

      if (data?.firstLogin) {
        router.push("/change-password");
        return;
      }

      if (data?.role === "admin") router.push("/admin");
      if (data?.role === "service") router.push("/service");
      if (data?.role === "field") router.push("/field");
    }

    checkUser();
  }, [router]);

  return <LoadingScreen />;
}
