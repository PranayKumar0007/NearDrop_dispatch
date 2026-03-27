import { useState, useEffect } from 'react'
import { TrendingUp, Package, IndianRupee } from 'lucide-react'
import { TrustBadge } from '../../components/ui/Badge'
import { ToastContainer, useToasts } from '../../components/ui/Toast'
import BroadcastCard from './BroadcastCard'

const MOCK_HUB = {
  id: 1,
  name: 'Sri Ram Kirana Store',
  owner_name: 'Ramesh Kumar',
  hub_type: 'kirana',
  trust_score: 91,
  today_earnings: 125.0,
}

const MOCK_BROADCASTS = [
  {
    id: 1,
    hub_id: 1,
    order_id: 'ND10002',
    package_size: 'medium',
    weight_kg: 2.5,
    distance_m: 320,
    reward: 25,
  },
  {
    id: 2,
    hub_id: 1,
    order_id: 'ND10017',
    package_size: 'small',
    weight_kg: 0.8,
    distance_m: 510,
    reward: 25,
  },
  {
    id: 3,
    hub_id: 1,
    order_id: 'ND10031',
    package_size: 'large',
    weight_kg: 7.2,
    distance_m: 190,
    reward: 40,
  },
]

export default function HubApp() {
  const [broadcasts, setBroadcasts] = useState(MOCK_BROADCASTS)
  const [earnings, setEarnings] = useState(MOCK_HUB.today_earnings)
  const [accepted, setAccepted] = useState(0)
  const { toasts, addToast, removeToast } = useToasts()

  const handleAccept = (broadcast) => {
    setEarnings((e) => e + (broadcast.reward ?? 25))
    setAccepted((a) => a + 1)
    addToast(`Package #${broadcast.order_id} accepted! +₹${broadcast.reward ?? 25}`, 'success')
  }

  const handleDecline = (broadcast) => {
    addToast(`Package #${broadcast.order_id} declined`, 'info')
  }

  // Simulate a new incoming broadcast after 8 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setBroadcasts((prev) => [
        ...prev,
        {
          id: 99,
          hub_id: 1,
          order_id: 'ND10045',
          package_size: 'small',
          weight_kg: 1.1,
          distance_m: 420,
          reward: 25,
        },
      ])
      addToast('New package broadcast received!', 'info')
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-dvh bg-navy-950 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-navy-900 border-b border-white/5 px-4 pt-safe-top pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-navy-900 font-black text-xs">N</div>
              <span className="text-xs font-semibold text-white/50">Hub Dashboard</span>
            </div>
            <h1 className="font-bold text-white text-lg leading-tight">{MOCK_HUB.name}</h1>
            <p className="text-xs text-white/40">{MOCK_HUB.owner_name}</p>
          </div>
          <TrustBadge score={MOCK_HUB.trust_score} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass rounded-xl p-3 text-center">
            <IndianRupee className="w-4 h-4 text-teal-400 mx-auto mb-1" />
            <p className="text-base font-bold text-white">₹{earnings.toFixed(0)}</p>
            <p className="text-xs text-white/40">Today</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <Package className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-base font-bold text-white">{accepted}</p>
            <p className="text-xs text-white/40">Accepted</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-base font-bold text-white">{broadcasts.length}</p>
            <p className="text-xs text-white/40">Pending</p>
          </div>
        </div>
      </div>

      {/* Broadcast list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <h2 className="text-sm font-semibold text-white/70">Incoming Broadcasts</h2>
        </div>

        {broadcasts.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No broadcasts right now</p>
          </div>
        ) : (
          broadcasts.map((b) => (
            <BroadcastCard
              key={b.id}
              broadcast={b}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))
        )}
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
