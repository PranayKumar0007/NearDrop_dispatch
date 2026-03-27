import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl px-3 py-2 shadow-card text-xs">
      <p className="text-white/60 mb-1">{label}:00 — {label}:59</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function DeliveryChart({ data = [] }) {
  const isEmpty = data.length === 0

  // Fallback demo data when API is not seeded
  const chartData = isEmpty
    ? Array.from({ length: 12 }, (_, i) => ({
        hour: i + 7,
        deliveries: Math.floor(Math.random() * 12) + 2,
        failures: Math.floor(Math.random() * 3),
      }))
    : data.map((d) => ({ ...d, hour: `${d.hour}h` }))

  return (
    <div className="glass-raised p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white">Hourly Delivery Activity</h3>
          <p className="text-xs text-white/40 mt-0.5">Deliveries vs Failures by hour</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-teal-400">
            <span className="w-3 h-3 rounded bg-teal-500 inline-block" />Deliveries
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-3 h-3 rounded bg-red-500 inline-block" />Failures
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="deliveries" fill="#00c9b1" radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="failures"   fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={24} opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
