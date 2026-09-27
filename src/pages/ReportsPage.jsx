import { useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { demoDailyViolations, demoGeneratedReports, demoNotifications, demoSummary } from '../data/demoData'
import { appendDemoRecord, readDemoCollection, writeDemoCollection } from '../data/demoStore'

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Violations Summary')
  const [intersection, setIntersection] = useState('All Intersections')
  const [fromDate, setFromDate] = useState('2026-09-17')
  const [toDate, setToDate] = useState('2026-09-24')
  const [format, setFormat] = useState('PDF') // 'PDF' | 'CSV'
  const [generating, setGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState(() => readDemoCollection('reports', demoGeneratedReports))
  const [downloadNotice, setDownloadNotice] = useState('')
  const issuedEvents = readDemoCollection('violations', []).filter((event) => event.disposition === 'Issued').length
  const totalViolations = demoSummary.totalViolations + issuedEvents

  const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const periodRange = `${formatDate(fromDate)} - ${formatDate(toDate)}`

  const handleGenerate = () => {
    if (!fromDate || !toDate) {
      setDownloadNotice('Choose a start and end date.')
      return
    }
    if (fromDate > toDate) {
      setDownloadNotice('The end date must be after the start date.')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      const report = {
        id: Date.now(),
        name: `${reportType} - ${intersection}`,
        range: periodRange,
        format,
        date: 'Just now',
      }
      setGeneratedReports((reports) => {
        const updated = [report, ...reports]
        writeDemoCollection('reports', updated)
        return updated
      })
      setGenerating(false)
      setDownloadNotice('Report added to generated reports.')
    }, 700)
  }

  const handleDownload = (report) => {
    if (report.format === 'PDF') {
      const printWindow = window.open('', '_blank', 'width=900,height=700')
      if (!printWindow) {
        setDownloadNotice('Allow pop-ups to print or save this report as PDF.')
        return
      }
      const rows = demoDailyViolations.map(({ day, count }) => `<tr><td>${escapeHtml(day)}</td><td>${count}</td></tr>`).join('')
      printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(report.name)}</title><style>body{font:14px Arial,sans-serif;color:#18181b;margin:40px}h1{font-size:22px}p{color:#52525b}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{border-bottom:1px solid #d4d4d8;padding:10px;text-align:left}th{font-size:11px;text-transform:uppercase;color:#71717a}.summary{margin-top:24px;padding:16px;background:#f4f4f5}</style></head><body><h1>${escapeHtml(report.name)}</h1><p>${escapeHtml(report.range)} · ${escapeHtml(intersection)}</p><table><thead><tr><th>Day</th><th>Violations</th></tr></thead><tbody>${rows}</tbody></table><div class="summary">Total violations: ${totalViolations} · System uptime: ${escapeHtml(demoSummary.uptime)}</div><script>window.onload=()=>window.print()</script></body></html>`)
      printWindow.document.close()
      appendDemoRecord('notifications', {
        title: 'Report ready to print',
        detail: report.name,
        path: '/reports',
        preference: 'daily',
        read: false,
      }, demoNotifications)
      setDownloadNotice('Print view opened. Choose Save as PDF.')
      return
    }

    const rows = [
      ['Day', 'Violations'],
      ...demoDailyViolations.map(({ day, count }) => [day, count]),
      [],
      ['Total violations', totalViolations],
      ['Intersection', intersection],
      ['Report', report.name],
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    appendDemoRecord('notifications', {
      title: 'Report downloaded',
      detail: report.name,
      path: '/reports',
      preference: 'daily',
      read: false,
    }, demoNotifications)
    setDownloadNotice('Mock report downloaded as CSV.')
  }

  return (
    <div className="px-8 lg:px-12 py-8 flex flex-col gap-6 max-w-[1240px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[27px] font-bold text-white tracking-tight leading-snug">
          Reports
        </h1>
        <p className="text-zinc-400 text-xs sm:text-[13px] mt-1 font-normal">
          Generate and download traffic and violation reports.
        </p>
      </div>

      {/* Row 1: Build a Report & This Period matching media_1790444792624.png */}
      <div className="flex flex-col lg:flex-row gap-6 items-start max-w-[1040px]">
        {/* ========================================================
            CARD 1: Build a Report
           ======================================================== */}
        <div className="w-full lg:w-[60%] bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-zinc-900 tracking-tight mb-4">
              Build a Report
            </h2>

            <div className="flex flex-col gap-3.5">
              {/* Dropdowns Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                    Report Type
                  </label>
                  <div className="relative">
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full appearance-none bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs pr-8 cursor-pointer"
                    >
                      <option value="Violations Summary">Violations Summary</option>
                      <option value="Traffic Volume">Traffic Volume</option>
                      <option value="Emergency Logs">Emergency Logs</option>
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                    Intersection
                  </label>
                  <div className="relative">
                    <select
                      value={intersection}
                      onChange={(e) => setIntersection(e.target.value)}
                      className="w-full appearance-none bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs pr-8 cursor-pointer"
                    >
                      <option value="All Intersections">All Intersections</option>
                      <option value="Quezon Avenue">Quezon Avenue</option>
                      <option value="Commonwealth Ave">Commonwealth Ave</option>
                      <option value="East Avenue">East Avenue</option>
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Date Inputs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Format Toggle Pill */}
              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1.5">
                  Format
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('PDF')}
                    className={`px-6 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                      format === 'PDF'
                        ? 'bg-black text-white shadow-xs'
                        : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('CSV')}
                    className={`px-6 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                      format === 'CSV'
                        ? 'bg-black text-white shadow-xs'
                        : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-4 pt-3">
            <button
              type="button"
              disabled={generating}
              onClick={handleGenerate}
              className="px-8 py-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-xs font-bold rounded-md transition-colors cursor-pointer disabled:cursor-wait shadow-xs"
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
            {downloadNotice && <span role="status" className="ml-3 text-[10px] font-medium text-emerald-700">{downloadNotice}</span>}
          </div>
        </div>

        {/* ========================================================
            CARD 2: This Period
           ======================================================== */}
        <div className="w-full lg:w-[40%] bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
              <h2 className="text-[15px] font-bold text-zinc-900 tracking-tight">
                This Period
              </h2>
              <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                {periodRange}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Total Violations</span>
                <strong className="text-zinc-900 font-bold">{totalViolations}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Avg. daily traffic volume</span>
                <strong className="text-zinc-900 font-bold">1,240 vehicles</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Emergency priority events</span>
                <strong className="text-zinc-900 font-bold">{demoSummary.priorityEvents}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Intersection uptime</span>
                <strong className="text-zinc-900 font-bold">{demoSummary.uptime}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Disputes filed</span>
                <strong className="text-zinc-900 font-bold">{demoSummary.disputes}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Violations by Day Bar Chart matching media_1790444792624.png */}
      <div className="w-full max-w-[1040px] bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-zinc-900 tracking-tight">
            Violations by Day
          </h2>
          <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full">
            Last 7 days
          </span>
        </div>

        {/* 7 Clean Green Vertical Bars with Exact Reference Heights */}
        <div className="pt-6 pb-2">
          <div className="h-44 flex items-end justify-between px-6 sm:px-12 border-b border-zinc-100 gap-4">
            {demoDailyViolations.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div
                  className="w-full max-w-[48px] bg-[#16a34a] rounded-t-sm hover:bg-[#15803d] transition-all cursor-pointer shadow-2xs"
                  style={{ height: `${item.heightPct}%` }}
                  title={`${item.day}: ${item.count} violations`}
                />
              </div>
            ))}
          </div>

          {/* Days Labels Row */}
          <div className="flex justify-between px-6 sm:px-12 pt-3 text-xs font-semibold text-zinc-700">
            {demoDailyViolations.map((item) => (
              <span key={item.day} className="flex-1 text-center">
                {item.day}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Generated Reports Table matching media_1790444792624.png */}
      <div className="w-full max-w-[1040px] bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-2">
          <h2 className="text-[15px] font-bold text-zinc-900 tracking-tight">
            Generated Reports
          </h2>
          <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full">
            {generatedReports.length} reports
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-100">
                <th className="pb-2.5 font-semibold">REPORT</th>
                <th className="pb-2.5 font-semibold">RANGE</th>
                <th className="pb-2.5 font-semibold">FORMAT</th>
                <th className="pb-2.5 font-semibold">GENERATED</th>
                <th className="pb-2.5 text-right font-semibold"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80">
              {generatedReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 font-semibold text-zinc-900 pr-3">
                    {rep.name}
                  </td>
                  <td className="py-3 text-zinc-600 whitespace-nowrap pr-3">
                    {rep.range}
                  </td>
                  <td className="py-3 whitespace-nowrap pr-3">
                    <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      {rep.format}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500 whitespace-nowrap pr-3 font-mono">
                    {rep.date}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleDownload(rep)}
                      className="px-3.5 py-1 border border-zinc-300 hover:border-zinc-400 text-zinc-700 text-[11px] font-medium rounded-full hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <Download size={12} className="mr-1 inline-block" />{rep.format === 'PDF' ? 'Print PDF' : 'Download CSV'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
