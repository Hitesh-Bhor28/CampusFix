import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useUser } from '@clerk/clerk-react'
import RootLayout from './RootLayout'
import Shimmer from './Shimmer'

// Lazy-loaded page components (code-split per route)
const CitizenView = lazy(() => import('../pages/CitizenView'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const FieldWorkerView = lazy(() => import('../pages/FieldWorkerView'))
const TicketSubmitPage = lazy(() => import('../pages/TicketSubmitPage'))
const TicketFeedPage = lazy(() => import('../pages/TicketFeedPage'))
const MyTicketsPage = lazy(() => import('../pages/MyTicketsPage'))
const Login = lazy(() => import('./Login'))

const RoleGate = ({ allow }) => {
  const { user, isSignedIn } = useUser()
  const reduxUser = useSelector((store) => store.user)
  const stored = typeof window !== 'undefined' ? localStorage.getItem('campusfixStaff') : null
  const storedRole = stored ? JSON.parse(stored)?.role : null

  const role =
    (isSignedIn ? user?.publicMetadata?.role : null) ||
    reduxUser?.role ||
    storedRole ||
    'student'

  if (!allow.includes(role)) {
    return <Navigate to={role === 'worker' ? '/worker' : role === 'admin' ? '/admin' : '/'} replace />
  }

  return <Outlet />
}

// Suspense wrapper to provide shimmer fallback for lazy routes
const SuspenseLayout = () => (
  <Suspense fallback={<Shimmer />}>
    <Outlet />
  </Suspense>
)

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        // All children wrapped in Suspense for lazy loading
        element: <SuspenseLayout />,
        children: [
          // Login is accessible to everyone (no role gate)
          { path: '/login', element: <Login /> },
          {
            element: <RoleGate allow={['student']} />,
            children: [
              { path: '/', element: <CitizenView /> },
              { path: '/tickets/submit', element: <TicketSubmitPage /> },
              { path: '/tickets', element: <TicketFeedPage /> },
              { path: '/my-tickets', element: <MyTicketsPage /> },
            ],
          },
          {
            element: <RoleGate allow={['admin']} />,
            children: [{ path: '/admin', element: <AdminDashboard /> }],
          },
          {
            element: <RoleGate allow={['worker']} />,
            children: [{ path: '/worker', element: <FieldWorkerView /> }],
          },
        ],
      },
    ],
  },
])

const Body = () => {
  return <RouterProvider router={appRouter} />
}

export default Body
