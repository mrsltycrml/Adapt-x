import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { demoIntersections } from '../data/demoData'
import { readDemoValue } from '../data/demoStore'

function SignalLamp({ cx, cy, color, active, reduceMotion }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r="3.1"
      fill={color}
      filter={active ? 'url(#telemetry-lamp-glow)' : undefined}
      initial={false}
      animate={active && !reduceMotion ? { opacity: [1, 0.68, 1], scale: [1, 1.14, 1] } : { opacity: active ? 1 : 0.28, scale: 1 }}
      transition={active && !reduceMotion ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    />
  )
}

function TrafficSignal({ x, y, state, reduceMotion }) {
  const redActive = state === 'Stop'
  const greenActive = state === 'Green'

  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="7" cy="44" r="3.5" fill="#33383a" />
      <rect x="0" y="0" width="14" height="40" rx="5" fill="#191d1f" stroke="#8a9293" strokeWidth="1" />
      <SignalLamp cx="7" cy="8" color="#ef4444" active={redActive} reduceMotion={reduceMotion} />
      <SignalLamp cx="7" cy="20" color="#f59e0b" active={false} reduceMotion={reduceMotion} />
      <SignalLamp cx="7" cy="32" color="#22c55e" active={greenActive} reduceMotion={reduceMotion} />
    </g>
  )
}

const vehicleTracks = [
  { id: 'east-1', direction: 'east', lane: 181, signal: 'ewState', color: '#3186c6', duration: 20, delay: 0 },
  { id: 'east-2', direction: 'east', lane: 207, signal: 'ewState', color: '#e8e9e6', duration: 24, delay: -11 },
  { id: 'west-1', direction: 'west', lane: 253, signal: 'ewState', color: '#d19b43', duration: 22, delay: -6 },
  { id: 'west-2', direction: 'west', lane: 279, signal: 'ewState', color: '#667b73', duration: 25, delay: -16 },
  { id: 'south-1', direction: 'south', lane: 430, signal: 'nsState', color: '#cb5a4c', duration: 19, delay: -4 },
  { id: 'south-2', direction: 'south', lane: 456, signal: 'nsState', color: '#d9dedc', duration: 23, delay: -14 },
  { id: 'north-1', direction: 'north', lane: 504, signal: 'nsState', color: '#4c7192', duration: 21, delay: -9 },
  { id: 'north-2', direction: 'north', lane: 530, signal: 'nsState', color: '#d3a85d', duration: 24, delay: -19 },
]

function Vehicle({ track, telemetry, reduceMotion }) {
  const vertical = track.direction === 'north' || track.direction === 'south'
  const reverse = track.direction === 'west' || track.direction === 'north'
  const phase = telemetry[track.signal]
  const stopLine = track.direction === 'east' ? 342
    : track.direction === 'west' ? 642
      : track.direction === 'south' ? 94
        : 387
  const start = reverse ? 1000 : -45
  const finish = reverse ? -45 : 1000
  const parked = reduceMotion || phase !== 'Green'
  const stopped = !reduceMotion && phase !== 'Green'
  const initialPosition = parked ? stopLine : start
  const initial = vertical
    ? { x: track.lane, y: initialPosition }
    : { x: initialPosition, y: track.lane }
  const animation = vertical
    ? { x: track.lane, y: parked ? stopLine : [start, finish] }
    : { x: parked ? stopLine : [start, finish], y: track.lane }
  const rotation = track.direction === 'west' ? 180
    : track.direction === 'south' ? 90
      : track.direction === 'north' ? -90
        : 0

  return (
    <motion.g
      key={`${track.id}-${phase}`}
      data-testid={`telemetry-car-${track.id}`}
      initial={initial}
      animate={animation}
      transition={parked ? { duration: 0.35, ease: 'easeOut' } : { duration: track.duration, repeat: Infinity, ease: 'linear', delay: track.delay }}
    >
      <g transform={`rotate(${rotation})`}>
        <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#111719" opacity="0.32" transform="translate(1 1.5)" />
        <rect x="-18" y="-9" width="36" height="18" rx="5" fill={track.color} stroke="#e5e7e6" strokeWidth="1" />
        <path d="M -8 -7 L 8 -7 Q 12 -7 14 -3 L 14 3 Q 12 7 8 7 L -8 7 Q -12 7 -14 3 L -14 -3 Q -12 -7 -8 -7" fill="#27363d" opacity="0.9" />
        <path d="M 0 -6 V 6" stroke="#94a3a8" strokeWidth="0.8" />
        <rect x="-13" y="-10" width="7" height="2" rx="1" fill="#141819" />
        <rect x="6" y="-10" width="7" height="2" rx="1" fill="#141819" />
        <rect x="-13" y="8" width="7" height="2" rx="1" fill="#141819" />
        <rect x="6" y="8" width="7" height="2" rx="1" fill="#141819" />
        <rect x="15" y="-5" width="2" height="3" rx="1" fill="#fef3c7" />
        <rect x="15" y="2" width="2" height="3" rx="1" fill="#fef3c7" />
        <rect x="-17" y="-5" width="2" height="3" rx="1" fill={stopped ? '#ff4141' : '#a12e2e'} />
        <rect x="-17" y="2" width="2" height="3" rx="1" fill={stopped ? '#ff4141' : '#a12e2e'} />
      </g>
    </motion.g>
  )
}

function IntersectionScene({ telemetry, reduceMotion }) {
  const trees = [
    [45, 145], [90, 145], [138, 145], [184, 145], [230, 145], [276, 145], [326, 145],
    [45, 315], [90, 315], [138, 315], [184, 315], [230, 315], [276, 315], [326, 315],
    [386, 44], [386, 88], [386, 372], [386, 418], [574, 44], [574, 88], [574, 372], [574, 418],
    [634, 145], [682, 145], [730, 145], [778, 145], [826, 145], [874, 145], [922, 145],
    [634, 315], [682, 315], [730, 315], [778, 315], [826, 315], [874, 315], [922, 315],
  ]

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-300 bg-[#e7ebe8] shadow-inner">
      <svg
        viewBox="0 0 960 460"
        className="block h-auto w-full"
        role="img"
        aria-label={`Live top-down intersection simulation for ${telemetry.name}. North-south ${telemetry.nsState}; east-west ${telemetry.ewState}.`}
      >
        <title>{telemetry.name} live intersection</title>
        <defs>
          <pattern id="street-pavers" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 0 0 H 12 M 0 0 V 12" stroke="#cbd1cd" strokeWidth="0.7" />
          </pattern>
          <pattern id="lane-dashes" width="34" height="4" patternUnits="userSpaceOnUse">
            <rect width="17" height="2" y="1" rx="1" fill="#d9ddda" opacity="0.8" />
          </pattern>
          <filter id="scene-building-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#303b39" floodOpacity="0.22" />
          </filter>
          <filter id="telemetry-lamp-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="960" height="460" fill="#dfe5e1" />
        <rect width="960" height="460" fill="url(#street-pavers)" opacity="0.55" />

        <g filter="url(#scene-building-shadow)">
          <rect x="18" y="16" width="352" height="116" rx="7" fill="#bfc8c3" />
          <rect x="30" y="26" width="139" height="94" rx="4" fill="#f0f2ef" />
          <rect x="180" y="26" width="178" height="42" rx="4" fill="#e9ece9" />
          <rect x="180" y="76" width="178" height="44" rx="4" fill="#f6f7f5" />
          <path d="M 38 38 H 160 M 38 50 H 160 M 38 62 H 160 M 38 74 H 160 M 38 86 H 160 M 38 98 H 160 M 38 110 H 160" stroke="#d5dbd7" strokeWidth="2" />
          <rect x="194" y="38" width="48" height="19" rx="2" fill="#d3dad6" />
          <rect x="250" y="38" width="95" height="19" rx="2" fill="#d3dad6" />
          <rect x="194" y="88" width="67" height="20" rx="2" fill="#e1e5e2" />
          <rect x="269" y="88" width="76" height="20" rx="2" fill="#e1e5e2" />

          <rect x="590" y="16" width="352" height="116" rx="7" fill="#bfc8c3" />
          <rect x="602" y="26" width="170" height="94" rx="4" fill="#f6f7f5" />
          <rect x="783" y="26" width="147" height="94" rx="4" fill="#ecefec" />
          <path d="M 614 39 H 759 M 614 52 H 759 M 614 65 H 759 M 614 78 H 759 M 614 91 H 759 M 614 104 H 759" stroke="#d8deda" strokeWidth="2" />
          <rect x="797" y="39" width="53" height="34" rx="3" fill="#d2d9d5" />
          <rect x="859" y="39" width="57" height="34" rx="3" fill="#d2d9d5" />
          <rect x="797" y="81" width="119" height="25" rx="3" fill="#e0e5e1" />

          <rect x="18" y="328" width="352" height="116" rx="7" fill="#bfc8c3" />
          <rect x="30" y="339" width="155" height="93" rx="4" fill="#ecefec" />
          <rect x="196" y="339" width="162" height="41" rx="4" fill="#f6f7f5" />
          <rect x="196" y="388" width="162" height="44" rx="4" fill="#e8ece9" />
          <rect x="43" y="352" width="55" height="65" rx="3" fill="#d2d9d5" />
          <rect x="107" y="352" width="64" height="28" rx="3" fill="#dce2de" />
          <rect x="107" y="388" width="64" height="29" rx="3" fill="#dce2de" />
          <path d="M 207 351 H 346 M 207 363 H 346 M 207 400 H 346 M 207 412 H 346" stroke="#d5dbd7" strokeWidth="2" />

          <rect x="590" y="328" width="352" height="116" rx="7" fill="#bfc8c3" />
          <rect x="602" y="339" width="142" height="93" rx="4" fill="#f6f7f5" />
          <rect x="755" y="339" width="175" height="41" rx="4" fill="#e8ece9" />
          <rect x="755" y="388" width="175" height="44" rx="4" fill="#f0f2ef" />
          <rect x="615" y="351" width="51" height="29" rx="3" fill="#d7ddd9" />
          <rect x="674" y="351" width="56" height="29" rx="3" fill="#d7ddd9" />
          <rect x="615" y="388" width="115" height="29" rx="3" fill="#e1e5e2" />
          <path d="M 768 351 H 916 M 768 363 H 916 M 768 400 H 916 M 768 412 H 916" stroke="#d5dbd7" strokeWidth="2" />
        </g>

        <g fill="#7c9b73" stroke="#54724e" strokeWidth="1.2">
          {trees.map(([x, y]) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="9" /><circle cx={x - 3} cy={y - 2} r="4" fill="#91ad83" stroke="none" /></g>)}
        </g>
        <g fill="#746f63">
          {trees.map(([x, y]) => <circle key={`trunk-${x}-${y}`} cx={x} cy={y + 14} r="2" />)}
        </g>

        <rect x="0" y="147" width="960" height="166" fill="#373d40" />
        <rect x="394" y="0" width="172" height="460" fill="#373d40" />
        <path d="M 0 147 H 394 M 566 147 H 960 M 0 313 H 394 M 566 313 H 960 M 394 0 V 147 M 566 0 V 147 M 394 313 V 460 M 566 313 V 460" stroke="#b9c0bc" strokeWidth="5" />
        <path d="M 0 153 H 394 M 566 153 H 960 M 0 307 H 394 M 566 307 H 960 M 400 0 V 147 M 560 0 V 147 M 400 313 V 460 M 560 313 V 460" stroke="#f4f5f3" strokeOpacity="0.7" strokeWidth="1.5" />

        <g fill="none" stroke="#d5d9d6" strokeWidth="2" opacity="0.75">
          <path d="M 0 230 H 388" strokeDasharray="23 18" />
          <path d="M 572 230 H 960" strokeDasharray="23 18" />
          <path d="M 480 0 V 142" strokeDasharray="23 18" />
          <path d="M 480 318 V 460" strokeDasharray="23 18" />
        </g>
        <g fill="none" stroke="#e9d78a" strokeWidth="2.4" opacity="0.9">
          <path d="M 0 226 H 390 M 570 226 H 960" />
          <path d="M 0 234 H 390 M 570 234 H 960" />
          <path d="M 476 0 V 144 M 484 0 V 144 M 476 316 V 460 M 484 316 V 460" />
        </g>

        <g fill="#ebece9" opacity="0.9">
          {[...Array(8)].map((_, index) => <rect key={`cross-left-${index}`} x={368 + index * 3.2} y="159" width="1.8" height="142" rx="0.8" />)}
          {[...Array(8)].map((_, index) => <rect key={`cross-right-${index}`} x={590 + index * 3.2} y="159" width="1.8" height="142" rx="0.8" />)}
          {[...Array(8)].map((_, index) => <rect key={`cross-top-${index}`} x="404" y={119 + index * 3.2} width="152" height="1.8" rx="0.8" />)}
          {[...Array(8)].map((_, index) => <rect key={`cross-bottom-${index}`} x="404" y={337 + index * 3.2} width="152" height="1.8" rx="0.8" />)}
        </g>
        <g fill="#ecefeb" opacity="0.92">
          <rect x="388" y="159" width="4" height="142" />
          <rect x="568" y="159" width="4" height="142" />
          <rect x="404" y="143" width="152" height="4" />
          <rect x="404" y="313" width="152" height="4" />
        </g>
        <g fill="#f2f3f1" opacity="0.95">
          <rect x="364" y="157" width="3" height="146" rx="1" />
          <rect x="617" y="157" width="3" height="146" rx="1" />
          <rect x="402" y="116" width="156" height="3" rx="1" />
          <rect x="402" y="362" width="156" height="3" rx="1" />
        </g>

        <g fill="#d7dcda" opacity="0.85">
          <path d="M 333 184 l 12 6 -12 6 v-4 h-14 v-4 h14z" />
          <path d="M 627 276 l -12 -6 12 -6 v4 h14 v4 h-14z" />
          <path d="M 430 80 l 6 12 6 -12 h-4 v-14 h-4 v14z" />
          <path d="M 518 380 l -6 -12 -6 12 h4 v14 h4 v-14z" />
        </g>

        <g>
          <TrafficSignal x={371} y={135} state={telemetry.nsState} reduceMotion={reduceMotion} />
          <TrafficSignal x={575} y={135} state={telemetry.ewState} reduceMotion={reduceMotion} />
          <TrafficSignal x={371} y={285} state={telemetry.ewState} reduceMotion={reduceMotion} />
          <TrafficSignal x={575} y={285} state={telemetry.nsState} reduceMotion={reduceMotion} />
        </g>
        <g>
          {vehicleTracks.map((track) => <Vehicle key={track.id} track={track} telemetry={telemetry} reduceMotion={reduceMotion} />)}
        </g>
      </svg>
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-zinc-950/85 px-2.5 py-1 text-[9px] font-bold tracking-wide text-white shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-green" />
        LIVE SIMULATION
      </div>
    </div>
  )
}

export default function TrafficLightsPage() {
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const assignedIds = readDemoValue('settings', {}).assigned || demoIntersections.map(({ id }) => id)
  const assignedIntersections = demoIntersections.filter((intersection) => assignedIds.includes(intersection.id))
  const selectedId = searchParams.get('intersection') || assignedIntersections[0]?.id || demoIntersections[0].id
  const selectedIntersection = demoIntersections.find((intersection) => intersection.id === selectedId) || demoIntersections[0]
  const [telemetryById, setTelemetryById] = useState(() => Object.fromEntries(demoIntersections.map((intersection) => [intersection.id, { ...intersection }])))
  const telemetry = telemetryById[selectedId] || selectedIntersection

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryById((allTelemetry) => {
        const current = allTelemetry[selectedId] || selectedIntersection
        let next
        if (current.phaseSeconds <= 1) {
          next = {
            ...current,
            nsState: current.nsState === 'Green' ? 'Stop' : 'Green',
            ewState: current.ewState === 'Stop' ? 'Green' : 'Stop',
            phaseSeconds: 24,
            vehicles: current.vehicles >= 32 ? 14 : current.vehicles + 3,
          }
        } else {
          next = { ...current, phaseSeconds: current.phaseSeconds - 1 }
        }
        return { ...allTelemetry, [selectedId]: next }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [selectedId, selectedIntersection])

  return (
    <div className="px-8 lg:px-12 py-8 flex flex-col gap-6 max-w-[1240px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[27px] font-bold text-white tracking-tight leading-snug">
          Traffic Lights
        </h1>
        <p className="text-zinc-400 text-xs sm:text-[13px] mt-1 font-normal">
          Live signal status across every monitored intersection.
        </p>
      </div>

      {/* Section 1: Live Intersections */}
      <div>
        <h2 className="text-[15px] font-bold text-white tracking-tight mb-3">
          Live Intersections
        </h2>
        {/* 2-Column Grid matching reference image exactly */}
        <div className="grid grid-cols-1 min-[560px]:grid-cols-2 gap-3.5 max-w-[960px]">
          {assignedIntersections.map((item) => {
            const isSelected = selectedId === item.id
            const isGreen = item.level === 'green'
            const isYellow = item.level === 'yellow'
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => {
                  setSearchParams({ intersection: item.id })
                }}
                aria-pressed={isSelected}
                whileHover={{ y: -1 }}
                className={`w-full text-left bg-white rounded-xl px-5 py-3.5 flex items-center justify-between border cursor-pointer transition-all shadow-xs ${
                  isSelected ? 'border-zinc-400 ring-2 ring-emerald-500/30' : 'border-zinc-100 hover:border-zinc-200'
                }`}
              >
                {/* Left Indicator Pill + Intersection Name */}
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-1.5 h-6 rounded-full shrink-0 ${
                      isGreen ? 'bg-[#16a34a]' : isYellow ? 'bg-[#eab308]' : 'bg-[#dc2626]'
                    }`}
                  />
                  <span className="text-[14px] font-bold text-zinc-900 tracking-tight">
                    {item.name}
                  </span>
                </div>

                {/* Right Status Badge */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${
                    isGreen
                      ? 'bg-emerald-50 text-[#16a34a]'
                      : isYellow
                      ? 'bg-amber-50 text-[#ca8a04]'
                      : 'bg-red-50 text-[#dc2626]'
                  }`}
                >
                  {item.status}
                </span>
              </motion.button>
            )
          })}
        </div>
        {!assignedIntersections.length && <p className="mt-3 text-xs text-zinc-400">No intersections assigned. Choose locations in Settings.</p>}
      </div>

      {/* Section 2: Live Telemetry */}
      <div>
        <h2 className="text-[15px] font-bold text-white tracking-tight mb-3">
          Live Telemetry
        </h2>

        {/* Telemetry Card matching reference image */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm max-w-[960px]">
          {/* Telemetry Header */}
          <div className="mb-4">
            <h3 className="text-[16px] font-bold text-zinc-900 tracking-tight">
              {selectedIntersection.name}
            </h3>

            {/* Inline Metrics Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-zinc-600 mt-1.5 font-normal">
              <div>
                <span>North-South: </span>
                  <strong className={telemetry.nsState === 'Green' ? 'text-[#16a34a] font-semibold' : 'text-zinc-900 font-semibold'}>
                  {telemetry.nsState}
                </strong>
              </div>
              <div>
                <span>East-West: </span>
                  <strong className={telemetry.ewState === 'Green' ? 'text-[#16a34a] font-semibold' : 'text-zinc-900 font-semibold'}>
                  {telemetry.ewState}
                </strong>
              </div>
              <div>
                <span>Phase time remaining: </span>
                <strong className="text-zinc-900 font-semibold font-mono">{telemetry.phaseSeconds}s</strong>
              </div>
              <div>
                <span>Vehicles detected: </span>
                <strong className="text-zinc-900 font-semibold">{telemetry.vehicles} vehicles</strong>
              </div>
              <div>
                <span>Pedestrian requests: </span>
                <strong className="text-zinc-900 font-semibold">{telemetry.pedestrians} requests</strong>
              </div>
            </div>
          </div>

          {/* 2D Top-down Map Graphic from reference photo */}
          <IntersectionScene telemetry={telemetry} reduceMotion={reduceMotion} />
        </div>
      </div>
    </div>
  )
}
