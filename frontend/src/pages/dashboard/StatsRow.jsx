import { Package, CheckCircle, RefreshCw, Leaf } from 'lucide-react'

function StatCard({ icon: Icon, label, value, unit, color, change }) {
  return (
    <div className="glass-raised p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold ${change >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="text-sm font-normal text-white/40 ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-white/50 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function StatsRow({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-raised p-5 h-28 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={Package}
        label="Total Deliveries Today"
        value={stats.total_deliveries}
        color="bg-blue-500/20 text-blue-400"
        change={12}
      />
      <StatCard
        icon={CheckCircle}
        label="First-Attempt Success"
        value={`${stats.first_attempt_success_rate}%`}
        color="bg-teal-500/20 text-teal-400"
        change={3.2}
      />
      <StatCard
        icon={RefreshCw}
        label="Hub Reroutes"
        value={stats.hub_reroutes}
        color="bg-amber-500/20 text-amber-400"
        change={-5}
      />
      <StatCard
        icon={Leaf}
        label="CO₂ Saved"
        value={stats.co2_saved_kg}
        unit="kg"
        color="bg-green-500/20 text-green-400"
        change={18}
      />
    </div>
  )
}
