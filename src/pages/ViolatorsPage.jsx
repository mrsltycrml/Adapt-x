import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { demoNotifications, demoSummary, demoViolators } from '../data/demoData'
import { appendDemoRecord, readDemoCollection, writeDemoCollection } from '../data/demoStore'

export default function ViolatorsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [violators] = useState(() => readDemoCollection('violators', demoViolators))
  const [notices, setNotices] = useState(() => readDemoCollection('notices', []))
  const selectedViolatorId = Number(searchParams.get('person')) || demoViolators[0].id
  const [noticeSent, setNoticeSent] = useState(false)
  const [ltoRecordOpen, setLtoRecordOpen] = useState(false)

  const selectedViolator =
    violators.find((v) => v.id === selectedViolatorId) || violators[0]

  const handleSendNotice = () => {
    const notice = {
      violatorId: selectedViolator.id,
      plate: selectedViolator.plate,
      owner: selectedViolator.name,
      createdAt: new Date().toISOString(),
      status: 'Dispatched',
    }
    const updatedNotices = [notice, ...notices]
    writeDemoCollection('notices', updatedNotices)
    setNotices(updatedNotices)
    appendDemoRecord('notifications', {
      title: 'Notice dispatched',
      detail: `${selectedViolator.plate} · ${selectedViolator.name}`,
      path: `/violators?person=${selectedViolator.id}`,
      preference: 'queue',
      read: false,
    }, demoNotifications)
    appendDemoRecord('activity', { action: 'Notice dispatched', detail: `${selectedViolator.plate} · ${selectedViolator.name}`, createdAt: notice.createdAt })
    setNoticeSent(true)
    setTimeout(() => setNoticeSent(false), 2000)
  }

  const selectViolator = (id) => {
    setSearchParams({ person: String(id) })
    setLtoRecordOpen(false)
    setNoticeSent(false)
  }

  return (
    <div className="px-8 lg:px-12 py-8 flex flex-col gap-6 max-w-[1240px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[27px] font-bold text-white tracking-tight leading-snug">
          Violators
        </h1>
        <p className="text-zinc-400 text-xs sm:text-[13px] mt-1 font-normal">
          Registered offenders, their vehicles, and violation history.
        </p>
      </div>

      {/* Row 1: 4 Stat Cards matching media_1790444760173.png */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 max-w-[1040px]">
        {/* Card 1: Total Violators */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-600">Total Violators</span>
          <span className="text-3xl font-extrabold text-zinc-900 mt-1 font-sans">{demoSummary.violators}</span>
          <span className="text-[11px] text-zinc-400 mt-0.5">Across 6 intersections</span>
        </div>

        {/* Card 2: Repeat Offenders */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-600">Repeat Offenders</span>
          <span className="text-3xl font-extrabold text-zinc-900 mt-1 font-sans">{demoSummary.repeatOffenders}</span>
          <span className="text-[11px] text-zinc-400 mt-0.5">2+ violations logged</span>
        </div>

        {/* Card 3: Suspended Licenses */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-600">Suspended Licenses</span>
          <span className="text-3xl font-extrabold text-zinc-900 mt-1 font-sans">{demoSummary.suspendedLicenses}</span>
          <span className="text-[11px] text-zinc-400 mt-0.5">Flagged by LTO</span>
        </div>

        {/* Card 4: Disputes Filed */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-zinc-600">Disputes Filed</span>
          <span className="text-3xl font-extrabold text-zinc-900 mt-1 font-sans">{demoSummary.disputes}</span>
          <span className="text-[11px] text-zinc-400 mt-0.5">1 upheld • 1 dismissed</span>
        </div>
      </div>

      {/* Row 2: 2 Columns - Roster & Violators Profile */}
      <div className="flex flex-col lg:flex-row gap-6 items-start max-w-[1040px]">
        {/* ========================================================
            LEFT CARD: Roster
           ======================================================== */}
        <div className="w-full lg:w-[56%] bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col">
          <h2 className="text-[15px] font-bold text-zinc-900 tracking-tight mb-3">
            Roster
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-100">
                  <th className="pb-2.5 font-semibold">NAME</th>
                  <th className="pb-2.5 font-semibold">PLATE</th>
                  <th className="pb-2.5 font-semibold">VEHICLE</th>
                  <th className="pb-2.5 font-semibold">VIOLATIONS</th>
                  <th className="pb-2.5 text-right font-semibold">LICENSE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100/80">
                {violators.map((item) => {
                  const isSelected = selectedViolatorId === item.id
                  return (
                    <tr
                      key={item.id}
                      onClick={() => selectViolator(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/70' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <td className="py-3 font-semibold text-zinc-900 whitespace-nowrap pr-2">
                        {item.shortName}
                      </td>
                      <td className="py-3 font-mono font-medium text-zinc-800 whitespace-nowrap pr-2">
                        {item.plate}
                      </td>
                      <td className="py-3 text-zinc-600 whitespace-nowrap pr-2">
                        {item.vehicle}
                      </td>
                      <td className="py-3 text-zinc-700 font-medium pl-3 whitespace-nowrap">
                        {item.violations}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#dcfce7] text-[#16a34a]">
                          {item.license}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================
            RIGHT CARD: Violators Profile
           ======================================================== */}
        <div className="w-full lg:w-[44%] bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-zinc-900 tracking-tight mb-4">
              Violators Profile
            </h2>

            {/* Profile Fields List */}
            <div className="space-y-2 text-xs text-zinc-700">
              <div className="flex justify-between">
                <span className="text-zinc-400">Name:</span>
                <span className="font-semibold text-zinc-900">{selectedViolator.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Address:</span>
                <span className="text-zinc-700 text-right max-w-[200px] truncate">{selectedViolator.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Vehicle:</span>
                <span className="text-zinc-700">{selectedViolator.fullVehicle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">License Status:</span>
                <span className="font-bold text-[#16a34a]">{selectedViolator.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Violations:</span>
                <span className="font-bold text-zinc-900">{selectedViolator.violations}</span>
              </div>
            </div>

            {/* Violation History Sub-section */}
            <div className="mt-6 pt-3 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-900 mb-2">
                Violation History
              </h3>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-900">
                    {selectedViolator.historyId}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {selectedViolator.historyDetail}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#16a34a]">
                  {selectedViolator.historyStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleSendNotice}
              className="px-5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              {noticeSent ? '✓ Notice Dispatched' : 'Send Notice'}
            </button>
            <button
              type="button"
              onClick={() => setLtoRecordOpen(true)}
              className="px-5 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium rounded-full transition-colors cursor-pointer"
            >
              View LTO Record
            </button>
          </div>
        </div>
      </div>
      {ltoRecordOpen && (
        <div role="presentation" onClick={() => setLtoRecordOpen(false)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="lto-record-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-lg bg-white p-5 text-zinc-900 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="lto-record-title" className="text-base font-bold">LTO vehicle record</h2><p className="mt-1 text-xs text-zinc-500">Mock registry match for {selectedViolator.plate}</p></div>
              <button type="button" onClick={() => setLtoRecordOpen(false)} aria-label="Close LTO record" className="text-sm text-zinc-500 hover:text-zinc-900">Close</button>
            </div>
            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-2 text-xs">
              <dt className="text-zinc-500">Registered owner</dt><dd className="font-semibold">{selectedViolator.name}</dd>
              <dt className="text-zinc-500">Vehicle</dt><dd>{selectedViolator.fullVehicle}</dd>
              <dt className="text-zinc-500">License status</dt><dd className="font-semibold text-emerald-700">{selectedViolator.license}</dd>
              <dt className="text-zinc-500">Address</dt><dd>{selectedViolator.address}</dd>
            </dl>
          </section>
        </div>
      )}
    </div>
  )
}
