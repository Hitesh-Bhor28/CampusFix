import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth, useUser } from '@clerk/clerk-react'
import useAssignedTasks from '../hooks/useAssignedTasks'
import { addTasks } from '../utils/taskSlice'

const statusColors = {
  Pending: 'bg-amber-500/20 text-amber-200',
  Assigned: 'bg-sky-500/20 text-sky-200',
  'In Progress': 'bg-indigo-500/20 text-indigo-200',
  Resolved: 'bg-emerald-500/20 text-emerald-200',
}

const StaffDashboard = () => {
  useAssignedTasks()
  const dispatch = useDispatch()
  const { userId } = useAuth()
  const { user } = useUser()
  const role = user?.publicMetadata?.role || user?.unsafeMetadata?.role
  const assignedTasks = useSelector((store) => store.tasks?.assignedTasks) || []
  const [updatingId, setUpdatingId] = useState(null)

  const handleStatusUpdate = async (taskId, nextStatus) => {
    if (!taskId || !nextStatus) return

    setUpdatingId(taskId)
    try {
      const response = await fetch(`http://localhost:7777/api/issues/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || '',
          'x-user-role': role || '',
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        return
      }

      const updated = assignedTasks
        .map((task) =>
          task._id === taskId || task.id === taskId ? { ...task, status: nextStatus } : task,
        )
        .filter((task) => task.status !== 'Resolved')

      dispatch(addTasks(updated))
    } catch (error) {
      console.error('Failed to update task status', error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (role !== 'worker') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <h3 className="text-lg font-semibold">Worker Access Only</h3>
        <p className="mt-2 text-sm text-white/70">
          Ask your administrator to assign you the Worker role in Clerk to view tasks.
        </p>
        <p className="mt-3 text-xs text-white/50">Signed in as: {userId || 'Unknown'}</p>
      </div>
    )
  }

  if (!assignedTasks.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <h3 className="text-lg font-semibold">No Assigned Tasks</h3>
        <p className="mt-2 text-sm text-white/70">
          You are logged in as a worker, but no tickets are assigned to your account yet.
        </p>
        <p className="mt-3 text-xs text-white/50">Worker ID: {userId}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {assignedTasks.map((task) => {
        const isUpdating = updatingId === (task._id || task.id)
        const isInProgress = task.status === 'In Progress'
        const isAssigned = task.status === 'Assigned' || task.status === 'Pending'

        return (
          <article
            key={task._id || task.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusColors[task.status] || 'bg-slate-500/20 text-slate-200'
                }`}
              >
                {task.status || 'Pending'}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">{task.description}</p>
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              Location: {Array.isArray(task.location?.coordinates) ? 'On Campus' : 'Not set'}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {isAssigned ? (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusUpdate(task._id || task.id, 'In Progress')}
                  className="rounded-full border border-indigo-400/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200 transition hover:border-indigo-300 hover:text-white"
                >
                  {isUpdating ? 'Updating...' : 'Start Work'}
                </button>
              ) : null}
              {isInProgress ? (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusUpdate(task._id || task.id, 'Resolved')}
                  className="rounded-full border border-emerald-400/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-white"
                >
                  {isUpdating ? 'Updating...' : 'Mark Resolved'}
                </button>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default StaffDashboard
