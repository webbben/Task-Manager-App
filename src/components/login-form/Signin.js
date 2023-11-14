import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { TextFieldWhite } from '../custom';
import { login } from '../../authContext';
import { Alert, Slide } from '@mui/material';

  


export default function Signin(props) {
    const show = props.screen === 'signin';

    const [alert, setAlert] = React.useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');
        login(email, password, setAlert);
    };
    
    return (
        <div style={{ overflow: 'hidden', width: '100vw' }}>
        <Slide in={show} direction='right' mountOnEnter unmountOnExit>
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 4
            }}
            >
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={(e) => handleSubmit(e)} noValidate sx={{ mt: 1 }}>
                    <TextFieldWhite
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    />
                    <TextFieldWhite
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    />
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    >
                    Sign In
                    </Button>
                </Box>
            </Box>
            { alert.length > 0 ? 
            <Alert severity='error' onClose={() => setAlert('')}>{alert}</Alert> 
            : null }
            
        </Container>
        </Slide>
        </div>
    );
}