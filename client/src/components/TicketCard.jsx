import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  assigned: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
  'in progress': 'bg-indigo-500/15 text-indigo-200 border-indigo-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
}

const TicketCard = ({ ticket }) => {
  if (!ticket) return null

  const { userId } = useAuth()
  const [upvotes, setUpvotes] = useState(ticket.upvotes ?? 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showImage, setShowImage] = useState(false)

  const statusKey = String(ticket.status || 'Pending').toLowerCase()
  const statusClass = statusStyles[statusKey] || statusStyles.pending
  const isResolved = statusKey === 'resolved'

  const hasUpvoted = useMemo(() => {
    if (!userId) return false
    return Array.isArray(ticket.upvotedBy) && ticket.upvotedBy.includes(userId)
  }, [ticket.upvotedBy, userId])

  useEffect(() => {
    setUpvotes(ticket.upvotes ?? 0)
  }, [ticket.upvotes])

  const handleUpvote = async () => {
    if (isResolved) {
      setMessage('Resolved tickets cannot be upvoted.')
      return
    }

    if (!userId) {
      setMessage('Sign in to upvote this ticket.')
      return
    }

    if (hasUpvoted || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setMessage('')
    try {
      const response = await fetch(
        `http://localhost:7777/api/tickets/${ticket._id || ticket.id}/upvote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setMessage(data?.message || 'Unable to upvote right now.')
        return
      }

      const data = await response.json()
      setUpvotes(data?.data?.upvotes ?? upvotes + 1)
      setMessage('Upvoted!')
    } catch (error) {
      setMessage('Network error while upvoting.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const coordinates = ticket.location?.coordinates
  const latitude = coordinates?.[1]
  const longitude = coordinates?.[0]
  const issueType = ticket.aiDetectedIssueType || ticket.category || 'Other'
  const reportedBy = ticket.reportedByDisplay || ticket.reportedBy || 'Anonymous'
  const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null
  const createdLabel = createdAt
    ? createdAt.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Just now'

  const imageUrl = Array.isArray(ticket.imageUrls) ? ticket.imageUrls[0] : null

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{ticket.title}</h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
          {ticket.status || 'Pending'}
        </span>
      </div>
      <p className="mt-3 text-sm text-white/70">{ticket.description}</p>
      <div className="mt-4 grid gap-3 text-xs text-white/60 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Issue Type</p>
          <p className="mt-1 text-sm text-white">{issueType}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Location</p>
          <p className="mt-1 text-sm text-white">
            {latitude && longitude
              ? `Lat ${Number(latitude).toFixed(5)}, Lng ${Number(longitude).toFixed(5)}`
              : 'Not provided'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Reported By</p>
          <p className="mt-1 text-sm text-white">{reportedBy}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Reported At</p>
          <p className="mt-1 text-sm text-white">{createdLabel}</p>
        </div>
      </div>

      {imageUrl ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3">
          <button
            type="button"
            onClick={() => setShowImage((prev) => !prev)}
            className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300 hover:text-white"
          >
            {showImage ? 'Hide Proof' : 'View Proof'}
          </button>
          {showImage ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              <img
                src={imageUrl}
                alt={ticket.title}
                loading="lazy"
                className="h-56 w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <span>Upvotes: {upvotes}</span>
        <button
          type="button"
          onClick={handleUpvote}
          disabled={isResolved}
          className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            isResolved
              ? 'border-white/10 text-white/30'
              : hasUpvoted
                ? 'border-emerald-400/50 text-emerald-200'
                : 'border-white/20 text-white/70 hover:border-emerald-300 hover:text-white'
          }`}
        >
          {isResolved ? 'Resolved' : hasUpvoted ? 'Upvoted' : isSubmitting ? 'Upvoting...' : 'Upvote'}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-emerald-200">{message}</p> : null}
    </article>
  )
}

export default TicketCard
