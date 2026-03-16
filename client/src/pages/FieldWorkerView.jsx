import { Link } from 'react-router-dom'
import StaffDashboard from '../components/StaffDashboard'

function FieldWorkerView() {
    return (
        <div className="min-h-screen p-8">
            <nav className="mb-8 flex items-center justify-between">
                <Link to="/" className="text-[var(--color-text-muted)] transition-colors hover:text-white">
                    Back to Home
                </Link>
                <h1 className="text-2xl font-bold text-[var(--color-primary)]">Maintenance Staff View</h1>
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
