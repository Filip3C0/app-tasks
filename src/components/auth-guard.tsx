"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/layout/loading-screen";

type Role = "admin" | "service" | "field";

interface AuthGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

      if (!data || !allowedRoles.includes(data.role)) {
        router.replace("/login");
        return;
      }

      if (data.firstLogin) {
        router.replace("/change-password");
        return;
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [allowedRoles, router]);

  if (loading) return <LoadingScreen />;

  return <>{children}</>;
}
