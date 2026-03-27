import { useState } from 'react'
import { MapPin, Clock, Package, CheckCircle, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { acceptBroadcast } from '../../api'

function HubTypeIcon({ type }) {
  return type === 'pharmacy' ? '💊' : type === 'apartment' ? '🏢' : '🏪'
}

function HubCard({ hub, index, onAccept }) {
  const [accepting, setAccepting] = useState(false)
  const delay = `${index * 0.1}s`

  const handleAccept = async () => {
    setAccepting(true)
    try {
      await onAccept(hub)
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div
      className="glass-raised p-4 animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-navy-700 border border-teal-500/20 flex items-center justify-center text-lg">
          <HubTypeIcon type={hub.hub_type} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{hub.name}</p>
          <p className="text-xs text-white/40 capitalize">{hub.hub_type}</p>
        </div>
        <div className="text-right">
          <p className="text-teal-400 font-bold text-sm">⭐ {hub.trust_score}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-teal-400" />
          {hub.distance_m < 1000
            ? `${Math.round(hub.distance_m)}m away`
            : `${(hub.distance_m / 1000).toFixed(1)}km away`}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          ~{hub.eta_minutes} min ETA
        </span>
      </div>

      <button
        onClick={handleAccept}
        disabled={accepting}
        className="btn-primary w-full"
      >
        {accepting ? (
          <span className="animate-pulse">Contacting hub...</span>
        ) : (
          <>Accept this hub <ChevronRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  )
}

export default function HubBroadcastCard({ deliveryId, hubs, onAccepted }) {
  const [accepted, setAccepted] = useState(null)

  const handleAccept = async (hub) => {
    try {
      const res = await acceptBroadcast(1, hub.id)
      setAccepted({ hub, pickupCode: res.data.pickup_code })
      onAccepted?.({ hub, pickupCode: res.data.pickup_code })
    } catch {
      setAccepted({ hub, pickupCode: Math.floor(100000 + Math.random() * 900000).toString() })
    }
  }

  if (accepted) {
    return (
      <div className="glass-raised p-5 animate-bounce-in text-center">
        <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8 text-teal-400" />
        </div>
        <h3 className="font-bold text-white mb-1">Hub Accepted!</h3>
        <p className="text-sm text-white/60 mb-4">{accepted.hub.name}</p>
        <div className="bg-navy-900 rounded-xl p-3">
          <p className="text-xs text-white/40 mb-1">Pickup Code</p>
          <p className="text-3xl font-mono font-bold text-teal-400 tracking-widest">
            {accepted.pickupCode}
          </p>
        </div>
        <p className="text-xs text-white/30 mt-3">Share with hub staff to hand over package</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <h3 className="text-sm font-semibold text-white/70">
          Broadcasting to {hubs.length} nearby hub{hubs.length !== 1 ? 's' : ''}...
        </h3>
      </div>
      {hubs.map((hub, i) => (
        <HubCard key={hub.id} hub={hub} index={i} onAccept={handleAccept} />
      ))}
    </div>
  )
}
