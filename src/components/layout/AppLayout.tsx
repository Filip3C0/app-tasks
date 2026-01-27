import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {children}
    </div>
  );
}
