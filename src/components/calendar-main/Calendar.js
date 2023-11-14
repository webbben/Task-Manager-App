import React, { useRef } from 'react';
import { WEATHER_DATE_FORMAT } from '../../dataProvider';
import { Grid } from '@mui/material';
import Day from './Day';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// just doing this to make the grids grow to full width
const FlexGrid = styled(Grid)`
    .MuiGrid-root {
        flex-grow: 1;
    }
`;

export default function Calendar(props) {
    const weather = props.weather;
    const currentDate = props.currentDate;

    // redux
    const tasks = useSelector((state) => state.tasks.tasks);
    const events = useSelector((state) => state.events.events);

    // transition stuff
    const calendarFadeIn = props.calendarFadeIn;
    const reviewTasksFadeIn = props.reviewTasksFadeIn;
    const setReviewTasksFadeIn = props.setReviewTasksFadeIn;
    const calendarFadeOutProgress = useRef(0);

    // wait until all days are done fading out before fading in review tasks
    function handleFadeOut() {
        calendarFadeOutProgress.current += 0.2;
        if (calendarFadeOutProgress.current === 1) {
            calendarFadeOutProgress.current = 0;
            setReviewTasksFadeIn(true);
        }
    }

    // callbacks
    const deleteTaskCallback = props.deleteTaskCallback;
    const deleteEventCallback = props.deleteEventCallback;
    const toggleTaskDialog = props.toggleTaskDialog;

    // dates for the next 4 days
    const dates = [
        currentDate.add(1, 'day'),
        currentDate.add(2, 'day'),
        currentDate.add(3, 'day'),
        currentDate.add(4, 'day')
    ];

    var todayTasks = [];
    const todayMo = currentDate.month();
    const todayDay = currentDate.date();
    if (tasks && tasks[todayMo] && tasks[todayMo].days[todayDay]) {
        todayTasks = tasks[todayMo].days[todayDay].tasks;
    }

    var weatherToday = null;
    if (weather) {
        weatherToday = weather[currentDate.format(WEATHER_DATE_FORMAT)];
        // use tomorrow's weather if today's isn't available.
        // only happens late at night, since weather data is every 3 hours.
        if (!weatherToday) {
            weatherToday = weather[dates[0].format(WEATHER_DATE_FORMAT)];
        }
    }

    // don't render calendar if we are showing review tasks view now
    if (reviewTasksFadeIn) {
        return null;
    }

    return (
        <FlexGrid container spacing={0}>
            <FlexGrid item sm={12} md={4} lg={3}>
                <Day
                today
                fadeIn={calendarFadeIn}
                handleFadeOut={handleFadeOut}
                date={currentDate}
                tasks={todayTasks}
                deleteTaskCallback={deleteTaskCallback}
                deleteEventCallback={deleteEventCallback}
                toggleTaskDialog={toggleTaskDialog}
                events={events}
                weather={weatherToday} />
            </FlexGrid>
            <FlexGrid item sm={12} md={8} lg={9}>
                <FlexGrid container spacing={0}>
                { dates.map((date, i) => {
                    var dayTasks = [];
                    const mo = date.month();
                    const day = date.date();
                    if (tasks && tasks[mo] && tasks[mo].days[day]) {
                        dayTasks = tasks[mo].days[day].tasks;
                    }

                    return (
                        <FlexGrid item sm={12} md={6} lg={3} key={date.unix()}>
                            <Day
                            fadeIn={calendarFadeIn}
                            fadeOrder={i}
                            handleFadeOut={handleFadeOut}
                            date={date} 
                            tasks={dayTasks} 
                            events={events} 
                            toggleTaskDialog={toggleTaskDialog} 
                            deleteTaskCallback={deleteTaskCallback}
                            deleteEventCallback={deleteEventCallback}
                            weather={ weather ? weather[date.format(WEATHER_DATE_FORMAT)] : null } />
                        </FlexGrid>
                    );
                })}
                </FlexGrid>
            </FlexGrid>
        </FlexGrid>
    );
}