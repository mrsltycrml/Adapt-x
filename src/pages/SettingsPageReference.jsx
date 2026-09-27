import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Monitor,
  Moon,
  Sun,
  UserRound,
} from 'lucide-react'
import { demoIntersections } from '../data/demoData'
import { readDemoCollection, readDemoValue, resetDemoStore, writeDemoValue } from '../data/demoStore'

const sections = [
  { id: 'Security', icon: LockKeyhole },
  { id: 'Account', icon: UserRound },
  { id: 'Notification', icon: Bell },
  { id: 'Assigned Intersection', icon: Monitor },
  { id: 'Data & Privacy', icon: Fingerprint },
  { id: 'Appearance', icon: Sun },
]

const initialAlerts = [
  ['Emergency priority alerts', 'Immediate notifications for urgent events', true],
  ['Queue congestion warnings', 'Notify when an approach is near capacity', true],
  ['Sensor & signal faults', 'Alerts when a device becomes unavailable', true],
  ['New dispute filed', 'Notify when a driver submits a dispute', true],
  ['Daily summary email', 'A daily report of activity and system status', false],
]

const intersections = demoIntersections.map(({ id, name }) => ({ id, name }))

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-700' : 'bg-zinc-300'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

function SettingRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 py-3 last:border-0">
      <div className="min-w-0">
        <h3 className="text-[12px] font-semibold text-zinc-800">{title}</h3>
        <p className="mt-0.5 text-[10px] text-zinc-500">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

function TextField({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] font-medium text-zinc-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
      />
    </label>
  )
}

export default function SettingsPageReference() {
  const [activeSection, setActiveSection] = useState('Security')
  const [saved, setSaved] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('adapt_theme') || 'Light')
  const [density, setDensity] = useState(() => localStorage.getItem('adapt_density') || 'Comfortable')
  const [storedSettings, setStoredSettings] = useState(() => readDemoValue('settings', {}))
  const [alerts, setAlerts] = useState(() => storedSettings.alerts || initialAlerts.map(([, , enabled]) => enabled))
  const [twoFactor, setTwoFactor] = useState(() => storedSettings.twoFactor || [true, true])
  const [assigned, setAssigned] = useState(() => storedSettings.assigned || demoIntersections.map(({ id }) => id))
  const [privacyNotice, setPrivacyNotice] = useState(false)
  const [resetConfirmation, setResetConfirmation] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [account, setAccount] = useState(() => storedSettings.account || { name: 'Mewpo Operator', employeeId: 'OPS-2048', email: 'operator@adapt-x.gov', role: 'Traffic Operator' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [activity] = useState(() => readDemoCollection('activity', [
    { id: 'seed-1', action: 'Ruled dispute #DP-1031 · Upheld', createdAt: 'Today, 2:12 PM' },
    { id: 'seed-2', action: 'Reviewed and confirmed violation #1042', createdAt: 'Today, 12:47 PM' },
  ]))

  useEffect(() => {
    const resolvedTheme = theme === 'System'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light')
      : theme
    document.documentElement.dataset.adaptTheme = resolvedTheme.toLowerCase()
    document.documentElement.dataset.adaptDensity = density.toLowerCase()
    localStorage.setItem('adapt_theme', theme)
    localStorage.setItem('adapt_density', density)
  }, [theme, density])

  const updateAccount = (field) => (value) => setAccount((current) => ({ ...current, [field]: value }))
  const toggleTwoFactor = (index) => {
    const nextTwoFactor = twoFactor.map((value, currentIndex) => currentIndex === index ? !value : value)
    const nextSettings = { ...storedSettings, twoFactor: nextTwoFactor }
    setTwoFactor(nextTwoFactor)
    setStoredSettings(nextSettings)
    writeDemoValue('settings', nextSettings)
  }
  const handleSave = (event) => {
    event.preventDefault()
    setSaveError('')
    if (activeSection === 'Security') {
      const currentPassword = readDemoValue('operatorPassword', 'AdaptDemo2026!')
      if (passwords.current !== currentPassword) {
        setSaveError('Current password does not match the demo account.')
        return
      }
      if (passwords.next.length < 8) {
        setSaveError('New password must be at least 8 characters.')
        return
      }
      if (passwords.next !== passwords.confirm) {
        setSaveError('New password and confirmation do not match.')
        return
      }
      writeDemoValue('operatorPassword', passwords.next)
      setPasswords({ current: '', next: '', confirm: '' })
    } else {
      const nextSettings = { ...storedSettings, account, alerts, twoFactor, assigned }
      writeDemoValue('settings', nextSettings)
      setStoredSettings(nextSettings)
    }
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  const handleDataExport = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      account,
      settings: { alerts, twoFactor, assigned, theme, density },
      auditActivity: readDemoValue('activity', []),
      notifications: readDemoValue('notifications', []),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'adapt-x-demo-data.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setPrivacyNotice(true)
  }

  const handleResetDemo = () => {
    resetDemoStore()
    localStorage.removeItem('adapt_theme')
    localStorage.removeItem('adapt_density')
    setResetConfirmation(false)
    window.location.reload()
  }

  const sectionContent = () => {
    switch (activeSection) {
      case 'Account':
        return <>
          <SectionHeader title="Account" subtitle="Manage your operator details." />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Full Name" value={account.name} onChange={updateAccount('name')} />
            <TextField label="Employee ID" value={account.employeeId} onChange={updateAccount('employeeId')} />
            <TextField label="Email Address" value={account.email} onChange={updateAccount('email')} type="email" />
            <TextField label="Role" value={account.role} onChange={updateAccount('role')} />
          </div>
        </>
      case 'Notification':
        return <>
          <SectionHeader title="Notifications" subtitle="Choose which events reach your operator account." />
          <div>{initialAlerts.map(([title, description], index) => (
            <SettingRow key={title} title={title} description={description} checked={alerts[index]} onChange={() => setAlerts((current) => current.map((value, i) => i === index ? !value : value))} />
          ))}</div>
        </>
      case 'Assigned Intersection':
        return <>
          <SectionHeader title="Assigned Intersections" subtitle="Select the locations shown in your live operations view." />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {intersections.map(({ id, name }) => (
              <label key={id} className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-3 text-[11px] font-medium transition-colors ${assigned.includes(id) ? 'border-emerald-200 bg-emerald-50 text-zinc-800' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
                <input type="checkbox" checked={assigned.includes(id)} onChange={() => setAssigned((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])} className="accent-emerald-700" />
                {name}
              </label>
            ))}
          </div>
        </>
      case 'Data & Privacy':
        return <>
          <SectionHeader title="Data & Privacy" subtitle="Review how operational records and account data are handled." />
          <div className="rounded-md bg-zinc-100 p-4 text-[11px] leading-relaxed text-zinc-700">
            <p className="font-semibold text-zinc-900">Data retention and access</p>
            <p className="mt-1">Violation evidence is retained according to local traffic enforcement policy. Access to personal and vehicle records is audited and limited to authorized operators.</p>
            <p className="mt-3 font-semibold text-zinc-900">Your activity</p>
            <p className="mt-1">Sign-in history, report downloads, and enforcement decisions are recorded in the audit log.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleDataExport} className="w-fit rounded-md border border-zinc-300 px-3 py-2 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50">Download data export</button>
            {privacyNotice && <span role="status" className="text-[10px] font-medium text-emerald-700">Demo data exported</span>}
          </div>
          <div className="border-t border-zinc-200 pt-3">
            <h3 className="text-[12px] font-semibold text-zinc-900">Reset presentation data</h3>
            <p className="mt-1 text-[10px] text-zinc-500">Clear local mock changes and restore the original sample records.</p>
            {!resetConfirmation ? (
              <button type="button" onClick={() => setResetConfirmation(true)} className="mt-2 rounded-md border border-red-200 px-3 py-2 text-[10px] font-semibold text-red-700 hover:bg-red-50">Reset demo data</button>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-red-700">This clears saved demo changes.</span>
                <button type="button" onClick={handleResetDemo} className="rounded-md bg-red-700 px-3 py-2 text-[10px] font-semibold text-white hover:bg-red-800">Confirm reset</button>
                <button type="button" onClick={() => setResetConfirmation(false)} className="rounded-md border border-zinc-300 px-3 py-2 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50">Cancel</button>
              </div>
            )}
          </div>
        </>
      case 'Appearance':
        return <>
          <SectionHeader title="Appearance" subtitle="Adjust how the operations console is displayed." />
          <div>
            <p className="mb-2 text-[11px] font-semibold text-zinc-700">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {[['Light', Sun], ['Dark', Moon], ['System', Monitor]].map(([name, Icon]) => (
                <button key={name} type="button" onClick={() => setTheme(name)} className={`flex items-center justify-center gap-2 rounded-md border py-2.5 text-[11px] font-medium ${theme === name ? 'border-emerald-700 text-emerald-800 ring-1 ring-emerald-700' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}><Icon size={13} />{name}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold text-zinc-700">Density</p>
            <div className="grid grid-cols-2 gap-2">
              {['Comfortable', 'Compact'].map((name) => <button key={name} type="button" onClick={() => setDensity(name)} className={`rounded-md border py-2.5 text-[11px] font-medium ${density === name ? 'border-emerald-700 text-emerald-800 ring-1 ring-emerald-700' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>{name}</button>)}
            </div>
          </div>
        </>
      default:
        return <>
          <SectionHeader title="Password" subtitle="Last changed Aug 5, 2026." />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ['current', 'Current Password'],
              ['next', 'New Password'],
              ['confirm', 'Confirm Password'],
            ].map(([key, label]) => (
              <label key={key} className="block min-w-0">
                <span className="mb-1 block text-[10px] font-medium text-zinc-500">{label}</span>
                <span className="relative block">
                  <input type={passwordVisible ? 'text' : 'password'} value={passwords[key]} onChange={(event) => setPasswords((current) => ({ ...current, [key]: event.target.value }))} placeholder="Enter password" className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 pr-9 text-[11px] text-zinc-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" />
                  {key === 'current' && <button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">{passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}</button>}
                </span>
              </label>
            ))}
          </div>
          <button type="submit" className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-[10px] font-semibold text-white hover:bg-zinc-700">{saved ? 'Password Updated' : 'Update Password'}</button>
          {saveError && <p role="alert" className="text-xs font-medium text-red-600">{saveError}</p>}
          <div className="border-t border-zinc-200 pt-3">
            <h3 className="text-[12px] font-semibold text-zinc-900">Two-Factor Authentication</h3>
            <SettingRow title="Authenticator app" description="Required for all operator accounts" checked={twoFactor[0]} onChange={() => toggleTwoFactor(0)} />
            <SettingRow title="SMS backup code" description="+63 *** *** 0148" checked={twoFactor[1]} onChange={() => toggleTwoFactor(1)} />
          </div>
          <div className="border-t border-zinc-200 pt-3">
            <h3 className="mb-1 text-[12px] font-semibold text-zinc-900">Trusted Devices / Saved Login</h3>
            <p className="py-2 text-[10px] text-zinc-600">Windows · Chrome <span className="ml-2 text-emerald-700">This device</span><span className="float-right text-zinc-400">Today, 8:42 AM</span></p>
            <p className="border-t border-zinc-100 py-2 text-[10px] text-zinc-600">iPhone · Safari <span className="float-right text-zinc-400">Sep 12, 2026</span></p>
          </div>
          <div className="border-t border-zinc-200 pt-3">
            <h3 className="mb-2 text-[12px] font-semibold text-zinc-900">Activity Center</h3>
            {activity.slice(0, 5).map((entry) => (
              <p key={entry.id} className="border-b border-zinc-100 py-2 text-[10px] text-zinc-700 last:border-0">
                {entry.action}{' '}
                <span className="float-right text-zinc-400">{Number.isNaN(Date.parse(entry.createdAt)) ? entry.createdAt : new Date(entry.createdAt).toLocaleString()}</span>
              </p>
            ))}
          </div>
        </>
    }
  }

  return (
    <div className="px-6 lg:px-8 py-6 flex flex-col gap-5 max-w-[1180px]">
      <header>
        <h1 className="text-[25px] font-bold text-white tracking-tight leading-tight">Settings</h1>
        <p className="text-zinc-400 text-[13px] mt-1">Manage your account, notifications, and preferences.</p>
      </header>

      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-5">
        <label className="block w-full lg:hidden">
          <span className="sr-only">Settings section</span>
          <select
            aria-label="Settings section"
            value={activeSection}
            onChange={(event) => { setActiveSection(event.target.value); setSaved(false) }}
            className="h-10 w-full rounded-md border border-zinc-700 bg-[#1c1c1f] px-3 text-xs font-semibold text-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          >
            {sections.map(({ id }) => <option key={id} value={id}>{id}</option>)}
          </select>
        </label>
        <nav aria-label="Settings sections" className="hidden w-full gap-1.5 lg:flex lg:w-[170px] lg:shrink-0 lg:flex-col">
          {sections.map(({ id, icon: Icon }) => (
              <button key={id} type="button" onClick={() => { setActiveSection(id); setSaved(false) }} className={`flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-3 text-left text-[11px] font-medium transition-all lg:w-full ${activeSection === id ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-zinc-700 bg-transparent text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800'}`}>
              <Icon size={13} /><span>{id}</span>
            </button>
          ))}
        </nav>

        <form onSubmit={handleSave} className="w-full max-w-[780px] rounded-lg border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }} className="flex min-h-[370px] flex-col gap-4">
              {sectionContent()}
            </motion.div>
          </AnimatePresence>
          {activeSection !== 'Security' && activeSection !== 'Data & Privacy' && (
            <div className="mt-5 flex min-h-9 items-center justify-end gap-3 border-t border-zinc-100 pt-3">
              <AnimatePresence>
                {saved && <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700"><Check size={13} /> Saved</motion.span>}
              </AnimatePresence>
              <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-[10px] font-semibold text-white transition-colors hover:bg-zinc-700">Save Changes</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return <div className="border-b border-zinc-100 pb-3"><h2 className="text-[15px] font-bold text-zinc-900">{title}</h2><p className="mt-0.5 text-[10px] text-zinc-500">{subtitle}</p></div>
}