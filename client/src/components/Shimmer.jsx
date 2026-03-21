const ShimmerCard = () => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
    <div className="flex items-start justify-between gap-4">
      <div className="h-5 w-2/3 rounded-lg bg-white/10" />
      <div className="h-6 w-20 rounded-full bg-white/10" />
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 w-full rounded-md bg-white/10" />
      <div className="h-3 w-4/5 rounded-md bg-white/10" />
      <div className="h-3 w-3/5 rounded-md bg-white/8" />
    </div>
    <div className="mt-5 flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-white/10" />
      <div className="h-3 w-24 rounded-md bg-white/10" />
    </div>
    <div className="mt-4 h-40 w-full rounded-xl bg-white/5" />
  </div>
)

const ShimmerHeader = () => (
  <div className="animate-pulse">
    <div className="h-3 w-28 rounded-md bg-emerald-400/20" />
    <div className="mt-3 h-8 w-72 rounded-lg bg-white/10" />
    <div className="mt-2 h-3 w-56 rounded-md bg-white/5" />
  </div>
)

const Shimmer = () => {
  return (
    <section className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <ShimmerHeader />
        <div className="grid gap-6 md:grid-cols-2">
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </div>
      </div>
    </section>
  )
}

export default Shimmer
