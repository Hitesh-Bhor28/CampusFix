import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth, useUser } from '@clerk/clerk-react'
import { addTasks } from '../utils/taskSlice'

const useAssignedTasks = () => {
  const dispatch = useDispatch()
  const { userId: clerkUserId } = useAuth()
  const { user } = useUser()
  const reduxUser = useSelector((store) => store.user)

  // Check Clerk first, then fall back to Redux / localStorage
  const storedStaff = typeof window !== 'undefined' ? localStorage.getItem('campusfixStaff') : null
  const parsed = storedStaff ? JSON.parse(storedStaff) : null

  const userId = clerkUserId || reduxUser?.id || parsed?.id
  const role =
    user?.publicMetadata?.role ||
    user?.unsafeMetadata?.role ||
    reduxUser?.role ||
    parsed?.role

  useEffect(() => {
    if (!userId || role !== 'worker') return

    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `http://localhost:7777/api/issues/tasks?userId=${userId}`,
          {
            headers: {
              'x-user-role': role || '',
            },
          },
        )
        if (!response.ok) {
          return
        }
        const data = await response.json()
        dispatch(addTasks(data?.data ?? []))
      } catch (error) {
        console.error('Failed to fetch assigned tasks', error)
      }
    }

    fetchTasks()
  }, [dispatch, role, userId])
}

export default useAssignedTasks
