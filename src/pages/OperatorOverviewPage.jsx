import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Radio,
  Siren,
  TriangleAlert,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  demoDashboardIntersections,
  demoIntersections,
  demoSummary,
  demoSystemHealth,
  demoTrafficVolume,
} from '../data/demoData'
import { readDemoCollection, readDemoValue } from '../data/demoStore'

const healthIcons = { radio: Radio, camera: Camera, activity: Activity, siren: Siren }

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function MetricCard({ label, value, note, accent, icon: Icon }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="adapt-card adapt-card-hover min-h-[104px] p-4 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-zinc-500">{label}</span>
        <Icon size={15} className={accent} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={`text-[25px] leading-none font-bold ${accent}`}>{value}</span>
        <span className="text-[10px] text-zinc-500">{note}</span>
      </div>
    </motion.div>
  )
}

export default function OperatorOverviewPage() {
  const assignedIds = readDemoValue('settings', {}).assigned || demoIntersections.map(({ id }) => id)
  const issuedEvents = readDemoCollection('violations', []).filter((event) => event.disposition === 'Issued').length
  const metrics = [
    { label: 'Total Violations', value: demoSummary.totalViolations + issuedEvents, note: `▲ ${8 + issuedEvents} since yesterday`, accent: 'text-zinc-900', icon: TriangleAlert },
    { label: 'Violators', value: demoSummary.violators, note: `${demoSummary.repeatOffenders} repeat offenders`, accent: 'text-zinc-900', icon: Activity },
    { label: 'Traffic Lights', value: `${demoSummary.activeSignals}/${demoSummary.totalSignals}`, note: '1 approach offline', accent: 'text-red-600', icon: Radio },
    { label: 'AI Status', value: 'ACTIVE', note: 'All modules are nominal', accent: 'text-emerald-600', icon: CheckCircle2 },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="px-6 lg:px-8 py-6 flex flex-col gap-5 max-w-[1180px]"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-[25px] font-bold text-white tracking-tight leading-tight">Welcome, Mewpo!</h1>
        <p className="text-zinc-400 text-[13px] mt-1">Let’s keep our roads safe and moving.</p>
      </motion.header>

      <section aria-label="Network summary" className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <motion.div variants={itemVariants} className="adapt-card min-h-[210px] p-4 xl:col-start-1 xl:row-start-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-bold text-zinc-900">Traffic Volume</h2>
            <span className="text-[10px] text-zinc-500">Last 24 hours</span>
          </div>
          <div className="h-[160px] w-full" role="img" aria-label="Traffic volume over the last 24 hours">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demoTrafficVolume} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 150]} ticks={[0, 50, 100, 150]} tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 6, borderColor: '#e4e4e7', fontSize: 11 }} />
                <Line type="monotone" dataKey="volume" name="Vehicles" stroke="#16a34a" strokeWidth={2} dot={{ r: 2, fill: '#16a34a' }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.section variants={itemVariants} className="adapt-card max-w-[780px] p-4 xl:col-start-1 xl:row-start-2">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h2 className="text-[15px] font-bold text-zinc-900">Intersections</h2>
            <Link to="/traffic-lights" className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div>
            {demoDashboardIntersections.filter((item) => assignedIds.includes(item.id)).map((item) => {
              const intersection = demoIntersections.find(({ id }) => id === item.id)
              return (
                <Link key={item.id} to={`/traffic-lights?intersection=${item.id}`} className="group flex items-center justify-between gap-4 border-b py-3 transition-colors last:border-0 border-zinc-100 hover:bg-zinc-50">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex shrink-0 gap-1 ${item.tone === 'red' ? 'text-red-500' : item.tone === 'amber' ? 'text-amber-500' : 'text-emerald-600'}`}>
                      <i className="h-1.5 w-1.5 rounded-full bg-current" /><i className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold text-zinc-900 group-hover:text-emerald-700">{intersection.name}</span>
                      <span className="block truncate text-[9px] text-zinc-500">{item.details}</span>
                    </span>
                  </div>
                  <span className={`shrink-0 text-[9px] font-semibold ${item.tone === 'red' ? 'text-red-600' : item.tone === 'amber' ? 'text-amber-600' : 'text-emerald-700'}`}>{item.tone === 'amber' ? 'Congested' : intersection.status[0] + intersection.status.slice(1).toLowerCase()}</span>
                </Link>
              )
            })}
            {!demoDashboardIntersections.some((item) => assignedIds.includes(item.id)) && (
              <p className="py-4 text-xs text-zinc-500">No intersections assigned. <Link to="/settings" className="font-semibold text-emerald-700 hover:text-emerald-800">Update settings</Link></p>
            )}
          </div>
        </motion.section>

        <motion.div variants={itemVariants} className="adapt-card p-4 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h2 className="text-[15px] font-bold text-zinc-900">System Health</h2>
            <span className="text-[10px] font-semibold text-emerald-600">4 online</span>
          </div>
          <div>
            {demoSystemHealth.map(({ name, state, icon }) => {
              const Icon = healthIcons[icon]
              return <div key={name} className="flex items-center justify-between gap-3 border-b py-3 last:border-0 border-zinc-100"><span className="flex items-center gap-2 text-[11px] text-zinc-700"><Icon size={13} className="text-zinc-400" />{name}</span><span className="shrink-0 text-[9px] font-semibold text-emerald-700">{state}</span></div>
            })}
          </div>
        </motion.div>
      </section>
    </motion.div>
  )
}