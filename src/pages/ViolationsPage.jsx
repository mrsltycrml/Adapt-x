import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { demoNotifications, demoViolators, demoViolationEvents } from '../data/demoData'
import { appendDemoRecord, readDemoCollection, writeDemoCollection } from '../data/demoStore'

export default function ViolationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState(() => readDemoCollection('violations', demoViolationEvents))
  const [plateConfirmed, setPlateConfirmed] = useState(false)
  const [ownerConfirmed, setOwnerConfirmed] = useState(false)
  const [ownerMismatch, setOwnerMismatch] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const eventId = Number(searchParams.get('event'))
  const selectedFromUrl = events.find((event) => event.id === eventId)
  const activeTab = searchParams.get('tab') || (selectedFromUrl?.disposition === 'Dispute' ? 'disputes' : 'queue')
  const visibleEvents = events.filter((event) => activeTab === 'queue'
    ? event.disposition === 'Review'
    : event.disposition === 'Dispute')
  const selectedEvent = visibleEvents.find((event) => event.id === eventId) || visibleEvents[0] || null

  const updateEvent = (id, changes) => {
    setEvents((current) => {
      const updated = current.map((event) => event.id === id ? { ...event, ...changes } : event)
      writeDemoCollection('violations', updated)
      return updated
    })
  }

  const clearChecks = () => {
    setPlateConfirmed(false)
    setOwnerConfirmed(false)
    setOwnerMismatch(false)
  }

  const selectEvent = (event) => {
    setSearchParams({ tab: event.disposition === 'Dispute' ? 'disputes' : 'queue', event: String(event.id) })
    clearChecks()
    setStatusMessage('')
  }

  const changeTab = (tab) => {
    const firstEvent = events.find((event) => tab === 'queue'
      ? event.disposition === 'Review'
      : event.disposition === 'Dispute')
    setSearchParams(firstEvent ? { tab, event: String(firstEvent.id) } : { tab })
    clearChecks()
    setStatusMessage('')
  }

  const markFalsePositive = () => {
    if (!selectedEvent) return
    updateEvent(selectedEvent.id, { disposition: 'False Positive', reviewedAt: new Date().toISOString() })
    appendDemoRecord('activity', { action: 'False positive confirmed', detail: `${selectedEvent.plate} · ${selectedEvent.type}`, createdAt: new Date().toISOString() })
    clearChecks()
    setStatusMessage(`Event ${selectedEvent.id} was removed from the review queue as a false positive.`)
  }

  const submitNotice = () => {
    if (!selectedEvent || !plateConfirmed || !ownerConfirmed || ownerMismatch) return
    const issuedAt = new Date().toISOString()
    updateEvent(selectedEvent.id, { disposition: 'Issued', issuedAt })
    const roster = readDemoCollection('violators', demoViolators)
    const updatedRoster = roster.map((violator) => violator.plate === selectedEvent.plate
      ? {
        ...violator,
        violations: violator.violations + 1,
        historyId: `#${Date.now().toString().slice(-4)} · ${selectedEvent.type}`,
        historyDetail: `${selectedEvent.location} · ${selectedEvent.noticeTime}`,
        historyStatus: 'Issued',
      }
      : violator)
    writeDemoCollection('violators', updatedRoster)
    appendDemoRecord('activity', { action: 'Violation notice issued', detail: `${selectedEvent.plate} · ${selectedEvent.type}`, createdAt: issuedAt })
    appendDemoRecord('notifications', {
      title: 'Violation notice issued',
      detail: `${selectedEvent.plate} · ${selectedEvent.type}`,
      path: '/violations?tab=disputes',
      preference: 'priority',
      read: false,
    }, demoNotifications)
    clearChecks()
    setStatusMessage(`Notice issued to ${selectedEvent.owner}; event ${selectedEvent.id} is now in the issued archive.`)
  }

  const decideDispute = (decision) => {
    if (!selectedEvent) return
    const decisionAt = new Date().toISOString()
    updateEvent(selectedEvent.id, { disposition: decision, decisionAt })
    appendDemoRecord('activity', { action: `Dispute ${decision.toLowerCase()}`, detail: `${selectedEvent.plate} · ${selectedEvent.type}`, createdAt: decisionAt })
    clearChecks()
    setStatusMessage(`Dispute for event ${selectedEvent.id} marked ${decision.toLowerCase()}.`)
  }

  return (
    <div className="px-8 lg:px-12 py-8 flex flex-col gap-6 max-w-[1240px]">
      <header>
        <h1 className="text-2xl sm:text-[27px] font-bold text-white tracking-tight leading-snug">Violations</h1>
        <p className="text-zinc-400 text-xs sm:text-[13px] mt-1">Review flagged events, confirm ownership, and manage disputes.</p>
      </header>

      <div className="inline-flex w-fit rounded-full border border-zinc-700/60 bg-zinc-900 p-1">
        <button type="button" onClick={() => changeTab('queue')} aria-pressed={activeTab === 'queue'} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === 'queue' ? 'bg-black text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}>
          Review Queue
        </button>
        <button type="button" onClick={() => changeTab('disputes')} aria-pressed={activeTab === 'disputes'} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === 'disputes' ? 'bg-black text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}>
          Disputes
        </button>
      </div>

      <div className="flex max-w-[1040px] flex-col items-start gap-6 lg:flex-row">
        <section className="flex w-full flex-col rounded-xl border border-zinc-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:w-[56%]">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-[15px] font-bold tracking-tight text-zinc-900">{activeTab === 'queue' ? 'Unverified Events' : 'Filed Disputes'}</h2>
            <span className="text-xs font-medium text-zinc-400">{visibleEvents.length} {activeTab === 'queue' ? 'pending' : 'filed'}</span>
          </div>
          <div className="mt-3 space-y-2 sm:hidden">
            {visibleEvents.map((event, index) => (
              <motion.button
                key={event.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => selectEvent(event)}
                className={`w-full rounded-lg border px-3.5 py-3 text-left ${selectedEvent?.id === event.id ? 'border-emerald-300 bg-emerald-50/80' : 'border-zinc-200 bg-white'}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold text-zinc-900">{event.type}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-zinc-500">{event.location} · {event.time}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-zinc-900 px-2.5 py-1 text-[9px] font-semibold text-white">{activeTab === 'queue' ? 'Review' : 'Open'}</span>
                </span>
                <span className="mt-2 flex items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200"><span className="block h-full rounded-full bg-emerald-600" style={{ width: `${event.confidence}%` }} /></span>
                  <span className="text-[9px] font-semibold text-zinc-600">{event.confidence}% confidence</span>
                </span>
              </motion.button>
            ))}
            {!visibleEvents.length && <p className="py-6 text-center text-xs text-zinc-500">{activeTab === 'queue' ? 'Review queue is clear.' : 'No disputes are waiting for review.'}</p>}
          </div>
          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Location</th>
                  <th className="pb-2 font-semibold">Time</th>
                  <th className="pb-2 font-semibold">Confidence</th>
                  <th className="pb-2 text-right font-semibold"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100/80">
                {visibleEvents.map((event) => (
                  <tr key={event.id} onClick={() => selectEvent(event)} className={`cursor-pointer transition-colors ${selectedEvent?.id === event.id ? 'bg-emerald-50/70' : 'hover:bg-zinc-50'}`}>
                    <td className="whitespace-nowrap py-3 pr-2 font-semibold text-zinc-900">{event.type}</td>
                    <td className="whitespace-nowrap py-3 pr-2 text-zinc-600">{event.location}</td>
                    <td className="whitespace-nowrap py-3 pr-2 font-mono text-zinc-500">{event.time}</td>
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-[#16a34a]" style={{ width: `${event.confidence}%` }} /></div>
                        <span className="text-[11px] font-semibold text-zinc-700">{event.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); selectEvent(event) }} className={`rounded-full px-3 py-1 text-[11px] font-semibold text-white ${selectedEvent?.id === event.id ? 'bg-[#16a34a]' : 'bg-zinc-800 hover:bg-black'}`}>Review</button>
                    </td>
                  </tr>
                ))}
                {!visibleEvents.length && <tr><td colSpan="5" className="py-8 text-center text-xs text-zinc-500">{activeTab === 'queue' ? 'Review queue is clear.' : 'No disputes are waiting for review.'}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <motion.section layout key={selectedEvent?.id || activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex w-full flex-col gap-5 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:w-[44%]">
          {selectedEvent ? <>
            <div>
              <div className="mb-2 flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white">1</span><h3 className="text-[14px] font-bold tracking-tight text-zinc-900">Plate Validity</h3></div>
              <div className="my-2 rounded-xl bg-[#27272a] px-4 py-3 text-center shadow-inner"><div className="inline-block rounded-lg border-2 border-zinc-800 bg-white px-6 py-1.5 font-mono text-[17px] font-extrabold tracking-widest text-zinc-900">{selectedEvent.plate}</div></div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => { setPlateConfirmed(true); setStatusMessage('Plate check confirmed.') }} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${plateConfirmed ? 'bg-[#16a34a] text-white' : 'bg-zinc-900 text-white hover:bg-black'}`}>{plateConfirmed ? '✓ Validated' : 'Confirm Valid'}</button>
                <button type="button" onClick={markFalsePositive} className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100">Send False Positive</button>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3">
              <div className="mb-2.5 flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white">2</span><h3 className="text-[14px] font-bold tracking-tight text-zinc-900">Registered Owner (LTO)</h3></div>
              <dl className="mb-3 space-y-1.5 text-xs text-zinc-700">
                <div className="flex justify-between gap-3"><dt className="text-zinc-400">Owner</dt><dd className="text-right font-semibold text-zinc-900">{selectedEvent.owner}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-zinc-400">Address</dt><dd className="max-w-[200px] truncate text-right">{selectedEvent.address}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-zinc-400">Vehicle</dt><dd className="text-right">{selectedEvent.vehicle}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-zinc-400">License status</dt><dd className="font-bold text-emerald-700">{selectedEvent.licenseStatus}</dd></div>
              </dl>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => { setOwnerConfirmed(true); setOwnerMismatch(false); setStatusMessage('Registered owner match confirmed.') }} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${ownerConfirmed ? 'bg-[#16a34a] text-white' : 'bg-zinc-900 text-white hover:bg-black'}`}>{ownerConfirmed ? '✓ Match Confirmed' : 'Confirm Match'}</button>
                <button type="button" onClick={() => { setOwnerConfirmed(false); setOwnerMismatch(true); setStatusMessage('Owner mismatch flagged. Notice submission is disabled.') }} className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100">{ownerMismatch ? 'Mismatch Flagged' : 'Flag Mismatch'}</button>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3">
              <div className="mb-2.5 flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white">3</span><h3 className="text-[14px] font-bold tracking-tight text-zinc-900">Violation Notice</h3></div>
              <div className="mb-3.5 space-y-2 text-xs">
                <div><span className="mb-1 block text-[11px] font-medium text-zinc-500">Violation type</span><div className="rounded-lg border border-zinc-200/60 bg-[#f1f5f9] px-3 py-2 font-semibold text-zinc-900">{selectedEvent.type}</div></div>
                <div><span className="mb-1 block text-[11px] font-medium text-zinc-500">Location</span><div className="rounded-lg border border-zinc-200/60 bg-[#f1f5f9] px-3 py-2 text-zinc-900">{selectedEvent.location}</div></div>
                <div><span className="mb-1 block text-[11px] font-medium text-zinc-500">Timestamp</span><div className="rounded-lg border border-zinc-200/60 bg-[#f1f5f9] px-3 py-2 font-mono text-zinc-900">{selectedEvent.noticeTime}</div></div>
              </div>
              <button type="button" disabled={!plateConfirmed || !ownerConfirmed || ownerMismatch} onClick={submitNotice} className="w-full rounded-md bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-400">{plateConfirmed && ownerConfirmed && !ownerMismatch ? 'Submit Violation' : 'Confirm plate and owner first'}</button>
              {activeTab === 'disputes' && selectedEvent.disposition === 'Dispute' && <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => decideDispute('Upheld')} className="rounded-md border border-emerald-700 px-2 py-2 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-50">Uphold notice</button><button type="button" onClick={() => decideDispute('Dismissed')} className="rounded-md border border-zinc-300 px-2 py-2 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50">Dismiss notice</button></div>}
            </div>
          </> : <div className="flex min-h-40 flex-col justify-center gap-2 text-center"><h2 className="text-sm font-semibold text-zinc-900">Nothing to review</h2><p className="text-xs text-zinc-500">Your {activeTab === 'queue' ? 'review queue' : 'dispute queue'} is clear.</p></div>}
          {statusMessage && <p role="status" className="text-xs font-medium text-emerald-700">{statusMessage}</p>}
        </motion.section>
      </div>
    </div>
  )
}