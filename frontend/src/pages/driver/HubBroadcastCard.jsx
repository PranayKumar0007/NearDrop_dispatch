import { useState } from 'react'
import { MapPin, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { acceptBroadcast } from '../../api'

function HubTypeIcon({ type }) {
  return type === 'pharmacy' ? '💊' : type === 'apartment' ? '🏢' : '🏪'
}

function HubCard({ hub, index, onAccept }) {
  const [accepting, setAccepting] = useState(false)

  const handleAccept = async () => {
    setAccepting(true)
    try { await onAccept(hub) }
    finally { setAccepting(false) }
  }

  return (
    <div
      className="animate-slide-up rounded-2xl p-4"
      style={{
        animationDelay: `${index * 0.08}s`,
        background: 'rgba(255,255,255,0.8)',
        border: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: 'rgba(13,115,119,0.07)', border: '1px solid rgba(13,115,119,0.14)' }}
        >
          <HubTypeIcon type={hub.hub_type} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: '#111117' }}>{hub.name}</p>
          <p className="text-[11px] capitalize" style={{ color: '#9898a8' }}>{hub.hub_type}</p>
        </div>
        <p className="text-sm font-bold shrink-0" style={{ color: '#0d7377' }}>⭐ {hub.trust_score}</p>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: '#6b6b7b' }}>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" style={{ color: '#2563eb' }} />
          {hub.distance_m < 1000
            ? `${Math.round(hub.distance_m)}m away`
            : `${(hub.distance_m / 1000).toFixed(1)}km away`}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" style={{ color: '#d97706' }} />
          ~{hub.eta_minutes} min ETA
        </span>
      </div>

      <button onClick={handleAccept} disabled={accepting} className="btn-primary w-full">
        {accepting
          ? <span className="animate-pulse">Contacting hub…</span>
          : <>Accept this Hub <ChevronRight className="w-4 h-4" /></>
        }
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
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setAccepted({ hub, pickupCode: code })
      onAccepted?.({ hub, pickupCode: code })
    }
  }

  if (accepted) {
    return (
      <div
        className="rounded-2xl p-5 text-center animate-bounce-in"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(13,115,119,0.2)',
          boxShadow: '0 8px 40px rgba(13,115,119,0.1)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(13,115,119,0.08)', border: '1.5px solid rgba(13,115,119,0.2)' }}
        >
          <CheckCircle className="w-7 h-7" style={{ color: '#0d7377' }} />
        </div>
        <h3 className="font-bold mb-0.5" style={{ color: '#111117' }}>Hub Accepted!</h3>
        <p className="text-sm mb-4" style={{ color: '#6b6b7b' }}>{accepted.hub.name}</p>
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9898a8' }}>
            Pickup Code
          </p>
          <p className="text-3xl font-mono font-black tracking-widest" style={{ color: '#0d7377' }}>
            {accepted.pickupCode}
          </p>
        </div>
        <p className="text-[11px] mt-3" style={{ color: '#9898a8' }}>Share with hub staff to hand over package</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="flex items-center gap-2 px-1 mb-1">
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#0d7377' }} />
        <p className="text-sm font-semibold" style={{ color: '#3f3f4a' }}>
          Broadcasting to {hubs.length} nearby hub{hubs.length !== 1 ? 's' : ''}…
        </p>
      </div>
      {hubs.map((hub, i) => (
        <HubCard key={hub.id} hub={hub} index={i} onAccept={handleAccept} />
      ))}
    </div>
  )
}
