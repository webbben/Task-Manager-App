import { Box, Button, Card, CardActions, CardContent, Divider, Fade, Typography } from "@mui/material";
import React from "react";
import Task from "./Task";
import { SecondaryCard } from "../custom";
import EventsCard from "./EventsCard";
import { toggleTaskEditor } from "../../redux/taskSlice";
import { useDispatch } from "react-redux";

/**
 * 
 * @param {dayjs} date 
 * @returns 
 */
function formatDateString(date) {
    return date.format('ddd (M/D)')
}

function formatWeatherString(weather, isToday) {
    if (!weather) return "Loading weather data...";

    if (isToday) {
        return weather.desc + "; " + weather.tempList[0] + " °C (" + weather.precip + "%)";
    }
    return weather.desc + "; " + weather.low + " - " + weather.high + " °C (" + weather.precip + "%)";
}

export default function Day(props) {
    // props
    // fade transition
    const fadeIn = props.fadeIn;
    const fadeOrder = props.fadeOrder ? props.fadeOrder : 0;
    const handleFadeOut = props.handleFadeOut;
    // date, weather
    const date = props.date;
    const weather = props.weather;
    const today = props.today;

    // redux
    const dispatch = useDispatch();

    // events and tasks data
    const tasks = [...props.tasks];
    /*
    tasks.sort((a, b) => {
        if (!a.comp) {
            return -1;
        }
        return 1;
    });*/
    const events = props.events.filter((event) => event.date.isSame(date, 'day'));
    // callbacks and handlers
    const deleteEventCallback = props.deleteEventCallback;
    const toggleTaskDialog = props.toggleTaskDialog;

    // logic, other
    const isWeekend = (date.day() === 0 || date.day() === 6);
    
    return (
        <Fade 
            in={fadeIn} 
            timeout={200 + (fadeOrder * 100)} 
            onExited={() => handleFadeOut()}
            mountOnEnter
            unmountOnExit>
        <Box sx={{
            height: "100%",
            width: "100%"
        }}>
            <Card variant="outlined" sx={{
                borderRadius: "15px",
                m: '5px',
                overflow: 'auto',
                minHeight: today ? '85vh' : '60vh',
                backgroundColor: isWeekend ? '#1f1038' : 'default',
            }}>
                <CardContent sx={{ p: '10px' }}>
                    <Typography variant="h5">
                        {formatDateString(date)}
                    </Typography>
                    <Divider />
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Fade in={!!weather} timeout={500 + (fadeOrder * 100)}>
                        <Typography>
                            { formatWeatherString(weather, today) }
                        </Typography>
                        </Fade>

                        <EventsCard 
                            events={events} 
                            toggleTaskDialog={toggleTaskDialog} 
                            weekend={isWeekend}
                            today={today}
                            deleteEventCallback={deleteEventCallback} />

                        <SecondaryCard weekend={+isWeekend}>
                            <CardContent sx={{ padding: '5px' }}>
                            { tasks.length > 0 ?
                                tasks.map((task, i) => {
                                    return (
                                        <Task 
                                        compact={!today}
                                        task={task}
                                        date={date}
                                        toggleTaskDialog={toggleTaskDialog} 
                                        key={task.taskID} />
                                    );
                                })
                            : "No tasks" + (today ? " today" : "") }
                            </CardContent>
                            { today ?
                            <CardActions>
                                <Button 
                                    size="small" 
                                    sx={{ color: 'primary.contrastText' }}
                                    onClick={() => dispatch(toggleTaskEditor())}
                                >Add Task</Button>
                            </CardActions> : null}
                        </SecondaryCard>
                    </Box>
                </CardContent>
            </Card>
        </Box>
        </Fade>
    );
}