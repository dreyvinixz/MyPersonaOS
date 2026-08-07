const areas = [
  ["CodeToday", "3 ideas · 1 scripting"],
  ["Personal", "2 posts this week"],
  ["Quant Base", "Brand setup"],
  ["English", "45 min target"],
];

const tasks = [
  "English — 45 min",
  "Write CodeToday video #01",
  "Draft 3 short-form hooks",
  "Define Quant Base content pillars",
];

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl p-5 sm:p-8 lg:p-10">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-violet-300">Today</div>
          <h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Good morning.</h1>
          <p className="mt-2 text-sm text-white/40">Make today move your life forward.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[.035] px-4 py-2 text-xs text-white/40">MyPersonaOS · v0.1</div>
      </header>

      <section className="card mb-5 p-4">
        <div className="flex gap-3">
          <input placeholder="What's on your mind?" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-white/25" />
          <button className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black">Capture</button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-5">
          <section className="card p-6 sm:p-8">
            <div className="text-xs uppercase tracking-[.2em] text-white/30">Main focus</div>
            <div className="mt-3 max-w-2xl text-2xl font-medium tracking-[-.03em] sm:text-3xl">Ship the first usable version of MyPersonaOS.</div>
            <div className="mt-5 inline-flex rounded-full bg-violet-500/15 px-3 py-1.5 text-xs text-violet-200">CodeToday</div>
          </section>

          <section className="card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Today</div>
                <div className="mt-1 text-xs text-white/35">0/{tasks.length} completed</div>
              </div>
              <div className="text-sm font-medium text-violet-300">0%</div>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task} className="flex items-center gap-3 rounded-xl p-3 text-sm text-white/70 hover:bg-white/[.035]">
                  <span className="h-5 w-5 rounded-md border border-white/15" />
                  {task}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {areas.map(([name, detail], index) => (
            <section key={name} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                <div className="text-xs text-white/20">0{index + 1}</div>
              </div>
              <div className="mt-6 font-semibold">{name}</div>
              <div className="mt-1 text-sm text-white/35">{detail}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
