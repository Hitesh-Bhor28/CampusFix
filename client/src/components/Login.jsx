import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn, useClerk } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import { addUser } from '../utils/userSlice'

const Login = () => {
  const [mode, setMode] = useState('student')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const dispatch = useDispatch()
  const { setActive } = useClerk()
  const navigate = useNavigate()

  const handleStaffLogin = async (event, roleOverride) => {
    event.preventDefault()

    const identifier = emailRef.current?.value?.trim()
    const password = passwordRef.current?.value

    if (!identifier || !password) {
      setErrorMessage('Enter your email/ID and password.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('http://localhost:7777/api/auth/staff-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setErrorMessage(data?.message || 'Unable to sign in.')
        return
      }

      if (data?.sessionId) {
        await setActive({ session: data.sessionId })
      }

      const staffPayload = {
        id: data?.userId || null,
        role: roleOverride || data?.role || 'worker',
        name: data?.name || 'Staff',
      }

      localStorage.setItem('campusfixStaff', JSON.stringify(staffPayload))
      dispatch(addUser(staffPayload))

      if (emailRef.current) emailRef.current.value = ''
      if (passwordRef.current) passwordRef.current.value = ''

      // Redirect based on role
      const redirectRole = staffPayload.role
      if (redirectRole === 'admin') {
        navigate('/admin')
      } else {
        navigate('/worker')
      }
    } catch (error) {
      setErrorMessage('Network error while signing in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { key: 'student', label: 'Student', activeColor: 'bg-indigo-500 shadow-indigo-500/40' },
    { key: 'staff', label: 'Staff', activeColor: 'bg-slate-700 shadow-slate-700/40' },
    { key: 'admin', label: 'Admin', activeColor: 'bg-amber-600 shadow-amber-600/40' },
  ]

  const isCredentialMode = mode === 'staff' || mode === 'admin'

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid gap-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl shadow-black/30 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">CampusFix Access</p>
          <h1 className="mt-3 text-3xl font-semibold">Sign in to manage campus maintenance</h1>
          <p className="mt-3 text-sm text-white/70">
            Students use the student portal. Maintenance staff and admins use their issued credentials.
          </p>

          {/* Tab Toggle */}
          <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/10 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMode(tab.key)
                  setErrorMessage('')
                }}
                className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  mode === tab.key
                    ? `${tab.activeColor} text-white shadow-lg`
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Login Forms */}
          <div className="mt-8">
            {mode === 'student' ? (
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <SignIn routing="hash" />
              </div>
            ) : (
              <form
                onSubmit={(e) => handleStaffLogin(e, mode === 'admin' ? 'admin' : undefined)}
                className="rounded-3xl border border-white/10 bg-black/30 p-6"
              >
                <div className="grid gap-4">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                    {mode === 'admin' ? 'Admin Email / ID' : 'Staff Email / ID'}
                    <input
                      ref={emailRef}
                      type="text"
                      placeholder={mode === 'admin' ? 'admin@campus.edu' : 'staff@campus.edu'}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Password
                    <input
                      ref={passwordRef}
                      type="password"
                      placeholder=""
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  </label>
                </div>

                {errorMessage ? <p className="mt-4 text-xs text-rose-200">{errorMessage}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`mt-6 w-full rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    mode === 'admin'
                      ? 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                      : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                  }`}
                >
                  {isSubmitting
                    ? 'Signing in...'
                    : mode === 'admin'
                      ? 'Sign in as Admin'
                      : 'Sign in as Staff'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side Info Panel */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900/70 to-indigo-500/10 p-6">
          <h2 className="text-xl font-semibold">Need an account?</h2>
          <p className="mt-3 text-sm text-white/70">
            Facilities managers can create worker accounts and share credentials securely with maintenance staff.
          </p>
          <div className="mt-6 grid gap-4 text-xs text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Student Access</p>
              <p className="mt-1">Use your campus email to report and confirm tickets.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Staff Access</p>
              <p className="mt-1">Log in with the credentials issued by Facilities.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Admin Access</p>
              <p className="mt-1">Facilities managers sign in to oversee and assign maintenance tasks.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
