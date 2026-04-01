import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Ship, Users } from 'lucide-react'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log',       icon: BookOpen,        label: 'Log'       },
  { to: '/boats',     icon: Ship,            label: 'Boats'     },
  { to: '/crew',      icon: Users,           label: 'Crew'      },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Frosted glass bar */}
      <div
        className="mx-2 mb-2 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(5, 15, 32, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.12)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(56,189,248,0.08)',
        }}
      >
        <div className="flex">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center justify-center py-2.5 gap-0.5 text-[0.65rem] font-semibold tracking-wide uppercase transition-colors ${
                  isActive ? 'text-sky-400' : 'text-slate-500 active:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pill glow */}
                  {isActive && (
                    <span
                      className="absolute inset-x-3 top-0 h-px rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                        boxShadow: '0 0 8px rgba(56, 189, 248, 0.8)',
                      }}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.5}
                    className={isActive ? 'drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]' : ''}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
