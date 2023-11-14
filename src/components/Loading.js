import React, { useState } from "react";
import { Box, Fade, LinearProgress, Slide, Typography } from "@mui/material";
import dayjs from 'dayjs';


export default function Loading(props) {

    const hour = dayjs().hour();
    const greeting = (hour < 12 ? "Good morning" : (hour < 17 ? "Good afternoon" : "Good evening"));
    const user = props.user;
    const name = user ? user.firstName : "";
    
    const [message, setMessage] = useState();
    const loadingMessage = "We're getting everything set up for you.";

    setTimeout(() => setMessage(loadingMessage), 3000);

    return (
        <Box sx={{
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
        }}>
            <LinearProgress color='secondary' sx={{ backgroundColor: 'black' }} />
            <Slide in={!!user} direction="right" timeout={1500}>
            <Box sx={{
                backgroundColor: 'inherit',
                color: 'white',
                position: 'fixed',
                top: '10%',
                left: '10%'
            }}>
                <Typography variant="h2" color={'white'}>{`${greeting}, ${name}`}</Typography>
                <br />
                <br />
                <Fade in={!!message}>
                    <Typography color={'white'}>{message}</Typography>
                </Fade>
            </Box>
            </Slide>
        </Box>
    )
}