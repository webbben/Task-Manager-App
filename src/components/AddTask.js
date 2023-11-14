import { Backdrop, ButtonGroup, Grid, Paper, TextField, Typography } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import React, { useState } from "react";
import { AcceptButton, CancelButton } from "./custom";

// redux
import { useDispatch, useSelector } from "react-redux";
import { createEvent, toggleEventEditor, updateEvent } from "../redux/eventSlice";
import { createTask, toggleTaskEditor, updateTask } from "../redux/taskSlice";

export default function AddTask(props) {
    const eventMode = props.eventMode;

    // redux
    const dispatch = useDispatch();
    const eventToEdit = useSelector((state) => state.events.eventToEdit);
    const taskToEdit = useSelector((state) => state.tasks.taskToEdit);

    const [title, setTitle] = useState(taskToEdit ? taskToEdit.title : '');
    const [desc, setDesc] = useState(taskToEdit? taskToEdit.desc : '');
    const [dueDate, setDueDate] = useState(taskToEdit? taskToEdit.date : dayjs());
    const [start, setStart] = useState(taskToEdit ? taskToEdit.start : null);
    const [end, setEnd] = useState(taskToEdit ? taskToEdit.end : null);

    function handleSubmit(event) {
        event.preventDefault();
        if (eventMode) {
            const eventObj = {
                title: title,
                desc: desc,
                date: dueDate,
                start: start,
                end: end,
                eventID: (eventToEdit ? eventToEdit.eventID : null)
            };
            if (eventToEdit) {
                dispatch(updateEvent(eventObj));
            }
            else {
                dispatch(createEvent(eventObj));
            }
            dispatch(toggleEventEditor());
        }
        else {
            const taskObj = { 
                title: title, 
                desc: desc, 
                date: dueDate, 
                comp: false, 
                taskID: (taskToEdit ? taskToEdit.taskID : null)
            };
            if (taskToEdit) {
                dispatch(updateTask(taskObj));
            }
            else {
                dispatch(createTask(taskObj))
            }
            dispatch(toggleTaskEditor());
        };
    }

    return (
        <Backdrop open>
        <Paper elevation={12} sx={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30%',
            minWidth: '250px',
            p: 2
        }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6">
                            { (taskToEdit ? "Edit " : "Create ") + (eventMode ? "Event" : "Task") }
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <TextField 
                            color="info"
                            autoFocus 
                            label="Task name" 
                            variant="standard" 
                            margin="normal"
                            value={title}
                            onInput={ e=>setTitle(e.target.value)} />
                    </Grid>
                    <Grid item xs={6} sx={{ alignSelf: "center" }}>
                        <DatePicker color="info" value={dueDate} onChange={(val) => setDueDate(val)} />
                    </Grid>
                    { eventMode ? 
                    <Grid item xs={6} sx={{ alignSelf: "center" }}>
                        <TimePicker 
                            value={start} 
                            label="Start time"
                            onChange={(val) => setStart(val)} />
                    </Grid>
                    : null }
                    { eventMode ? 
                    <Grid item xs={6} sx={{ alignSelf: "center" }}>
                        <TimePicker 
                            value={end} 
                            label="End time"
                            onChange={(val) => setEnd(val)} />
                    </Grid>
                    : null }
                    <Grid item xs={12}>
                        <TextField
                            color="info"
                            label="Description"
                            multiline
                            rows={4}
                            margin="normal"
                            fullWidth
                            value={desc}
                            onInput={ e=>setDesc(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} textAlign={"right"}>
                        <ButtonGroup variant="outlined">
                            <AcceptButton type="submit">Accept</AcceptButton>
                            <CancelButton onClick={() => eventMode ? dispatch(toggleEventEditor()) : dispatch(toggleTaskEditor())}>Cancel</CancelButton>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            </form>
        </Paper>
        </Backdrop>
    );
}