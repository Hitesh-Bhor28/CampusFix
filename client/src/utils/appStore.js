import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import ticketReducer from './ticketSlice'
import taskReducer from './taskSlice'

const appStore = configureStore({
  reducer: {
    user: userReducer,
    tickets: ticketReducer,
    tasks: taskReducer,
  },
})

export default appStore
