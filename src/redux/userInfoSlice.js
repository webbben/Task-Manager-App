import { createSlice } from "@reduxjs/toolkit";


const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState: {
        userInfo: null,
        // watch loading status in App so we know when everything is ready
        // prefer this over watcing tasks and events state in App, so we dont re-render all of App whenever those states are touched.
        loadingStatus: {
            tasks: false,
            events: false,
        }
    },
    reducers: {
        setUserInfo: (state, action) => {
            state.userInfo = action.payload;
        },
        setLoadingStatus: (state, action) => {
            const stateItem = action.payload[0];
            const status = action.payload[1];
            if (stateItem === 'tasks') {
                state.loadingStatus.tasks = status;
            }
            if (stateItem === 'events') {
                state.loadingStatus.events = status;
            }
        }
    }
});

export const { setUserInfo, setLoadingStatus } = userInfoSlice.actions;
export default userInfoSlice.reducer;