import {Box, Book, Star} from 'lucide-react'
import {Link} from 'react-router'

export function Logo({dark = false}: { dark?: boolean }) {
    return (
        <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
        <Box size={20}/>
      </span>
            <span className={`text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Kâşif</span>
        </Link>
    )
}

export function Crumb({items}: { items: { label: string; to?: string }[] }) {
    return (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-8 py-4 text-sm">
            {items.map((it, i) => (
                <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-slate-300">/</span>}
                    {it.to ? (
                        <Link to={it.to} className="text-slate-400 hover:text-slate-600">{it.label}</Link>
                    ) : (
                        <span className="font-medium text-slate-800">{it.label}</span>
                    )}
        </span>
            ))}
        </div>
    )
}

export function Toggle({on}: { on: boolean }) {
    return (
        <span
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${on ? 'bg-primary' : 'bg-slate-300'}`}>
      <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : 'translate-x-0.5'}`}/>
    </span>
    )
}

export function Stars({value, size = 14}: { value: number; size?: number }) {
    return (
        <span className="inline-flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={size} fill={n <= Math.round(value) ? 'currentColor' : 'none'}
                className={n <= Math.round(value) ? '' : 'text-slate-300'}/>
      ))}
    </span>
    )
}

export function BookThumb({size = 'md'}: { size?: 'sm' | 'md' | 'lg' }) {
    const cls = size === 'sm' ? 'h-10 w-10 rounded-lg' : size === 'lg' ? 'h-24 w-20 rounded-xl' : 'h-14 w-14 rounded-xl'
    return (
        <span className={`flex shrink-0 items-center justify-center bg-indigo-50 text-indigo-400 ${cls}`}>
      <Book size={size === 'sm' ? 16 : 22}/>
    </span>
    )
}

export function Pill({children, tone = 'slate'}: {
    children: React.ReactNode;
    tone?: 'slate' | 'blue' | 'green' | 'orange' | 'red'
}) {
    const tones = {
        slate: 'bg-slate-100 text-slate-600',
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-emerald-50 text-emerald-700',
        orange: 'bg-orange-50 text-orange-700',
        red: 'bg-red-50 text-red-600',
    }
    return <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
