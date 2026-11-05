const subTones: Record<string, string> = {
  green: 'text-emerald-600', orange: 'text-orange-600', red: 'text-red-600', blue: 'text-primary',
}

export default function StatRow({ stats }: { stats: { label: string; value: string; sub: string; subTone?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">{s.label}</p>
          <p className="mt-1.5 truncate text-2xl font-bold">{s.value}</p>
          <p className={`mt-0.5 text-sm ${s.subTone ? subTones[s.subTone] : 'text-slate-400'}`}>{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
