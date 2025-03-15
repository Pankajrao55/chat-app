import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    slectedUser: null,
    
};

const userSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSelectedUser: (state, action) => {
            state.slectedUser = action.payload;
           
           
           
        },
        reomveSelectedUser:(state)=>{
            state.slectedUser=null
        }
      
    }
});

export const { setSelectedUser,reomveSelectedUser} = userSlice.actions;
export default userSlice.reducer;
