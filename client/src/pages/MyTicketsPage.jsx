import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import useTickets from '../hooks/useTickets'
import StudentTicketCard from '../components/StudentTicketCard'

const MyTicketsPage = () => {
  useTickets()
  const { userId } = useAuth()
  const ticketsList = useSelector((store) => store.tickets?.ticketsList) || []

  const myTickets = ticketsList.filter((ticket) => ticket.reportedBy === userId)

  let content

  if (!userId) {
    content = (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30">
        <h2 className="text-xl font-semibold">Sign in to view your tickets</h2>
        <p className="mt-2 text-sm text-white/70">
          Please sign in to see the maintenance tickets you have submitted.
        </p>
      </div>
    )
  } else if (!ticketsList.length) {
    content = (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    )
  } else if (!myTickets.length) {
    content = (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30">
        <h2 className="text-xl font-semibold">No tickets yet</h2>
        <p className="mt-2 text-sm text-white/70">
          You have not submitted any maintenance tickets yet.
        </p>
      </div>
    )
  } else {
    content = (
      <div className="grid gap-6 md:grid-cols-2">
        {myTickets.map((ticket) => (
          <StudentTicketCard key={ticket._id || ticket.id} ticket={ticket} />
        ))}
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Your Submissions</p>
          <h1 className="mt-3 text-3xl font-semibold">My Tickets</h1>
          <p className="mt-2 text-sm text-white/70">
            View and track the maintenance tickets you have submitted.
          </p>
        </div>
        {content}
      </div>
    </section>
  )
}

export default MyTicketsPage

