import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import useTickets from '../hooks/useTickets'
import { addTickets } from '../utils/ticketSlice'
import { removeUser } from '../utils/userSlice'

// Lazy-load heavy chart components (recharts is a large dependency)
const AnalyticsWidget = lazy(() => import('../components/AnalyticsWidget'))
const HeatmapWidget = lazy(() => import('../components/HeatmapWidget'))

function AdminDashboard() {
  useTickets()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const ticketsList = useSelector((store) => store.tickets?.ticketsList) || []
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [workers, setWorkers] = useState([])
  const [workerForm, setWorkerForm] = useState({ email: '', firstName: '', lastName: '' })
  const [workerStatus, setWorkerStatus] = useState({ loading: false, error: '', success: '' })
  const [createdWorker, setCreatedWorker] = useState(null)

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch('http://localhost:7777/api/workers', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        setWorkers(data?.data ?? [])
      } catch (error) {
        console.error('Failed to fetch workers', error)
      }
    }

    fetchWorkers()
  }, [])

  useEffect(() => {
    if (!selectedTicket) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedTicket(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTicket])

  const handleAssignWorker = async (ticketId, workerId) => {
    if (!ticketId) return

    const worker = workers.find((item) => item.id === workerId)
    const workerName = worker?.name || null

    try {
      const response = await fetch(`http://127.0.0.1:7777/api/tickets/assign/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId, workerName }),
      })

      if (!response.ok) {
        return
      }

      const updated = ticketsList.map((ticket) =>
        ticket._id === ticketId || ticket.id === ticketId
          ? {
              ...ticket,
              assignedTo: workerId || null,
              assignedToName: workerName,
              status: workerId ? 'Assigned' : 'Pending',
            }
          : ticket,
      )
      dispatch(addTickets(updated))
    } catch (error) {
      console.error('Failed to assign worker', error)
    }
  }


  const handleCreateWorker = async (event) => {
    event.preventDefault()

    if (!workerForm.email) {
      setWorkerStatus({ loading: false, error: 'Email is required.', success: '' })
      return
    }

    setWorkerStatus({ loading: true, error: '', success: '' })
    setCreatedWorker(null)

    try {
      const response = await fetch('http://localhost:7777/api/admin/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: workerForm.email,
          firstName: workerForm.firstName || undefined,
          lastName: workerForm.lastName || undefined,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setWorkerStatus({ loading: false, error: data?.message || 'Unable to create worker.', success: '' })
        return
      }

      setWorkerStatus({ loading: false, error: '', success: 'Worker account created.' })
      setCreatedWorker(data?.data || null)
      setWorkerForm({ email: '', firstName: '', lastName: '' })

      const refreshed = await fetch('http://localhost:7777/api/workers', { cache: 'no-store' })
      const refreshedData = await refreshed.json().catch(() => null)
      if (refreshed.ok) {
        setWorkers(refreshedData?.data ?? [])
      }
    } catch (error) {
      setWorkerStatus({ loading: false, error: 'Unable to create worker.', success: '' })
    }
  }

  const getResolvedLabel = (ticket) => {
    if (!ticket?.resolvedAt) return null
    try {
      return new Date(ticket.resolvedAt).toLocaleString()
    } catch (error) {
      return null
    }
  }

  return (
    <div className="min-h-screen p-8">
      <nav className="mb-8 flex items-center justify-center relative">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Facilities Manager</h1>
        <button
          onClick={() => {
            localStorage.removeItem('campusfixStaff')
            dispatch(removeUser())
            navigate('/')
          }}
          className="absolute right-0 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-300"
        >
          Logout
        </button>
      </nav>

      <div className="mx-auto max-w-6xl space-y-8">
        <Suspense fallback={
          <div className="space-y-6 animate-pulse">
            <div className="h-48 rounded-2xl border border-white/10 bg-white/5" />
            <div className="h-48 rounded-2xl border border-white/10 bg-white/5" />
          </div>
        }>
          <AnalyticsWidget />
          <HeatmapWidget />
        </Suspense>
        <div className="rounded-2xl border border-[var(--color-surface-2)] bg-[var(--color-surface)] p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Create Maintenance Staff Account</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Generate worker credentials and share them securely with your staff.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateWorker} className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_auto]">
            <input
              type="email"
              placeholder="worker@campus.edu"
              value={workerForm.email}
              onChange={(event) => setWorkerForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-[var(--color-surface-2)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-white placeholder:text-white/40"
            />
            <input
              type="text"
              placeholder="First name"
              value={workerForm.firstName}
              onChange={(event) => setWorkerForm((prev) => ({ ...prev, firstName: event.target.value }))}
              className="w-full rounded-xl border border-[var(--color-surface-2)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-white placeholder:text-white/40"
            />
            <input
              type="text"
              placeholder="Last name"
              value={workerForm.lastName}
              onChange={(event) => setWorkerForm((prev) => ({ ...prev, lastName: event.target.value }))}
              className="w-full rounded-xl border border-[var(--color-surface-2)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-white placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={workerStatus.loading}
              className="rounded-full bg-emerald-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-emerald-400"
            >
              {workerStatus.loading ? 'Creating...' : 'Create Worker'}
            </button>
          </form>

          {workerStatus.error ? (
            <p className="mt-4 text-xs text-rose-200">{workerStatus.error}</p>
          ) : null}
          {workerStatus.success ? (
            <p className="mt-4 text-xs text-emerald-200">{workerStatus.success}</p>
          ) : null}

          {createdWorker ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-100">
              <p className="font-semibold">Generated Credentials</p>
              <p className="mt-2">Email: <span className="font-semibold">{createdWorker.email}</span></p>
              <p className="mt-1">Temporary Password: <span className="font-semibold">{createdWorker.password}</span></p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-emerald-200/80">Share securely</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[var(--color-surface-2)] bg-[var(--color-surface)] p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Maintenance Ticket Management</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Assign tickets to maintenance staff and track progress.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-surface-2)]">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Upvotes</th>
                    <th className="px-4 py-3 font-semibold">Assignee</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsList.length ? (
                    ticketsList.map((ticket) => (
                      <tr key={ticket._id || ticket.id} className="border-t border-[var(--color-surface-2)]">
                        <td className="px-4 py-3 font-medium text-white">{ticket.title}</td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">
                          {ticket.status || 'Pending'}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">
                          {ticket.upvotes ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="w-full rounded-lg border border-[var(--color-surface-2)] bg-[var(--color-surface)] px-3 py-2 text-sm text-white"
                            value={ticket.assignedTo || ''}
                            onChange={(event) =>
                              handleAssignWorker(ticket._id || ticket.id, event.target.value)
                            }
                          >
                            <option value="">Unassigned</option>
                            {workers.map((worker) => (
                              <option key={worker.id} value={worker.id}>
                                {worker.name}
                              </option>
                            ))}
                          </select>
                          {ticket.assignedToName ? (
                            <p className="mt-1 text-xs text-white/50">{ticket.assignedToName}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedTicket(ticket)}
                            className="rounded-full border border-emerald-400/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-white"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-[var(--color-text-muted)]" colSpan={6}>
                        No maintenance tickets found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedTicket ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Maintenance Ticket</p>
                <h3 className="mt-2 text-2xl font-semibold">{selectedTicket.title}</h3>
                {selectedTicket.resolvedAt ? (
                  <p className="mt-2 text-xs text-emerald-200">
                    Resolved at: {getResolvedLabel(selectedTicket)}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:border-white/40 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>{selectedTicket.description}</p>
              <p>
                <span className="text-white/50">Issue Type:</span>{' '}
                {selectedTicket.aiDetectedIssueType || selectedTicket.category || 'Other'}
              </p>
            </div>

            {Array.isArray(selectedTicket.imageUrls) && selectedTicket.imageUrls[0] ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={selectedTicket.imageUrls[0]}
                  alt={selectedTicket.title}
                  className="h-64 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            {Array.isArray(selectedTicket.resolutionImageUrls) && selectedTicket.resolutionImageUrls[0] ? (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Resolution Proof</p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={selectedTicket.resolutionImageUrls[0]}
                    alt="Resolution proof"
                    className="h-64 w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminDashboard
