import { TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react'
import clsx from 'clsx'

const FALLBACK = [
  { rank: 1, driver_id: 4, name: 'Sneha Patel',     deliveries_completed: 14, trust_score: 96, trend: 'up'     },
  { rank: 2, driver_id: 1, name: 'Arjun Reddy',     deliveries_completed: 11, trust_score: 94, trend: 'up'     },
  { rank: 3, driver_id: 2, name: 'Priya Sharma',    deliveries_completed: 9,  trust_score: 88, trend: 'stable' },
  { rank: 4, driver_id: 3, name: 'Mohammed Farhan', deliveries_completed: 6,  trust_score: 79, trend: 'stable' },
  { rank: 5, driver_id: 5, name: 'Karthik Nair',    deliveries_completed: 4,  trust_score: 71, trend: 'down'   },
]

const MEDALS = {
  1: { emoji: '🥇', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.18)' },
  2: { emoji: '🥈', bg: 'rgba(148,163,184,0.07)', border: 'rgba(148,163,184,0.15)' },
  3: { emoji: '🥉', bg: 'rgba(180,83,9,0.06)', border: 'rgba(180,83,9,0.14)' },
}

function ScoreBar({ score }) {
  const color =
    score >= 90 ? '#0d7377' :
    score >= 75 ? '#d97706' :
                  '#dc2626'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-bold w-5 text-right" style={{ color: '#9898a8' }}>{score}</span>
    </div>
  )
}

function Trend({ trend }) {
  if (trend === 'up')   return <TrendingUp   className="w-3.5 h-3.5" style={{ color: '#059669' }} />
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
  return                       <Minus        className="w-3.5 h-3.5" style={{ color: '#d1d5db' }} />
}

export default function DriverLeaderboard({ data }) {
  const entries = data?.length ? data : FALLBACK

  return (
    <div className="glass-raised p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Crown className="w-4 h-4" style={{ color: '#d97706' }} />
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#111117' }}>Driver Leaderboard</h3>
            <p className="text-[11px]" style={{ color: '#9898a8' }}>Today's performance</p>
          </div>
        </div>
        <div
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide"
          style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377', border: '1px solid rgba(13,115,119,0.15)' }}
        >
          Live
        </div>
      </div>

      <div className="space-y-1">
        {entries.map(entry => {
          const medal = MEDALS[entry.rank]
          return (
            <div
              key={entry.driver_id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-default"
              style={{
                background: medal ? medal.bg : 'transparent',
                border: medal ? `1px solid ${medal.border}` : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!medal) e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
              onMouseLeave={e => { if (!medal) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Rank / medal */}
              <div className="w-6 text-center shrink-0">
                {medal
                  ? <span style={{ fontSize: 15 }}>{medal.emoji}</span>
                  : <span className="text-xs font-bold" style={{ color: '#d1d5db' }}>{entry.rank}</span>
                }
              </div>

              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  background: 'rgba(13,115,119,0.08)',
                  border: '1px solid rgba(13,115,119,0.15)',
                  color: '#0d7377',
                }}
              >
                {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold truncate pr-2" style={{ color: '#111117' }}>{entry.name}</p>
                  <span className="text-xs font-black shrink-0" style={{ color: '#0d7377' }}>
                    {entry.deliveries_completed}
                  </span>
                </div>
                <ScoreBar score={entry.trust_score} />
              </div>

              <Trend trend={entry.trend} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
