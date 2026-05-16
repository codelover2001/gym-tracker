export function StatCard({ label, value, suffix, icon }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3 py-3 sm:px-4 sm:py-4 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-1.5">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-3xl sm:text-4xl text-zinc-100 leading-none"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          {value}
        </span>
        {suffix ? <span className="text-xs text-zinc-500">{suffix}</span> : null}
      </div>
    </div>
  )
}
