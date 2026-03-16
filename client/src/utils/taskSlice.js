import { createSlice } from '@reduxjs/toolkit'

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    assignedTasks: [],
  },
  reducers: {
    addTasks: (state, action) => {
      state.assignedTasks = action.payload
    },
  },
})

export const { addTasks } = taskSlice.actions
export default taskSlice.reducer
