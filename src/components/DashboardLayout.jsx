import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  TrafficCone,
  AlertTriangle,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
} from 'lucide-react'
import {
  demoIntersections,
  demoNotifications,
  demoViolationEvents,
  demoViolators,
} from '../data/demoData'
import { readDemoCollection, readDemoValue, writeDemoCollection } from '../data/demoStore'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Traffic Lights', path: '/traffic-lights', icon: TrafficCone },
  { name: 'Violations', path: '/violations', icon: AlertTriangle },
  { name: 'Violators', path: '/violators', icon: Users },
  { name: 'Reports', path: '/reports', icon: FileText },
]

export default function DashboardLayout({ onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => readDemoCollection('notifications', demoNotifications).map((item) => ({ ...item, read: item.read ?? false })))
  const [operatorAccount, setOperatorAccount] = useState(() => readDemoValue('settings', {}).account || null)
  const navigate = useNavigate()
  const location = useLocation()
  const alertPreferences = readDemoValue('settings', {}).alerts || [true, true, true, true, false]
  const visibleNotifications = notifications.filter((notification) => {
    if (notification.preference === 'queue') return alertPreferences[3]
    if (notification.preference === 'sensors') return alertPreferences[2]
    if (notification.preference === 'priority') return alertPreferences[0]
    if (notification.preference === 'daily') return alertPreferences[4]
    return true
  })
  const storedViolators = readDemoCollection('violators', demoViolators)
  const storedViolations = readDemoCollection('violations', demoViolationEvents)

  useEffect(() => {
    const handleDemoUpdate = (event) => {
      if (event.detail === 'notifications') {
        setNotifications(readDemoCollection('notifications', demoNotifications).map((item) => ({ ...item, read: item.read ?? false })))
      }
      if (event.detail === 'settings') setOperatorAccount(readDemoValue('settings', {}).account || null)
    }
    window.addEventListener('adapt-demo-update', handleDemoUpdate)
    return () => window.removeEventListener('adapt-demo-update', handleDemoUpdate)
  }, [])

  const notificationsRead = !visibleNotifications.some((notification) => !notification.read)
  const displayName = operatorAccount?.name?.trim() || 'Mewpo Operator'
  const displayRole = operatorAccount?.role || 'Operator'
  const firstName = displayName.split(/\s+/)[0]
  const searchTargets = [
    ...navItems.map((item) => ({ label: item.name, detail: 'Page', path: item.path })),
    ...demoIntersections.map(({ id, name }) => ({ label: name, detail: 'Intersection', path: `/traffic-lights?intersection=${id}` })),
    ...storedViolators.map(({ id, plate, name }) => ({ label: plate, detail: name, path: `/violators?person=${id}` })),
    ...storedViolations.filter((event) => ['Review', 'Dispute'].includes(event.disposition)).map(({ id, type, plate, disposition }) => ({ label: plate, detail: type, path: `/violations?tab=${disposition === 'Dispute' ? 'disputes' : 'queue'}&event=${id}` })),
  ]
  const filteredTargets = searchQuery.trim()
    ? searchTargets.filter((target) => `${target.label} ${target.detail}`.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : []

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    } else {
      navigate('/login')
    }
  }

  const markNotificationsRead = (title) => {
    const updated = notifications.map((notification) => !title || notification.title === title
      ? { ...notification, read: true }
      : notification)
    writeDemoCollection('notifications', updated)
    setNotifications(updated)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0c0e] text-white font-sans">
      {/* ==========================================================
          DESKTOP SIDEBAR - Matches Photo 1 exactly
         ========================================================== */}
      <aside
        style={{ width: '200px', minWidth: '200px' }}
        className="hidden lg:flex flex-col bg-[#1c1c1f] border-r border-[#2a2a2e] relative z-20 select-none shrink-0"
      >
        {/* Brand Header */}
        <div className="flex items-center px-5 h-[76px] cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="text-[20px] font-black text-white tracking-tight mr-1">ADAPT -</span>
          {/* Intersecting Roads 'X' */}
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
            {/* Gray road curve */}
            <path d="M 6 26 C 14 22, 18 10, 26 6" stroke="#52525b" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 6 26 C 14 22, 18 10, 26 6" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="2 3" />
            {/* Green road curve */}
            <path d="M 6 6 C 14 10, 18 22, 26 26" stroke="#16a34a" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 6 6 C 14 10, 18 22, 26 26" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 3" />
          </svg>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 pt-3 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 ${
                  isActive
                    ? 'bg-[#16a34a] text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-[#28282c] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} strokeWidth={isActive ? 2.3 : 1.9} />
                  <span className="tracking-tight whitespace-nowrap">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section: Divider + Settings & Logout */}
        <div className="p-3 border-t border-[#2a2a2e]/80 space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-[#16a34a] text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-[#28282c] font-medium'
              }`
            }
          >
            <Settings size={16} />
            <span className="whitespace-nowrap">Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-zinc-400 hover:text-red-400 hover:bg-[#28282c] font-medium transition-all text-left cursor-pointer"
          >
            <LogOut size={16} />
            <span className="whitespace-nowrap">Logout</span>
          </button>
        </div>
      </aside>

      {/* ==========================================================
          MAIN CONTAINER: Header + Page Content
         ========================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0c0e]">
        {/* Global Top Bar - Crisp White Search Box, Bell, Avatar */}
        <header className="relative h-14 sm:h-[76px] px-3 sm:px-5 lg:px-12 flex items-center justify-between gap-2 sm:gap-6 shrink-0 z-10 border-b border-[#18181b]/50">
          {/* Mobile hamburger */}
          <div className="lg:hidden flex min-w-0 flex-1 items-center">
            <NavLink to="/dashboard" className="truncate text-[17px] font-black tracking-tight text-white">ADAPT<span className="text-emerald-500">-X</span></NavLink>
          </div>

          {/* Search Bar - Crisp White Rounded-MD Input */}
          <div className="relative hidden w-full min-w-0 max-w-[340px] flex-1 sm:block sm:w-[340px] sm:flex-none" onClick={(event) => event.stopPropagation()}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && filteredTargets[0]) {
                  navigate(filteredTargets[0].path)
                  setSearchQuery('')
                  setSearchOpen(false)
                }
                if (event.key === 'Escape') setSearchOpen(false)
              }}
              placeholder="Search Intersection, plates..."
              style={{ paddingLeft: '38px' }}
              className="w-full pr-4 py-2 bg-white text-zinc-900 placeholder:text-zinc-400 text-[13px] rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            <AnimatePresence>
              {searchOpen && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-900 shadow-xl"
                >
                  {filteredTargets.length ? filteredTargets.map((target) => (
                    <button
                      key={`${target.label}-${target.path}`}
                      type="button"
                      onClick={() => {
                        navigate(target.path)
                        setSearchQuery('')
                        setSearchOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left hover:bg-zinc-100"
                    >
                      <span className="text-[11px] font-medium">{target.label}</span>
                      <span className="text-[9px] text-zinc-400">{target.detail}</span>
                    </button>
                  )) : <p className="px-2.5 py-2 text-[11px] text-zinc-500">No matches found</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Header Badges: Notification Bell + Avatar (M) + Mewpo Operator */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((open) => !open)}
              aria-label={mobileSearchOpen ? 'Close search' : 'Search'}
              className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white sm:hidden"
            >
              <Search size={19} />
            </button>
            {/* Notification Bell - White rounded square button as in photo */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative flex h-9 w-9 items-center justify-center rounded-md bg-white text-zinc-800 shadow-sm transition-colors hover:bg-zinc-100 sm:rounded-xl"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell size={17} />
                {!notificationsRead && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-emerald-600" />}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-lg border border-zinc-200 bg-white p-3 text-zinc-900 shadow-xl"
                  >
                    <div className="mb-2 flex items-center justify-between border-b border-zinc-100 pb-2">
                      <span className="text-[12px] font-semibold">Notifications</span>
                      <button type="button" onClick={() => markNotificationsRead()} className="text-[9px] font-medium text-emerald-700 hover:text-emerald-900">Mark all read</button>
                    </div>
                    {visibleNotifications.map((notification) => (
                      <button key={notification.id || notification.title} type="button" onClick={() => { markNotificationsRead(notification.title); navigate(notification.path); setNotificationsOpen(false) }} className={`block w-full rounded-md p-2 text-left hover:bg-zinc-50 ${notification.read ? 'opacity-60' : ''}`}>
                        <span className="block text-[11px] font-semibold">{notification.title}</span>
                        <span className="mt-0.5 block text-[9px] text-zinc-500">{notification.detail}</span>
                      </button>
                    ))}
                    {!visibleNotifications.length && <p className="px-2 py-3 text-center text-[10px] text-zinc-500">No notifications for enabled categories.</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* User Avatar Circle (M) + Username/Role */}
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="w-9 h-9 rounded-full bg-[#16a34a] text-white font-bold text-sm flex items-center justify-center shadow-sm">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-[13px] font-bold text-white">{firstName}</p>
                <p className="text-[11px] text-zinc-400">{displayRole}</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute inset-x-3 top-full z-40 mt-2 sm:hidden"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && filteredTargets[0]) {
                        navigate(filteredTargets[0].path)
                        setSearchQuery('')
                        setMobileSearchOpen(false)
                      }
                      if (event.key === 'Escape') setMobileSearchOpen(false)
                    }}
                    placeholder="Search intersections, plates..."
                    className="w-full rounded-md border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 shadow-lg outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
                {searchQuery.trim() && <div className="mt-1 rounded-md border border-zinc-200 bg-white p-1 text-zinc-900 shadow-xl">
                  {filteredTargets.length ? filteredTargets.map((target) => <button key={`${target.label}-${target.path}`} type="button" onClick={() => { navigate(target.path); setSearchQuery(''); setMobileSearchOpen(false) }} className="flex w-full items-center justify-between gap-3 rounded px-2.5 py-2 text-left hover:bg-zinc-100"><span className="text-xs font-medium">{target.label}</span><span className="truncate text-[10px] text-zinc-400">{target.detail}</span></button>) : <p className="px-2.5 py-2 text-xs text-zinc-500">No matches found</p>}
                </div>}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto pb-5 lg:pb-0 bg-[#0c0c0e]" onClick={() => { if (searchOpen) setSearchOpen(false); if (mobileSearchOpen) setMobileSearchOpen(false) }}>
          <AnimatePresence mode="wait">
            <motion.div key={`${location.pathname}${location.search}`} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute right-3 top-16 max-h-[calc(100dvh-5rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-[#2a2a32] bg-[#1e1e24] p-4 shadow-2xl space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2">Navigation</p>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${
                      isActive ? 'bg-[#16a34a] text-white font-semibold' : 'text-zinc-300 hover:bg-[#262630]'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              ))}
              <div className="pt-2 border-t border-[#2a2a32]">
                <NavLink
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:bg-[#262630]"
                >
                  <Settings size={18} />
                  <span className="text-sm">Settings</span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-[#262630] text-left"
                >
                  <LogOut size={18} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
