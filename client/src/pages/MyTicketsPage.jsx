import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import useTickets from '../hooks/useTickets'
import StudentTicketCard from '../components/StudentTicketCard'

const MyTicketsPage = () => {
  useTickets()
  const { userId } = useAuth()
  const ticketsList = useSelector((store) => store.tickets?.ticketsList) || []

  if (!userId) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30">
        <h2 className="text-xl font-semibold">Sign in to view your tickets</h2>
        <p className="mt-2 text-sm text-white/70">
          Please sign in to see the maintenance tickets you have submitted.
        </p>
      </div>
    )
  }

  const myTickets = ticketsList.filter((ticket) => ticket.reportedBy === userId)

  if (!ticketsList.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    )
  }

  if (!myTickets.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30">
        <h2 className="text-xl font-semibold">No tickets yet</h2>
        <p className="mt-2 text-sm text-white/70">
          You have not submitted any maintenance tickets yet.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {myTickets.map((ticket) => (
        <StudentTicketCard key={ticket._id || ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}

export default MyTicketsPage
