import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  id: null,
  role: null,
  name: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser: (state, action) => ({ ...state, ...action.payload }),
    removeUser: () => initialState,
  },
})

export const { addUser, removeUser } = userSlice.actions
export default userSlice.reducer
