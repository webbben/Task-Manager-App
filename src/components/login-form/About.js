import { Box, Container, CssBaseline, Grid, Slide, Typography } from "@mui/material";
import React from "react";

export default function About(props) {

    const show = props.screen === 'about';

    return (
        <div style={{ overflow: 'hidden', width: '100vw' }}>
        <Slide in={show} direction='left' mountOnEnter unmountOnExit>
        <Container component="main" maxWidth="lg">
            <CssBaseline />
            <Box
            sx={{
                marginTop: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
            <Typography component="h1" variant="h5" sx={{ mb: 5 }}>
                About
            </Typography>
            <Box>
                <Grid container spacing={8}>
                    <Grid item xs={6}>
                        <Typography variant="h6" gutterBottom>
                            What is this?
                        </Typography>
                        <Typography gutterBottom>
                            {`This is a task manager and calendar app I made for managing daily tasks and events. It functions quite similarly to other task management
                            systems like Outlook, Microsoft Todo, etc, but it focuses on the week ahead of you and is more casual, rather than a work-environment tool.
                            I made this just as a fun project to practice web development, but also as a tool I could also use in my daily life, but anyone else is welcome to use it too!`}
                        </Typography>
                        <br />
                        <Typography variant="h6" gutterBottom>
                            How to use
                        </Typography>
                        <Typography gutterBottom>
                            {`To try this app out, simply fill out the sign-in form with an email address of your choice. Psst - you can enter a fake one if you like. I won't make you verify ;)
                            Upon logging in, you will be redirected to the calendar view.`}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6" gutterBottom>
                            Tech details
                        </Typography>
                        <Typography gutterBottom>
                            {`This app is made with React.js on the front end, using MUI (Material UI library). The backend is on firebase using a realtime database.`}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
            </Box>
        </Container>
        </Slide>
        </div>
    );
}