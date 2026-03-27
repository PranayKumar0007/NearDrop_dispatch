import { useState, useCallback } from 'react'
import { TrustBadge } from '../../components/ui/Badge'
import { ToastContainer, useToasts } from '../../components/ui/Toast'
import MicButton from './MicButton'
import DeliveryCard from './DeliveryCard'
import HubBroadcastCard from './HubBroadcastCard'
import { failDelivery, getDriverScore } from '../../api'
import { ChevronLeft } from 'lucide-react'

// Mock current driver + delivery (driver 1 is Arjun Reddy — en_route)
const MOCK_DRIVER = {
  id: 1,
  name: 'Arjun Reddy',
  trust_score: 94,
  vehicle: 'Royal Enfield',
}

const MOCK_DELIVERY = {
  id: 1,
  order_id: 'ND10000',
  address: 'Flat 3B, Vasavi Towers, Kondapur, Hyderabad - 500084',
  status: 'en_route',
  recipient_name: 'Rahul Verma',
  package_size: 'medium',
  weight_kg: 2.5,
}

const DRIVER_LAT = 17.4239
const DRIVER_LNG = 78.4738

export default function DriverApp() {
  const [delivery, setDelivery] = useState(MOCK_DELIVERY)
  const [hubs, setHubs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const { toasts, addToast, removeToast } = useToasts()

  const handleVoiceCommand = useCallback((transcript) => {
    if (transcript.includes('fail') || transcript.includes('failed') || transcript.includes('unable')) {
      handleStatusChange('failed')
    } else if (transcript.includes('deliver') || transcript.includes('done') || transcript.includes('complete')) {
      handleStatusChange('delivered')
    } else if (transcript.includes('arriv') || transcript.includes('here') || transcript.includes('reached')) {
      handleStatusChange('arrived')
    } else {
      addToast(`Heard: "${transcript}" — command not recognized`, 'info')
    }
  }, [delivery.status])

  const handleStatusChange = useCallback(async (newStatus) => {
    if (delivery.status === 'delivered' || delivery.status === 'failed') return

    setDelivery((prev) => ({ ...prev, status: newStatus }))

    if (newStatus === 'failed') {
      setLoading(true)
      addToast('Broadcasting to nearby hubs...', 'info')
      try {
        const res = await failDelivery(delivery.id, DRIVER_LAT, DRIVER_LNG)
        setHubs(res.data.nearby_hubs)
        setShowBroadcast(true)
        if (res.data.nearby_hubs.length === 0) {
          addToast('No hubs available nearby', 'error')
        }
      } catch {
        // Fallback mock hubs
        setHubs([
          { id: 1, name: 'Sri Ram Kirana Store', hub_type: 'kirana', distance_m: 320, eta_minutes: 2, trust_score: 91 },
          { id: 6, name: 'Hitech City Kirana', hub_type: 'kirana', distance_m: 680, eta_minutes: 4, trust_score: 93 },
          { id: 3, name: 'City Pharmacy - Kondapur', hub_type: 'pharmacy', distance_m: 950, eta_minutes: 6, trust_score: 95 },
        ])
        setShowBroadcast(true)
      } finally {
        setLoading(false)
      }
    } else if (newStatus === 'delivered') {
      addToast('Delivery marked as complete! 🎉', 'success')
    } else if (newStatus === 'arrived') {
      addToast('Arrival confirmed', 'success')
    }
  }, [delivery])

  return (
    <div className="min-h-dvh bg-navy-950 flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-navy-900 font-black text-xs">N</div>
            <span className="text-sm font-bold text-white">NearDrop</span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">{MOCK_DRIVER.name} · {MOCK_DRIVER.vehicle}</p>
        </div>
        <TrustBadge score={MOCK_DRIVER.trust_score} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Delivery card */}
        <DeliveryCard
          delivery={delivery}
          onStatusChange={handleStatusChange}
        />

        {/* Voice section */}
        {delivery.status !== 'delivered' && delivery.status !== 'failed' && (
          <div className="glass rounded-2xl p-6">
            <p className="text-center text-xs text-white/40 mb-4 uppercase tracking-widest">Voice Command</p>
            <MicButton onCommand={handleVoiceCommand} />

            {/* Text fallback */}
            <form
              className="mt-4"
              onSubmit={(e) => {
                e.preventDefault()
                const val = e.target.command.value.trim()
                if (val) {
                  handleVoiceCommand(val.toLowerCase())
                  e.target.reset()
                }
              }}
            >
              <div className="flex gap-2">
                <input
                  id="text-command"
                  name="command"
                  className="input flex-1 text-sm"
                  placeholder="Or type a command..."
                />
                <button type="submit" className="btn-primary px-4">→</button>
              </div>
            </form>
          </div>
        )}

        {/* Hub broadcast */}
        {showBroadcast && hubs && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">Nearby Hubs</h2>
              <button onClick={() => setShowBroadcast(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <HubBroadcastCard
              deliveryId={delivery.id}
              hubs={hubs}
              onAccepted={() => addToast('Hub confirmed! Hand over to staff.', 'success')}
            />
          </div>
        )}

        {loading && (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-white/40">Finding nearby hubs...</p>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
