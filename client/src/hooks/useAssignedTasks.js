import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth, useUser } from '@clerk/clerk-react'
import { addTasks } from '../utils/taskSlice'

const useAssignedTasks = () => {
  const dispatch = useDispatch()
  const { userId } = useAuth()
  const { user } = useUser()
  const role = user?.publicMetadata?.role || user?.unsafeMetadata?.role

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
