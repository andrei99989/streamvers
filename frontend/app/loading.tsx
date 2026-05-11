export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-[#6A4CFF]" />
        <div className="mt-6 text-3xl font-black">StreamVerse</div>
        <div className="mt-2 text-white/50">Se încarcă platforma...</div>
      </div>
    </main>
  );
}
