import { useState, useEffect, useCallback } from 'react'
import { FleetMap } from '../../components/maps/LeafletMap'
import Sidebar from './Sidebar'
import StatsRow from './StatsRow'
import DeliveryChart from './DeliveryChart'
import DriverLeaderboard from './DriverLeaderboard'
import { ToastContainer, useToasts } from '../../components/ui/Toast'
import { useWebSocket } from '../../hooks/useWebSocket'
import { getDashboardStats, getFleet, getHourlyMetrics, getLeaderboard } from '../../api'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

// Fallback fleet data (Hyderabad coords)
const FALLBACK_FLEET = [
  { id: 1, name: 'Arjun Reddy',     lat: 17.4239, lng: 78.4738, status: 'en_route',  trust_score: 94 },
  { id: 2, name: 'Priya Sharma',    lat: 17.4456, lng: 78.3647, status: 'delivered', trust_score: 88 },
  { id: 3, name: 'Mohammed Farhan', lat: 17.4123, lng: 78.4501, status: 'failed',    trust_score: 79 },
  { id: 4, name: 'Sneha Patel',     lat: 17.4385, lng: 78.3892, status: 'arrived',   trust_score: 96 },
  { id: 5, name: 'Karthik Nair',    lat: 17.4501, lng: 78.4012, status: 'en_route',  trust_score: 71 },
]

const FALLBACK_STATS = {
  total_deliveries: 50,
  first_attempt_success_rate: 76.0,
  hub_reroutes: 8,
  co2_saved_kg: 6.4,
  active_drivers: 5,
}

export default function DashboardApp() {
  const [stats, setStats]           = useState(null)
  const [fleet, setFleet]           = useState(FALLBACK_FLEET)
  const [hourly, setHourly]         = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  const [lastUpdate, setLastUpdate]   = useState(new Date())
  const { toasts, addToast, removeToast } = useToasts()

  const fetchAll = useCallback(async () => {
    try {
      const [s, f, h, l] = await Promise.allSettled([
        getDashboardStats(),
        getFleet(),
        getHourlyMetrics(),
        getLeaderboard(),
      ])
      if (s.status === 'fulfilled') setStats(s.value.data)
      else setStats(FALLBACK_STATS)
      if (f.status === 'fulfilled') setFleet(f.value.data)
      if (h.status === 'fulfilled') setHourly(h.value.data)
      if (l.status === 'fulfilled') setLeaderboard(l.value.data)
      setLastUpdate(new Date())
    } catch {
      setStats(FALLBACK_STATS)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30_000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const handleWsMessage = useCallback((msg) => {
    setWsConnected(true)
    if (msg.type === 'delivery_failed') {
      addToast(
        `🔴 ${msg.data.driver_name}: Delivery failed — broadcasting to hubs`,
        'error',
      )
      fetchAll()
    } else if (msg.type === 'pong') {
      setWsConnected(true)
    }
  }, [addToast, fetchAll])

  useWebSocket(handleWsMessage)

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <Sidebar />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-navy-950/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-black text-white text-lg">Operations Dashboard</h1>
            <p className="text-xs text-white/40">
              Hyderabad Fleet · Updated {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs ${wsConnected ? 'text-teal-400' : 'text-white/30'}`}>
              {wsConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {wsConnected ? 'Live' : 'Offline'}
            </div>
            <button
              id="btn-refresh"
              onClick={fetchAll}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-7xl">
          {/* Stats row */}
          <StatsRow stats={stats} />

          {/* Fleet map */}
          <div className="glass-raised p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white">Live Fleet Map</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {fleet.length} active drivers · Hyderabad
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                {[
                  { status: 'delivered', color: 'bg-teal-500',  label: 'Delivered' },
                  { status: 'en_route',  color: 'bg-amber-500', label: 'En Route'  },
                  { status: 'arrived',   color: 'bg-blue-500',  label: 'Arrived'   },
                  { status: 'failed',    color: 'bg-red-500',   label: 'Failed'    },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ height: '360px' }}>
              <FleetMap drivers={fleet} height="360px" />
            </div>
          </div>

          {/* Chart + Leaderboard */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3">
              <DeliveryChart data={hourly} />
            </div>
            <div className="xl:col-span-2">
              <DriverLeaderboard data={leaderboard} />
            </div>
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
