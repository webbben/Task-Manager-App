import { Clear, Edit, WatchLater } from "@mui/icons-material";
import { Checkbox, Grid, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useState } from "react";

import { FlexBox } from "../custom";
import DeleteDialog from "../calendar-main/DeleteDialog";
import { useDispatch } from "react-redux";
import { deleteTask, toggleCompleteTask, toggleTaskEditor } from "../../redux/taskSlice";
require('firebase/auth');


export default function SummaryTask(props) {
    const task = props.task;
    const refDate = props.refDate;
    const isComplete = props.task.comp;

    // redux
    const dispatch = useDispatch();

    const [showDialog, setShowDialog] = useState(false);

    function handleCompTask() {
        dispatch(toggleCompleteTask([refDate, task]));
    }

    function handleDeleteTask() {
        setShowDialog(false);
        dispatch(deleteTask(task));
    }

    const theme = useTheme();
    const breakpointSM = useMediaQuery(theme.breakpoints.up('md'));

    const isOverdue = !task.comp && task.date.isBefore(refDate, 'day');

    return (
        <Grid container sx={{
            '&:hover': {
                bgcolor: '#150036',
            },
        }}>
            <Grid item xs={5} sm={3} md={3}>
                <FlexBox>
                <Checkbox 
                    checked={isComplete} 
                    color={task.comp ? 'success' : 'default'}
                    onClick={() => handleCompTask()} />
                {isOverdue ? 
                <Tooltip title={task.date.format('(M/D)')} placement="right">
                    <WatchLater sx={{ m: 1, color:'orange' }} />
                </Tooltip>
                    : null }
                <Typography sx={{ m: 1 }}>{ task.title}</Typography>
                </FlexBox>
            </Grid>
            <Grid item xs={7} sm={9} md={8}>
                <Typography sx={{ m: 1 }}>{task.desc}</Typography>
            </Grid>
            { breakpointSM ?
            <Grid item xs={1}>
                <FlexBox>
                    <IconButton onClick={() => dispatch(toggleTaskEditor(task))}>
                        <Edit />
                    </IconButton>
                    <IconButton onClick={() => setShowDialog(true)}>
                        <Clear />
                    </IconButton>
                </FlexBox>
            </Grid> : null }
            <DeleteDialog
                open={showDialog}
                title="Delete Task"
                subject = "task"
                acceptCallback={handleDeleteTask}
                cancelCallback={() => setShowDialog(false)} />
        </Grid>
    );
}