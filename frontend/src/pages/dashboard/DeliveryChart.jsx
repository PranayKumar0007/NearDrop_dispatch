import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { Activity } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.96)',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    }}>
      <p style={{ color: '#9898a8', fontSize: 11, marginBottom: 6 }}>
        {label}:00 – {label}:59
      </p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111117', textTransform: 'capitalize' }}>
            {p.name}: {p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DeliveryChart({ data = [] }) {
  const isEmpty = data.length === 0
  const chartData = isEmpty
    ? Array.from({ length: 10 }, (_, i) => ({
        hour: i + 8,
        deliveries: Math.floor(Math.random() * 9) + 3,
        failures: Math.floor(Math.random() * 2),
      }))
    : data.map(d => ({ ...d, hour: `${d.hour}` }))

  return (
    <div className="glass-raised p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.08)' }}>
            <Activity className="w-4 h-4" style={{ color: '#0d7377' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#111117' }}>Hourly Activity</h3>
            <p className="text-[11px]" style={{ color: '#9898a8' }}>Deliveries vs failures by hour</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[
            { color: '#0d7377', label: 'Delivered' },
            { color: '#dc2626', label: 'Failed'    },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: '#9898a8', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={3} barCategoryGap="28%">
          <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} strokeDasharray="0" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#9898a8', fontSize: 11, fontWeight: 500 }}
            tickFormatter={v => `${v}h`}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fill: '#9898a8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 6 }} />

          <Bar dataKey="deliveries" radius={[5, 5, 0, 0]} maxBarSize={20}>
            {chartData.map((_, i) => (
              <Cell key={i} fill="#0d7377" fillOpacity={0.85} />
            ))}
          </Bar>

          <Bar dataKey="failures" radius={[5, 5, 0, 0]} maxBarSize={20}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill="#dc2626" fillOpacity={entry.failures > 0 ? 0.7 : 0} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
