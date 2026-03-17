import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

const Show = ({ when, children }) => {
  if (when === 'signedIn') {
    return <SignedIn>{children}</SignedIn>
  }

  if (when === 'signedOut') {
    return <SignedOut>{children}</SignedOut>
  }

  return null
}

const Header = () => {
  return (
    <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white">
            CF
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Campus Facility
            </p>
            <p className="text-base font-semibold text-slate-900">Maintenance Helpdesk</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link className="transition hover:text-emerald-600" to="/">
            Student/Faculty View
          </Link>
          <Link className="transition hover:text-emerald-600" to="/admin">
            Facilities Manager
          </Link>
          <Link className="transition hover:text-emerald-600" to="/worker">
            Maintenance Staff
          </Link>
          <Link className="transition hover:text-emerald-600" to="/tickets/submit">
            Submit Ticket
          </Link>
          <Link className="transition hover:text-emerald-600" to="/tickets">
            Ticket Feed
          </Link>
          <Link className="transition hover:text-emerald-600" to="/my-tickets">
            My Tickets
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Show when="signedOut">
            <SignInButton mode="modal">
              <button className="rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signedIn">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  )
}

export default Header
