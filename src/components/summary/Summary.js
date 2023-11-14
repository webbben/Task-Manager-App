import { Box, Divider, Fade } from '@mui/material';
import React from 'react';
import SummaryMonth from './SummaryMonth';
import { useSelector } from 'react-redux';

export default function Summary(props) {
    //const taskData = props.tasks;
    const reviewTasksFadeIn = props.reviewTasksFadeIn;
    const setCalendarFadeIn = props.setCalendarFadeIn;
    const calendarFadeIn = props.calendarFadeIn;

    // redux
    const tasks = useSelector((state) => state.tasks.tasks);

    function handleFadeOut() {
        setCalendarFadeIn(true);
    }

    if (calendarFadeIn) {
        return null;
    }

    var monthList = [];

    for (const monthKey in tasks) {
        monthList.push(tasks[monthKey]);
    }
    monthList.sort((a, b) => {
        if (a.date.isBefore(b.date)) {
            return -1;
        }
        return 1;
    });

    return (
        <Fade 
            in={reviewTasksFadeIn} 
            onExited={() => handleFadeOut()} 
            mountOnEnter 
            unmountOnExit
            timeout={500}
        >
            <Box sx={{ m: 2 }}>
                { monthList.map((monthObj, i) => {
                    return (
                        <SummaryMonth 
                        month={monthObj} 
                        key={'month' + i} />
                    );
                })}
                { !!tasks ? <Divider sx={{ marginTop: 1 }} /> : null }
            </Box>
        </Fade>
    );
}