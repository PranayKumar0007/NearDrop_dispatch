import { useState, useEffect, useCallback } from 'react'
import { IndianRupee, Package, CheckCircle2, LayoutDashboard, RefreshCw, Store } from 'lucide-react'
import { TrustBadge } from '../../components/ui/Badge'
import { ToastContainer, useToasts } from '../../components/ui/Toast'
import BroadcastCard from './BroadcastCard'
import { getHubStats, getActiveBroadcasts } from '../../api'
import { Link } from 'react-router-dom'

const HUB_ID = 1

export default function HubApp() {
  const [stats, setStats]         = useState(null)
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading]     = useState(true)
  const [polling, setPolling]     = useState(false)
  const { toasts, addToast, removeToast } = useToasts()

  const fetchStats = useCallback(async () => {
    try {
      const res = await getHubStats(HUB_ID)
      setStats(res.data)
    } catch {}
  }, [])

  const fetchBroadcasts = useCallback(async (silent = true) => {
    if (!silent) setPolling(true)
    try {
      const res = await getActiveBroadcasts(HUB_ID)
      setBroadcasts(res.data.map(b => ({
        id: b.id, hub_id: HUB_ID,
        order_id: b.delivery.order_id,
        package_size: b.delivery.package_size,
        weight_kg: b.delivery.weight_kg,
        distance_m: b.distance_m,
        reward: b.reward,
      })))
    } catch {}
    finally { setPolling(false) }
  }, [])

  const initialFetch = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchStats(), fetchBroadcasts()])
    setLoading(false)
  }, [fetchStats, fetchBroadcasts])

  useEffect(() => {
    initialFetch()
    const iv = setInterval(fetchBroadcasts, 8000)
    return () => clearInterval(iv)
  }, [initialFetch, fetchBroadcasts])

  const handleAccept = b => {
    setBroadcasts(prev => prev.filter(x => x.id !== b.id))
    setTimeout(fetchStats, 600)
    addToast(`Package #${b.order_id} accepted! +₹${b.reward}`, 'success')
  }
  const handleDecline = b => {
    setBroadcasts(prev => prev.filter(x => x.id !== b.id))
    addToast(`Package #${b.order_id} declined`, 'info')
  }

  const STAT_ITEMS = [
    {
      icon: IndianRupee, label: 'Earned Today',
      value: loading ? '—' : `₹${Number(stats?.today_earnings ?? 0).toFixed(0)}`,
      iconBg: 'rgba(13,115,119,0.08)', iconColor: '#0d7377', border: 'rgba(13,115,119,0.14)',
    },
    {
      icon: CheckCircle2, label: 'Accepted',
      value: loading ? '—' : (stats?.accepted_count ?? 0),
      iconBg: 'rgba(37,99,235,0.08)', iconColor: '#2563eb', border: 'rgba(37,99,235,0.12)',
    },
    {
      icon: Package, label: 'Pending',
      value: broadcasts.length, pulse: broadcasts.length > 0,
      iconBg: 'rgba(217,119,6,0.08)', iconColor: '#d97706', border: 'rgba(217,119,6,0.16)',
    },
  ]

  return (
    <div className="min-h-dvh" style={{ background: '#f5f4f1' }}>
      <div className="bg-mesh" />

      <div className="relative z-10 max-w-sm mx-auto min-h-dvh flex flex-col">

        {/* Header */}
        <header className="px-5 pt-7 pb-5">
          {/* Top row */}
          <div className="flex items-start justify-between mb-5">
            <Link
              to="/dashboard"
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(0,0,0,0.07)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <LayoutDashboard className="w-4 h-4" style={{ color: '#6b6b7b' }} />
            </Link>

            <div className="flex items-center gap-2">
              {polling && <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: '#0d7377' }} />}
              <TrustBadge score={stats?.trust_score ?? 0} />
            </div>
          </div>

          {/* Hub identity */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Store className="w-3 h-3" style={{ color: '#2563eb' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2563eb', opacity: 0.8 }}>
                Hub Owner
              </span>
            </div>
            <h1 className="font-black leading-tight" style={{ fontSize: 22, color: '#111117' }}>
              {loading ? (
                <span className="skeleton inline-block h-7 w-44 rounded-lg" />
              ) : (stats?.name ?? 'Hub Dashboard')}
            </h1>
            <p className="text-xs mt-1" style={{ color: '#9898a8' }}>Accepting packages · auto-refreshing</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {STAT_ITEMS.map(({ icon: Icon, label, value, iconBg, iconColor, border, pulse }) => (
              <div
                key={label}
                className="flex flex-col items-center py-3 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.72)',
                  border: `1px solid ${border}`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                {pulse && (
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{
                      background: iconColor,
                      animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                    }}
                  />
                )}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: iconBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <p className="text-base font-black leading-none" style={{ color: '#111117' }}>{value}</p>
                <p className="text-[10px] mt-1 font-medium" style={{ color: '#9898a8' }}>{label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Broadcasts list */}
        <div className="px-5 pb-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{
                  background: broadcasts.length ? '#0d7377' : '#d1d5db',
                  boxShadow: broadcasts.length ? '0 0 0 3px rgba(13,115,119,0.15)' : 'none',
                }}
              />
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9898a8' }}>
                Incoming Requests
              </h2>
            </div>
            {broadcasts.length > 0 && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(13,115,119,0.08)',
                  color: '#0d7377',
                  border: '1px solid rgba(13,115,119,0.18)',
                }}
              >
                {broadcasts.length} new
              </span>
            )}
          </div>

          {broadcasts.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 rounded-2xl text-center"
              style={{
                background: 'rgba(255,255,255,0.55)',
                border: '1.5px dashed rgba(0,0,0,0.1)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <Package className="w-10 h-10 mb-3" style={{ color: '#e5e7eb' }} />
              <p className="text-sm font-semibold" style={{ color: '#6b6b7b' }}>No broadcasts right now</p>
              <p className="text-[11px] mt-1" style={{ color: '#9898a8' }}>Auto-refreshes every 8 seconds</p>
              <button
                onClick={() => fetchBroadcasts(false)}
                className="mt-4 text-sm font-bold"
                style={{ color: '#0d7377' }}
              >
                Refresh now
              </button>
            </div>
          ) : (
            broadcasts.map(b => (
              <BroadcastCard key={b.id} broadcast={b} onAccept={handleAccept} onDecline={handleDecline} />
            ))
          )}
        </div>

        {/* Recent Activity */}
        <div className="px-5 pb-8 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4" style={{ color: '#0d7377' }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9898a8' }}>
              Recent Activity
            </h2>
          </div>

          <BroadcastCard
            broadcast={{ order_id: 'ND10006' }}
            initialState="accepted"
            initialPickupCode="847291"
          />

          {[

            { id: 1, order: 'ND1028', time: '24m ago', amount: '₹25', status: 'In Storage' },
            { id: 2, order: 'ND1015', time: '1h ago', amount: '₹40', status: 'Delivered' },
            { id: 3, order: 'ND0992', time: '3h ago', amount: '₹25', status: 'Delivered' },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(13,115,119,0.06)', color: '#0d7377' }}
                >
                  {item.order[0]}
                  {item.order.slice(-2)}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#111117' }}>
                    {item.order}
                  </p>
                  <p className="text-[11px]" style={{ color: '#9898a8' }}>
                    {item.time} · {item.status}
                  </p>
                </div>
              </div>
              <p className="text-sm font-black" style={{ color: '#0d7377' }}>
                +{item.amount}
              </p>
            </div>
          ))}

          {/* Tips Card to fill even more space if needed */}
          <div
            className="rounded-2xl p-5 mt-6"
            style={{
              background: 'linear-gradient(135deg, rgba(13,115,119,0.08) 0%, rgba(37,99,235,0.06) 100%)',
              border: '1px solid rgba(13,115,119,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-3.5 h-3.5" style={{ color: '#0d7377' }} />
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#0d7377' }}>
                Hub Insights
              </p>
            </div>
            <p className="text-xs font-semibold leading-relaxed" style={{ color: '#3f3f4a' }}>
              Tuesdays are your busiest days. Ensure you have dedicated shelf space for "Large" packages to maintain your 91% fulfillment score.
            </p>
          </div>
        </div>
      </div>


      <ToastContainer toasts={toasts} onClose={removeToast} />
      <style>{`@keyframes ping { 75%,100%{transform:scale(2);opacity:0} }`}</style>
    </div>
  )
}
