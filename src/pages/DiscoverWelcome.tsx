import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Box, Sparkles, Copy, Book, Tag, Clock, TrendingUp, ArrowRight, Paperclip, ArrowUp } from 'lucide-react'
import { Crumb } from '../components/ui'
import { PersonalShelf } from '../components/PersonalShelf'
import { RecentlyViewedStrip } from '../components/RecentlyViewedStrip'
import data from '../mocks/discover.json'
import { discoverCards } from '../config/discoverCards'

const icons: Record<string, typeof Sparkles> = {
  sparkles: Sparkles, copy: Copy, book: Book, tag: Tag, clock: Clock, trending: TrendingUp,
}
const iconTones: Record<string, string> = {
  sparkles: 'bg-blue-50 text-blue-600', copy: 'bg-emerald-50 text-emerald-600', book: 'bg-indigo-50 text-indigo-600',
  tag: 'bg-orange-50 text-orange-600', clock: 'bg-sky-50 text-sky-600', trending: 'bg-teal-50 text-teal-600',
}

// Kartın sorusu/girdi → sohbet ekranı router state'iyle açılır (ChatWorkspace otomatik gönderir).
// 014: ?q= URL YOK — sorgu URL'de taşınmaz, mesaj-güdümlü sohbet.
function toChat(navigate: ReturnType<typeof useNavigate>, question: string) {
  navigate('/sohbet', { state: { message: question } })
}

export default function DiscoverWelcome() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Keşfe başla' }]} />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 pt-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
          <Box size={26} />
        </span>
        <span className="mt-6 flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Sparkles size={14} /> {data.chip}
        </span>
        <h1 className="mt-5 text-center text-4xl font-bold leading-tight tracking-tight">{data.title}</h1>
        <p className="mt-4 max-w-xl text-center text-slate-500">{data.subtitle}</p>

        <PersonalShelf />

        <p className="mt-10 text-sm font-medium text-slate-600">Bir örnekle başla</p>
        <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {discoverCards.map((card) => {
            const Icon = icons[card.icon] ?? Sparkles
            const soon = card.status === 'soon'
            return (
              <div
                key={card.tag}
                className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition ${soon ? 'opacity-60' : 'hover:shadow-md'}`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconTones[card.icon] ?? iconTones.sparkles}`}>
                  <Icon size={17} />
                </span>
                <p className="mt-4 text-[11px] font-semibold tracking-wider text-slate-400">{card.tag}</p>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-800">{card.text}</p>
                {soon ? (
                  <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                    Yakında
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => toChat(navigate, card.text)}
                    className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary"
                  >
                    Kâşif'e sor <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <RecentlyViewedStrip />

        <form
          onSubmit={(e) => { e.preventDefault(); if (input.trim()) toChat(navigate, input.trim()) }}
          className="sticky bottom-6 mt-10 w-full max-w-3xl pb-6"
        >
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-4 pr-2 shadow-lg shadow-slate-200/50">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder={data.inputPlaceholder}
            />
            <button type="button" className="p-2 text-slate-400"><Paperclip size={17} /></button>
            <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"><ArrowUp size={18} /></button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">{data.disclaimer}</p>
        </form>
      </div>
    </div>
  )
}
