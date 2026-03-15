import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AnalyticsWidget from '../components/AnalyticsWidget'
import HeatmapWidget from '../components/HeatmapWidget'
import useComplaints from '../hooks/useComplaints'
import { FIELD_WORKERS } from '../utils/constants'
import { addComplaints } from '../utils/complaintSlice'

function AdminDashboard() {
  useComplaints()
  const dispatch = useDispatch()
  const complaintsList = useSelector((store) => store.complaints?.complaintsList) || []

  const handleAssignWorker = async (complaintId, workerId) => {
    if (!complaintId) return

    try {
      const response = await fetch(
        `http://127.0.0.1:7777/api/complaints/assign/${complaintId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workerId }),
        },
      )

      if (!response.ok) {
        return
      }

      const updated = complaintsList.map((complaint) =>
        complaint._id === complaintId || complaint.id === complaintId
          ? { ...complaint, assignedTo: workerId }
          : complaint,
      )
      dispatch(addComplaints(updated))
    } catch (error) {
      console.error('Failed to assign worker', error)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <nav className="mb-8 flex items-center justify-between">
        <Link to="/" className="text-[var(--color-text-muted)] transition-colors hover:text-white">
          Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Admin Dashboard</h1>
      </nav>

      <div className="mx-auto max-w-6xl space-y-8">
        <AnalyticsWidget />
        <HeatmapWidget />
        <div className="rounded-2xl border border-[var(--color-surface-2)] bg-[var(--color-surface)] p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Complaint Management</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Assign complaints to field workers and track progress.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-surface-2)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Upvotes</th>
                  <th className="px-4 py-3 font-semibold">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {complaintsList.length ? (
                  complaintsList.map((complaint) => (
                    <tr
                      key={complaint._id || complaint.id}
                      className="border-t border-[var(--color-surface-2)]"
                    >
                      <td className="px-4 py-3 font-medium text-white">{complaint.title}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">
                        {complaint.status || 'Pending'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">
                        {complaint.upvotes ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="w-full rounded-lg border border-[var(--color-surface-2)] bg-[var(--color-surface)] px-3 py-2 text-sm text-white"
                          defaultValue={complaint.assignedTo || ''}
                          onChange={(event) =>
                            handleAssignWorker(complaint._id || complaint.id, event.target.value)
                          }
                        >
                          <option value="">Unassigned</option>
                          {FIELD_WORKERS.map((worker) => (
                            <option key={worker.id} value={worker.id}>
                              {worker.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-[var(--color-text-muted)]"
                      colSpan={4}
                    >
                      No complaints found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
