import { useState } from 'react'
import { Package, MapPin, CheckCircle, X } from 'lucide-react'
import clsx from 'clsx'
import { acceptBroadcast } from '../../api'

function PackageSizeTag({ size }) {
  const config = {
    small:  { bg: 'bg-blue-500/20',   text: 'text-blue-300',   label: 'Small'  },
    medium: { bg: 'bg-amber-500/20',  text: 'text-amber-300',  label: 'Medium' },
    large:  { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'Large'  },
  }
  const c = config[size] ?? config.medium
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', c.bg, c.text)}>
      {c.label}
    </span>
  )
}

export default function BroadcastCard({ broadcast, onAccept, onDecline }) {
  const [state, setState] = useState('idle') // idle | accepting | accepted | declined
  const [pickupCode, setPickupCode] = useState('')

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

  const handleDecline = () => {
    setState('declined')
    onDecline?.(broadcast)
  }

  if (state === 'accepted') {
    return (
      <div className="glass-raised p-4 animate-bounce-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Package Accepted!</p>
            <p className="text-xs text-white/40">#{broadcast.order_id}</p>
          </div>
        </div>
        <div className="bg-navy-900 rounded-xl p-3 text-center">
          <p className="text-xs text-white/40 mb-1">Pickup Code</p>
          <p className="text-2xl font-mono font-bold text-teal-400 tracking-[0.3em]">{pickupCode}</p>
        </div>
        <p className="text-xs text-white/30 text-center mt-2">Driver will show this code on arrival</p>
      </div>
    )
  }

  if (state === 'declined') {
    return (
      <div className="glass p-4 opacity-40">
        <p className="text-sm text-center text-white/40">Package declined</p>
      </div>
    )
  }

  return (
    <div className="glass-raised p-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-white">Incoming Package</p>
          <p className="text-xs text-white/40 font-mono">#{broadcast.order_id}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
      </div>

      {/* Details */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span>{broadcast.distance_m < 1000
            ? `${Math.round(broadcast.distance_m)}m`
            : `${(broadcast.distance_m / 1000).toFixed(1)}km`} away</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Package className="w-3.5 h-3.5 text-amber-400" />
          <PackageSizeTag size={broadcast.package_size} />
        </div>
        {broadcast.weight_kg && (
          <span className="text-xs text-white/40">{broadcast.weight_kg}kg</span>
        )}
      </div>

      {/* Reward */}
      <div className="flex items-center justify-between bg-teal-500/10 rounded-xl px-3 py-2 mb-3">
        <span className="text-xs text-white/50">Storage reward</span>
        <span className="text-sm font-bold text-teal-400">+₹{broadcast.reward ?? 25}</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          id={`btn-accept-${broadcast.id}`}
          onClick={handleAccept}
          disabled={state === 'accepting'}
          className="flex-1 py-3 rounded-xl bg-teal-500 text-navy-900 font-bold text-sm
                     hover:bg-teal-400 active:scale-95 transition-all"
        >
          {state === 'accepting' ? '...' : '✓ Accept'}
        </button>
        <button
          id={`btn-decline-${broadcast.id}`}
          onClick={handleDecline}
          className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-300 font-bold text-sm
                     border border-red-500/30 hover:bg-red-500/30 active:scale-95 transition-all"
        >
          ✕ Decline
        </button>
      </div>
    </div>
  )
}
