import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const STATUS_COLORS = {
  Pending: '#f59e0b',
  'In Progress': '#38bdf8',
  Resolved: '#22c55e',
}

const AnalyticsWidget = () => {
  const complaintsList = useSelector((store) => store.complaints?.complaintsList) || []

  const { totalComplaints, totalResolved, totalPending, statusData, issueData } = useMemo(() => {
    const totalComplaints = complaintsList.length
    const statusCounts = complaintsList.reduce(
      (acc, complaint) => {
        const status = complaint.status || 'Pending'
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      { Pending: 0, 'In Progress': 0, Resolved: 0 },
    )

    const issueCounts = complaintsList.reduce((acc, complaint) => {
      const issue = complaint.aiDetectedIssueType || complaint.category || 'Other'
      acc[issue] = (acc[issue] || 0) + 1
      return acc
    }, {})

    return {
      totalComplaints,
      totalResolved: statusCounts.Resolved || 0,
      totalPending: statusCounts.Pending || 0,
      statusData: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      issueData: Object.entries(issueCounts).map(([name, value]) => ({ name, value })),
    }
  }, [complaintsList])

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Analytics</p>
        <h2 className="mt-2 text-2xl font-semibold">Complaints Overview</h2>
        <p className="mt-1 text-sm text-white/70">
          Track complaint volume, status performance, and issue distribution.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total Complaints</p>
          <p className="mt-3 text-3xl font-semibold">{totalComplaints}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total Resolved</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-200">{totalResolved}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total Pending</p>
          <p className="mt-3 text-3xl font-semibold text-amber-200">{totalPending}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Status Distribution</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Issue Type Distribution</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fill: '#cbd5f5', fontSize: 12 }} />
                <YAxis tick={{ fill: '#cbd5f5', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsWidget
