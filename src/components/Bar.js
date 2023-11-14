// misc
import React from "react";
import { logout } from "../authContext";
import { APP_NAME } from "../constants";
// MUI
import { Refresh, Summarize } from "@mui/icons-material";
import { AppBar, Button, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// redux
import { useDispatch } from "react-redux";
import { toggleTaskEditor } from "../redux/taskSlice";
import { toggleEventEditor } from "../redux/eventSlice";


export default function Bar({loggedIn, showCalendar, location, handleTransition, breakpointSM, refreshData}) {

    // redux
    const dispatch = useDispatch();

    const switchTooltip = showCalendar ? "View Summary" : "Back to Calendar";
    const locationStr = (breakpointSM && loggedIn) ? ` ・ ${location}` : '';

    return (
        <AppBar position="static">
            <Toolbar>
            <Tooltip title={loggedIn ? switchTooltip : null}>
                <span>
                <IconButton
                disabled={!loggedIn}
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={() => handleTransition()}
                >
                { showCalendar ? <Summarize /> : <CalendarMonthIcon /> }
                </IconButton>
                </span>
            </Tooltip>
            
            <Typography align='left' variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {`${APP_NAME} ${locationStr}`}
            </Typography>
            { loggedIn ? 
            <>
                { breakpointSM ?
                <Tooltip title='Reload data'>
                <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label='menu'
                onClick={() => refreshData()}><Refresh /></IconButton>
                </Tooltip> : null }
                <Button color="inherit" onClick={() => dispatch(toggleTaskEditor())}>Task</Button>
                <Button color="inherit" onClick={() => dispatch(toggleEventEditor())}>Event</Button>
                <Button color="inherit" onClick={() => logout()}>Logout</Button>
            </> : null }
            </Toolbar>
        </AppBar>
    );
}