import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addTickets } from '../utils/ticketSlice'

const useTickets = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`http://localhost:7777/api/tickets/all?ts=${Date.now()}`, {
          cache: 'no-store',
        })
        if (!response.ok) {
          return
        }
        const data = await response.json()
        const tickets = data?.data ?? []
        dispatch(addTickets(tickets))
      } catch (error) {
        console.error('Failed to fetch tickets', error)
      }
    }

    fetchTickets()
  }, [dispatch])
}

export default useTickets
