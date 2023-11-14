import { createSlice } from "@reduxjs/toolkit";
import { updateEvent as updateEventDB, createEvent as createEventDB, deleteEvent as deleteEventDB } from "../dataProvider";
import { getUserID } from "../authContext";

export const eventSlice = createSlice({
    name: 'events',
    initialState: {
        events: [],
        showEventEditor: false,
        eventToEdit: null
    },
    reducers: {
        createEvent: (state, action) => {
            const newTask = action.payload;
            newTask.eventID = createEventDB(getUserID(), newTask);
            state.events = [...state.events, newTask];
        },
        deleteEvent: (state, action) => {
            const eventObj = action.payload;
            deleteEventDB(getUserID(), eventObj);
            state.events = state.events.filter((event) => event.eventID !== eventObj.eventID);
        },
        updateEvent: (state, action) => {
            const newTask = action.payload;

            if (!newTask.eventID) {
                console.warn("editing event error: no event ID provided");
                return;
            }
            updateEventDB(getUserID(), newTask);

            var found = false;
            for (let i = 0; i < state.events.length; i++) {
                if (state.events[i].eventID === newTask.eventID) {
                    state.events[i] = {...newTask};
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.warn('updateEvent: couldnt find event being updated in the existing state...');
            }
        },
        setEvents: (state, action) => {
            state.events = action.payload;
        },
        toggleEventEditor: (state, action) => {
            const eventToEdit = action.payload;
            state.eventToEdit = eventToEdit; // pass through as null when closing to clear
            state.showEventEditor = !state.showEventEditor;
        }
    }
});

export const { createEvent, deleteEvent, updateEvent, setEvents, toggleEventEditor } = eventSlice.actions;
export default eventSlice.reducer;