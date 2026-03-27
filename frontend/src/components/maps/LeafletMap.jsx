import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix Leaflet default icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_COLORS = {
  en_route:  '#f59e0b',
  arrived:   '#3b82f6',
  delivered: '#00c9b1',
  failed:    '#ef4444',
}

export function createDriverIcon(status) {
  const color = STATUS_COLORS[status] ?? '#94a3b8'
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:${color};
        border:3px solid rgba(255,255,255,0.9);
        box-shadow:0 0 12px ${color}88;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;
      ">🛵</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

export function createHubIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:32px;height:32px;border-radius:8px;
        background:#1e3a6e;
        border:2px solid #00c9b1;
        box-shadow:0 0 10px #00c9b188;
        display:flex;align-items:center;justify-content:center;
        font-size:14px;
      ">🏪</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export function createDeliveryPin() {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:#00c9b1;
        border:2px solid white;
        box-shadow:0 0 12px #00c9b1aa;
      "></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  })
}

function RecenterMap({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true })
  }, [lat, lng, map])
  return null
}

export function DeliveryMap({ lat, lng, height = '220px' }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height, width: '100%', borderRadius: '1rem' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <RecenterMap lat={lat} lng={lng} />
      <Marker position={[lat, lng]} icon={createDeliveryPin()}>
        <Popup>Delivery Location</Popup>
      </Marker>
    </MapContainer>
  )
}

export function FleetMap({ drivers = [], height = '100%' }) {
  const center = [17.4239, 78.4738]
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height, width: '100%', borderRadius: '1rem' }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {drivers.map((d) => (
        <Marker key={d.id} position={[d.lat, d.lng]} icon={createDriverIcon(d.status)}>
          <Popup>
            <div className="text-xs font-medium">
              <p className="font-bold">{d.name}</p>
              <p className="text-gray-500 capitalize">{d.status.replace('_', ' ')}</p>
              {d.current_delivery && <p className="mt-1 text-gray-600 max-w-[180px]">{d.current_delivery}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
