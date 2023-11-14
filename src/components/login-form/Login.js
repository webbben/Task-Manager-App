import React, { useState } from 'react';
import Signup from './Signup';
import Signin from './Signin';
import { Box, Container, Fab } from '@mui/material';
import { FlexBox } from '../custom';
import { Help, LoginOutlined, PersonAdd } from '@mui/icons-material';
import About from './About';

/**
 * Login page. Includes forms for logging into an existing user, or creating a new one.
 */
export default function Login() {

    const screens = ['signin', 'signup', 'about'];
    const [fadeInScreen, setFadeInScreen] = useState(screens[0]);

    function handleTransition(nextScreen) {
        if (nextScreen === fadeInScreen) return;
        setFadeInScreen('');
        setTimeout(() => setFadeInScreen(nextScreen), 500);
    }

    const focusColor = '#6302f5';
    
    return (
        <Container>
            <Box sx={{ 
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                mt: 5
            }}>
            <FlexBox>
                <Fab 
                aria-label='about'
                color='secondary'
                title='About this app'
                sx={{ 
                    m: 1,
                    bgcolor: fadeInScreen === screens[2] ? focusColor : 'secondary',
                    '&:hover': {
                        bgcolor: focusColor,
                    },
                 }} 
                onClick={() => handleTransition(screens[2])}>
                    <Help />
                </Fab>
                <Fab
                title='Login'
                aria-label='login' 
                color='secondary' 
                sx={{ 
                    m: 1,
                    bgcolor: fadeInScreen === screens[0] ? focusColor : 'secondary',
                    '&:hover': {
                        bgcolor: focusColor,
                    },
                }} 
                onClick={() => handleTransition(screens[0])}>
                    <LoginOutlined />
                </Fab>
                <Fab
                title='Sign up'
                aria-label='signup' 
                color='secondary' 
                sx={{ 
                    m: 1,
                    bgcolor: fadeInScreen === screens[1] ? focusColor : 'secondary',
                    '&:hover': {
                        bgcolor: focusColor,
                    },
                }} 
                onClick={() => handleTransition(screens[1])}>
                    <PersonAdd />
                </Fab>
            </FlexBox>
            <Signup setScreen={setFadeInScreen} screen={fadeInScreen} />
            <Signin setScreen={setFadeInScreen} screen={fadeInScreen} />
            <About screen={fadeInScreen} />
            </Box>
        </Container>
    );
}