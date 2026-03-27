import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

function TrendIcon({ trend }) {
  if (trend === 'up')     return <TrendingUp   className="w-4 h-4 text-teal-400" />
  if (trend === 'down')   return <TrendingDown className="w-4 h-4 text-red-400"  />
  return                         <Minus         className="w-4 h-4 text-white/30" />
}

function ScoreBar({ score }) {
  const color = score >= 90 ? 'bg-teal-500' : score >= 75 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white/70 w-6 text-right">{score}</span>
    </div>
  )
}

// Fallback data when API is loading
const FALLBACK = [
  { rank: 1, driver_id: 4, name: 'Sneha Patel',      deliveries_completed: 14, trust_score: 96, trend: 'up'     },
  { rank: 2, driver_id: 1, name: 'Arjun Reddy',      deliveries_completed: 11, trust_score: 94, trend: 'up'     },
  { rank: 3, driver_id: 2, name: 'Priya Sharma',      deliveries_completed: 9,  trust_score: 88, trend: 'stable' },
  { rank: 4, driver_id: 3, name: 'Mohammed Farhan',  deliveries_completed: 6,  trust_score: 79, trend: 'stable' },
  { rank: 5, driver_id: 5, name: 'Karthik Nair',     deliveries_completed: 4,  trust_score: 71, trend: 'down'   },
]

export default function DriverLeaderboard({ data }) {
  const entries = data?.length ? data : FALLBACK

  return (
    <div className="glass-raised p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white">Driver Leaderboard</h3>
          <p className="text-xs text-white/40 mt-0.5">Today's performance</p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 text-xs text-white/30 font-semibold uppercase tracking-wider px-2 pb-1">
          <span className="col-span-1">#</span>
          <span className="col-span-4">Driver</span>
          <span className="col-span-2 text-right">Delivered</span>
          <span className="col-span-4 pl-3">Trust Score</span>
          <span className="col-span-1 text-right">↑↓</span>
        </div>

        {entries.map((entry) => (
          <div
            key={entry.driver_id}
            className="grid grid-cols-12 items-center px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <span className={clsx(
              'col-span-1 text-sm font-black',
              entry.rank === 1 ? 'text-amber-400' :
              entry.rank === 2 ? 'text-slate-300' :
              entry.rank === 3 ? 'text-amber-700' : 'text-white/30'
            )}>
              {entry.rank}
            </span>
            <div className="col-span-4">
              <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-sm font-bold text-teal-400">{entry.deliveries_completed}</span>
            </div>
            <div className="col-span-4 pl-3">
              <ScoreBar score={entry.trust_score} />
            </div>
            <div className="col-span-1 flex justify-end">
              <TrendIcon trend={entry.trend} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
