import { ReactNode } from "react";

export default function MainContent({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">{children}</div>
    </main>
  );
}
