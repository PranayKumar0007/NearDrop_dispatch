import { useState } from 'react'
import { Package, MapPin, Clock, CheckCircle, Weight } from 'lucide-react'
import { acceptBroadcast } from '../../api'

const SIZE_CONFIG = {
  small:  { label: 'Small',  color: '#2563eb', bg: 'rgba(37,99,235,0.07)',  border: 'rgba(37,99,235,0.14)'  },
  medium: { label: 'Medium', color: '#d97706', bg: 'rgba(217,119,6,0.07)',  border: 'rgba(217,119,6,0.16)'  },
  large:  { label: 'Large',  color: '#7c3aed', bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.15)' },
}

export default function BroadcastCard({
  broadcast,
  onAccept,
  onDecline,
  initialState = 'idle',
  initialPickupCode = '',
}) {
  const [state, setState] = useState(initialState)
  const [pickupCode, setPickupCode] = useState(initialPickupCode)
  const sizeCfg = SIZE_CONFIG[broadcast.package_size] ?? SIZE_CONFIG.medium


  const handleAccept = async () => {
    setState('accepting')
    try {
      const res = await acceptBroadcast(broadcast.id, broadcast.hub_id)
      setPickupCode(res.data.pickup_code)
      setState('accepted')
      onAccept?.(broadcast, res.data.pickup_code)
    } catch {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setPickupCode(code)
      setState('accepted')
      onAccept?.(broadcast, code)
    }
  }
  const handleDecline = () => { setState('declined'); onDecline?.(broadcast) }

  if (state === 'declined') return null

  if (state === 'accepted') {
    return (
      <div
        className="animate-bounce-in rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(13,115,119,0.18)',
          boxShadow: '0 8px 40px rgba(13,115,119,0.12)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div style={{ height: 3, background: 'linear-gradient(90deg, #0d7377, #34d399)' }} />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(13,115,119,0.2)' }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: '#0d7377' }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#111117' }}>Package Accepted</p>
              <p className="text-[11px] font-mono" style={{ color: '#9898a8' }}>#{broadcast.order_id}</p>
            </div>
          </div>

          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9898a8' }}>
              Pickup Code — Show to Driver
            </p>
            <p
              className="font-black tracking-[0.3em] leading-none"
              style={{ fontSize: 26, color: '#0d7377' }}
            >
              {pickupCode}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="broadcast-card animate-slide-up">
      {/* Urgency strip */}
      <div
        style={{
          height: 2,
          background: 'linear-gradient(90deg, #d97706, #0d7377)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2.5s linear infinite',
        }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: '#d97706', animation: 'ping 2s infinite' }}
              />
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#d97706' }}>
                New Request
              </p>
            </div>
            <p className="font-bold text-sm" style={{ color: '#111117' }}>Incoming Package</p>
          </div>
          <span
            className="font-mono text-[11px] px-2 py-1 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#9898a8', border: '1px solid rgba(0,0,0,0.07)' }}
          >
            #{broadcast.order_id}
          </span>
        </div>

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#6b6b7b', border: '1px solid rgba(0,0,0,0.07)' }}
          >
            <MapPin className="w-3 h-3" style={{ color: '#2563eb' }} />
            {broadcast.distance_m < 1000
              ? `${Math.round(broadcast.distance_m)}m`
              : `${(broadcast.distance_m / 1000).toFixed(1)}km`}
          </span>

          <span
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: sizeCfg.bg, color: sizeCfg.color, border: `1px solid ${sizeCfg.border}` }}
          >
            <Package className="w-3 h-3" />
            {sizeCfg.label}
          </span>

          {broadcast.weight_kg && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.04)', color: '#6b6b7b', border: '1px solid rgba(0,0,0,0.07)' }}
            >
              <Weight className="w-3 h-3" />
              {broadcast.weight_kg}kg
            </span>
          )}
        </div>

        {/* Reward */}
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-4"
          style={{
            background: 'rgba(13,115,119,0.05)',
            border: '1px solid rgba(13,115,119,0.14)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" style={{ color: '#9898a8' }} />
            <span className="text-xs font-medium" style={{ color: '#6b6b7b' }}>Storage reward</span>
          </div>
          <span className="font-black text-base" style={{ color: '#0d7377' }}>+₹{broadcast.reward ?? 25}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            id={`btn-accept-${broadcast.id}`}
            onClick={handleAccept}
            disabled={state === 'accepting'}
            className="btn-primary flex-1 text-sm"
          >
            {state === 'accepting'
              ? <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" />
              : '✓ Accept Package'
            }
          </button>
          <button
            id={`btn-decline-${broadcast.id}`}
            onClick={handleDecline}
            className="btn-danger px-4"
          >
            ✕
          </button>
        </div>
      </div>
      <style>{`@keyframes ping { 75%,100%{transform:scale(2.5);opacity:0} } @keyframes shimmer { 0%{background-position:-400% 0} 100%{background-position:400% 0} }`}</style>
    </div>
  )
}
