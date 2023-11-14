import { Grid, Typography } from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import SummaryTask from "./SummaryTask";
import { Today } from "@mui/icons-material";
import { FlexBox } from "../custom";


export default function SummaryDay(props) {

    const tasks = props.day.tasks;
    const refDate = props.day.date;

    const isToday = refDate.isSame(dayjs(), 'day');
    const isMarker = isToday && tasks.length === 0;
    var dateLabel = refDate.format("M/D ddd");
    if (isToday) dateLabel += " (Today)";

    if (!tasks || tasks.length === 0) return null;

    return (
        <>
            <Grid item xs={12}>
                <FlexBox>
                { isToday ? <Today sx={{ mr: 1, color: 'violet' }} /> : null }
                <Typography sx={{ fontWeight: isToday ? "bold" : "normal" }} >{dateLabel}</Typography>
                </FlexBox>
            </Grid>
            { isMarker ? <Grid item xs={12}>
                <Typography>{"No tasks"}</Typography>
            </Grid>
             : null}
            { tasks.map((task, i) => {
                return (
                    <Grid item xs={12} key={task.title}>
                        <SummaryTask 
                        task={task} 
                        refDate={refDate} />
                    </Grid>
                );
            }) }
        </>
    );
}