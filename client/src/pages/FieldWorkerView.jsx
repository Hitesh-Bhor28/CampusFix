import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { removeUser } from '../utils/userSlice'
import StaffDashboard from '../components/StaffDashboard'

function FieldWorkerView() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleLogout = () => {
        localStorage.removeItem('campusfixStaff')
        dispatch(removeUser())
        navigate('/')
    }

    return (
        <div className="min-h-screen p-8">
            <nav className="mb-8 flex items-center justify-center relative">
                <h1 className="text-2xl font-bold text-[var(--color-primary)]">Maintenance Staff View</h1>
                <button
                    onClick={handleLogout}
                    className="absolute right-0 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-300"
                >
                    Logout
                </button>
            </nav>

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="rounded-2xl border border-[var(--color-surface-2)] bg-[var(--color-surface)] p-8">
                    <h2 className="mb-4 text-xl font-semibold">My Tasks</h2>
                    <p className="text-[var(--color-text-muted)]">
                        Review assigned maintenance tickets, track status, and update progress
                        as issues are resolved.
                    </p>
                </div>
                <StaffDashboard />
            </div>
        </div>
    )
}

export default FieldWorkerView
