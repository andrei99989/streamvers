export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="mx-auto max-w-5xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="h-12 w-2/3 animate-pulse rounded-3xl bg-white/10" />
        <div className="mt-8 h-16 w-full animate-pulse rounded-[2rem] bg-white/10" />

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
