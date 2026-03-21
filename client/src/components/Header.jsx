import { useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addUser, removeUser } from '../utils/userSlice'

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
  const dispatch = useDispatch()
  const { user, isSignedIn } = useUser()
  const role = useSelector((store) => store.user?.role)

  useEffect(() => {
    if (!isSignedIn) {
      const stored = localStorage.getItem('campusfixStaff')
      if (stored) {
        try {
          const staff = JSON.parse(stored)
          dispatch(addUser(staff))
          return
        } catch (error) {
          localStorage.removeItem('campusfixStaff')
        }
      }

      // Signed out and no staff session — clear user
      dispatch(removeUser())
      return
    }

    const derivedRole = user?.publicMetadata?.role || 'student'
    dispatch(
      addUser({
        id: user?.id,
        role: derivedRole,
        name: user?.firstName || user?.fullName || user?.username || null,
      }),
    )
  }, [dispatch, isSignedIn, user])

  const isLoggedIn = !!role
  const normalizedRole = role || 'student'
  const isWorker = normalizedRole === 'worker'
  const isAdmin = normalizedRole === 'admin'

  const navLinks = isAdmin
    ? [{ to: '/admin', label: 'Facilities Manager' }]
    : isWorker
      ? [{ to: '/worker', label: 'Maintenance Staff' }]
      : [
          { to: '/', label: 'Student/Faculty View' },
          { to: '/tickets/submit', label: 'Submit Ticket' },
          { to: '/tickets', label: 'Ticket Feed' },
          { to: '/my-tickets', label: 'My Tickets' },
        ]

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

        {isLoggedIn && (
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((link) => (
              <Link key={link.to} className="transition hover:text-emerald-600" to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}

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
