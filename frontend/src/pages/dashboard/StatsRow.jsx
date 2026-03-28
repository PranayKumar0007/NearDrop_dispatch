import { Package, CheckCircle, RefreshCw, Leaf } from 'lucide-react'

const CARDS = [
  {
    key: 'deliveries',
    icon: Package,
    label: 'Deliveries Today',
    statKey: 'total_deliveries',
    change: 12,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    changeBg: 'rgba(37,99,235,0.07)',
    changeColor: '#2563eb',
    accent: '#dbeafe',
  },
  {
    key: 'success',
    icon: CheckCircle,
    label: '1st Attempt Success',
    statKey: 'first_attempt_success_rate',
    suffix: '%',
    change: 3.2,
    iconBg: 'rgba(13,115,119,0.08)',
    iconColor: '#0d7377',
    changeBg: 'rgba(13,115,119,0.08)',
    changeColor: '#0d7377',
    accent: '#ccfbf1',
  },
  {
    key: 'reroutes',
    icon: RefreshCw,
    label: 'Hub Reroutes',
    statKey: 'hub_reroutes',
    change: -5,
    iconBg: 'rgba(217,119,6,0.08)',
    iconColor: '#d97706',
    changeBg: 'rgba(220,38,38,0.07)',
    changeColor: '#dc2626',
    accent: '#fef3c7',
  },
  {
    key: 'co2',
    icon: Leaf,
    label: 'CO₂ Saved',
    statKey: 'co2_saved_kg',
    suffix: 'kg',
    change: 18,
    iconBg: 'rgba(5,150,105,0.08)',
    iconColor: '#059669',
    changeBg: 'rgba(5,150,105,0.08)',
    changeColor: '#059669',
    accent: '#d1fae5',
  },
]

function StatCard({ cfg, value }) {
  const { icon: Icon, label, suffix, change, iconBg, iconColor, changeBg, changeColor, accent } = cfg
  const positive = change >= 0

  return (
    <div className="stat-card group cursor-default">
      {/* Top accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
        </div>

        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: changeBg, color: changeColor }}
        >
          {positive ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      </div>

      <p
        className="font-black leading-none tracking-tight"
        style={{ fontSize: 28, color: '#111117' }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && (
          <span className="font-semibold ml-1" style={{ fontSize: 15, color: '#9898a8' }}>
            {suffix}
          </span>
        )}
      </p>
      <p className="text-xs font-medium mt-1.5" style={{ color: '#6b6b7b' }}>{label}</p>
    </div>
  )
}

export default function StatsRow({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map(cfg => (
        <StatCard
          key={cfg.key}
          cfg={cfg}
          value={cfg.statKey === 'first_attempt_success_rate'
            ? stats[cfg.statKey]
            : stats[cfg.statKey]}
        />
      ))}
    </div>
  )
}
