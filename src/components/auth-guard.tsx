"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
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
    async function checkAccess() {
      const user = auth?.currentUser;

      if (!user || !db) {
        router.push("/login");
        return;
      }

      const snap = await getDoc(doc(db as any, "users", user.uid));
      const data = snap.data();

      if (!data || !allowedRoles.includes(data.role)) {
        router.push("/login");
        return;
      }

      // If user is flagged to change password on first login, redirect them
      if (data.firstLogin) {
        router.push("/change-password");
        return;
      }

      setLoading(false);
    }

    checkAccess();
  }, [allowedRoles, router]);

  if (loading) return <LoadingScreen />;

  return <>{children}</>;
}
