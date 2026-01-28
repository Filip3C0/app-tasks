import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-indigo-100 anim-fade-in">
      <div className="max-w-2xl p-8 rounded-2xl bg-slate-800/60 border border-indigo-500/20 shadow-lg anim-slide-up">
        <h1 className="text-3xl font-bold mb-2 animate-[fade-in_700ms_ease_50ms_forwards]">
          Field Services
        </h1>
        <p className="text-sm text-indigo-200/80 mb-4">
          Painel administrativo e gerenciamento de chamados TI.
        </p>

        <div className="space-x-3">
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white btn-hover-pop anim-pop"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
