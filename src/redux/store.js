import { configureStore } from '@reduxjs/toolkit'
import taskReducer from './taskSlice';
import eventReducer from './eventSlice';
import userInfoReducer from './userInfoSlice';

export default configureStore({
    reducer: {
        tasks: taskReducer,
        events: eventReducer,
        userInfo: userInfoReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({ serializableCheck: false })
});