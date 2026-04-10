import { TermoGame } from "@/components/TermoGame";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,214,10,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.2),transparent_40%),linear-gradient(140deg,#18181b_0%,#0a0a0a_45%,#3f1d18_100%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 top-16 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

      <TermoGame />
    </main>
  );
}
