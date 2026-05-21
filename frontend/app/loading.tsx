export default function Loading() {
  return (
    <main className="min-h-screen bg-black p-6 pb-36 text-white md:p-10 md:pb-20">
      <section className="hero-glow mx-auto max-w-5xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="h-6 w-48 animate-pulse rounded-full bg-white/10" />
        <div className="mt-8 h-16 w-3/4 animate-pulse rounded-3xl bg-white/10" />
        <div className="mt-4 h-5 w-1/2 animate-pulse rounded-full bg-white/10" />

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
