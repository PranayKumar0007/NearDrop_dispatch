import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, Truck, Store } from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Operations', sub: 'Fleet & Analytics' },
  { to: '/driver',    icon: Truck,            label: 'Driver View', sub: 'Mobile Interface'  },
  { to: '/hub',       icon: Store,            label: 'Hub Owner',   sub: 'Store Dashboard'   },
]

export default function Sidebar() {
  return (
    <aside
      className="w-60 flex flex-col h-screen sticky top-0 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.82)',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0d7377 0%, #14a09e 100%)',
              boxShadow: '0 4px 14px rgba(13,115,119,0.35)',
            }}
          >
            N
          </div>
          <div>
            <p className="font-black leading-none tracking-tight" style={{ fontSize: 15, color: '#111117' }}>
              NearDrop
            </p>
            <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-widest" style={{ color: '#0d7377', opacity: 0.7 }}>
              Last Mile Ops
            </p>
          </div>
        </Link>
      </div>

      {/* Live status pill */}
      <div className="mx-4 mb-5">
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(13,115,119,0.07)', border: '1px solid rgba(13,115,119,0.15)' }}
        >
          <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
            <span
              className="absolute inline-flex w-2 h-2 rounded-full opacity-70"
              style={{ background: '#0d7377', animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
            />
            <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: '#0d7377' }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold" style={{ color: '#111117' }}>System Live</p>
            <p className="text-[10px]" style={{ color: '#6b6b7b' }}>Hyderabad · 5 drivers</p>
          </div>
        </div>
      </div>

      <p className="px-5 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9898a8' }}>
        Interfaces
      </p>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, sub }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150',
              'border',
              isActive
                ? 'border-[rgba(13,115,119,0.18)] bg-[rgba(13,115,119,0.07)]'
                : 'border-transparent hover:bg-black/[0.03] hover:border-black/[0.04]',
            )}
          >
            {({ isActive }) => (
              <>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? 'rgba(13,115,119,0.12)' : 'rgba(0,0,0,0.05)',
                    boxShadow: isActive ? '0 2px 8px rgba(13,115,119,0.15)' : 'none',
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isActive ? '#0d7377' : '#6b6b7b' }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none" style={{ color: isActive ? '#0d7377' : '#3f3f4a' }}>
                    {label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#9898a8' }}>{sub}</p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3" style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

      {/* User footer */}
      <div className="px-4 pb-6">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #0d7377, #6366f1)' }}
          >
            OP
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-none" style={{ color: '#111117' }}>Operator</p>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: '#9898a8' }}>admin@neardrop.in</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes ping { 75%,100%{transform:scale(2);opacity:0} }`}</style>
    </aside>
  )
}
