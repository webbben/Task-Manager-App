import { CalendarMonth } from "@mui/icons-material";
import { Chip, Collapse, Divider, Grid } from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import SummaryDay from "./SummaryDay";

export default function SummaryMonth(props) {
    // props
    const refDate = props.month.date;
    const taskDays = props.month.days;

    // state
    // close previous months by default
    const [open, setOpen] = useState(!refDate.isBefore(dayjs(), 'month'));

    // logic, etc.
    const isCurrentMonth = dayjs().isSame(refDate, 'month');

    const dayArray = []; // put days into an array so we can sort them
    for (const dayKey in taskDays) {
        const dayObj = taskDays[dayKey];
        dayArray.push(dayObj);
    }
    dayArray.sort((a, b) => {
        if (a.date.isBefore(b.date)) {
            return -1;
        }
        return 1;
    })

    var monthLabel = refDate.format("MMMM YYYY");

    var taskCount = 0;
    for (const dayKey in taskDays) {
        taskCount += taskDays[dayKey].tasks.length;
    }

    if (!open) {
        monthLabel += ` (${taskCount})`;
    }

    if (dayArray.length === 0 || taskCount === 0) { 
        return null;
    }

    return (
        <>
        <Divider textAlign="left" sx={{ marginTop: 1 }}>
            <Chip 
                label={monthLabel} 
                onClick={() => setOpen(!open)} 
                icon={ isCurrentMonth ? <CalendarMonth /> : null } 
                color={ isCurrentMonth ? "success" : "default" }
                />
        </Divider>
        <Collapse in={open} mountOnEnter unmountOnExit timeout={500}>
            <Grid container sx={{ paddingLeft: 1 }}>
                { dayArray.map((dayObj, i) => {
                    return (
                        <SummaryDay 
                        day={dayObj} 
                        key={`summaryDay${i}`} />
                    );
                })}
            </Grid>
        </Collapse>
        </>
    );
}