import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm px-10 py-8 shadow-2xl">
        <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Field Tasks
        </h1>

        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />

        <p className="text-sm text-indigo-300/70">Verificando acesso...</p>
      </div>
    </div>
  );
}
