import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth, useUser } from '@clerk/clerk-react'
import useAssignedTasks from '../hooks/useAssignedTasks'
import { addTasks } from '../utils/taskSlice'

const statusColors = {
  Pending: 'bg-amber-500/20 text-amber-200',
  Assigned: 'bg-sky-500/20 text-sky-200',
  'In Progress': 'bg-indigo-500/20 text-indigo-200',
  Completed: 'bg-emerald-500/20 text-emerald-200',
}

const StaffDashboard = () => {
  useAssignedTasks()
  const dispatch = useDispatch()
  const { userId } = useAuth()
  const { user } = useUser()
  const reduxUser = useSelector((store) => store.user)
  const storedStaff = typeof window !== 'undefined' ? localStorage.getItem('campusfixStaff') : null
  const parsed = storedStaff ? JSON.parse(storedStaff) : null
  const storedStaffRole = parsed?.role || null
  const role = user?.publicMetadata?.role || user?.unsafeMetadata?.role || reduxUser?.role || storedStaffRole

  // Resolve userId: Clerk first, then Redux, then localStorage
  const effectiveUserId = userId || reduxUser?.id || parsed?.id

  const assignedTasks = useSelector((store) => store.tasks?.assignedTasks) || []
  const [updatingId, setUpdatingId] = useState(null)
  const [proofFiles, setProofFiles] = useState({})
  const [compressionMessage, setCompressionMessage] = useState('')

  const handleStatusUpdate = async (taskId, nextStatus) => {
    if (!taskId || !nextStatus) return

    setUpdatingId(taskId)
    try {
      const response = await fetch(`http://localhost:7777/api/issues/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': effectiveUserId || '',
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
        .filter((task) => task.status !== 'Closed')

      dispatch(addTasks(updated))
    } catch (error) {
      console.error('Failed to update task status', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleResolveWithProof = async (taskId) => {
    const file = proofFiles[taskId]
    if (!file) return

    setUpdatingId(taskId)
    setCompressionMessage('Compressing resolution photo...')
    try {
      const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      setCompressionMessage('')

      const formData = new FormData()
      formData.append('image', compressedFile)

      const response = await fetch(`http://localhost:7777/api/issues/${taskId}/resolve`, {
        method: 'POST',
        headers: {
          'x-user-id': effectiveUserId || '',
          'x-user-role': role || '',
        },
        body: formData,
      })

      if (!response.ok) {
        return
      }

      const updated = assignedTasks.filter((task) => (task._id || task.id) !== taskId)
      dispatch(addTasks(updated))
      setProofFiles((prev) => {
        const next = { ...prev }
        delete next[taskId]
        return next
      })
    } catch (error) {
      console.error('Failed to resolve task', error)
    } finally {
      setUpdatingId(null)
      setCompressionMessage('')
    }
  }

  if (role !== 'worker') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <h3 className="text-lg font-semibold">Worker Access Only</h3>
        <p className="mt-2 text-sm text-white/70">
          Ask your administrator to assign you the Worker role in Clerk to view tasks.
        </p>
        <p className="mt-3 text-xs text-white/50">Signed in as: {effectiveUserId || 'Unknown'}</p>
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
        <p className="mt-3 text-xs text-white/50">Worker ID: {userId || reduxUser?.id || 'Unknown'}</p>
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

            {compressionMessage ? (
              <p className="mt-3 text-xs text-emerald-200">{compressionMessage}</p>
            ) : null}

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
                <div className="flex flex-1 flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Upload Completion Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setProofFiles((prev) => ({
                        ...prev,
                        [task._id || task.id]: event.target.files?.[0] || null,
                      }))
                    }
                    className="w-full rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-2 text-xs text-white file:mr-3 file:rounded-full file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-[10px] file:font-semibold file:text-white hover:file:bg-emerald-400"
                  />
                  <button
                    type="button"
                    disabled={isUpdating || !proofFiles[task._id || task.id]}
                    onClick={() => handleResolveWithProof(task._id || task.id)}
                    className="rounded-full border border-emerald-400/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-white"
                  >
                    {isUpdating ? 'Updating...' : 'Submit Proof'}
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default StaffDashboard
