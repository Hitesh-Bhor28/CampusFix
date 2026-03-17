import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './RootLayout'
import CitizenView from '../pages/CitizenView'
import AdminDashboard from '../pages/AdminDashboard'
import FieldWorkerView from '../pages/FieldWorkerView'
import TicketSubmitPage from '../pages/TicketSubmitPage'
import TicketFeedPage from '../pages/TicketFeedPage'
import MyTicketsPage from '../pages/MyTicketsPage'

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <CitizenView />,
      },
      {
        path: '/admin',
        element: <AdminDashboard />,
      },
      {
        path: '/worker',
        element: <FieldWorkerView />,
      },
      {
        path: '/tickets/submit',
        element: <TicketSubmitPage />,
      },
      {
        path: '/tickets',
        element: <TicketFeedPage />,
      },
      {
        path: '/my-tickets',
        element: <MyTicketsPage />,
      },
    ],
  },
])

const Body = () => {
  return <RouterProvider router={appRouter} />
}

export default Body
