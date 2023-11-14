// styles
import './App.css';

// React, js libraries
import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';

// MUI imports
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// components
import AddTask from './components/AddTask';
import Login from './components/login-form/Login';
import Loading from './components/Loading';
import Body from './components/Body';
import Bar from './components/Bar';

// firebase
import firebase from "firebase/app";

// data layer
import { getUserID } from './authContext';
import { loadAllTaskData, loadEvents, loadUserInfo, loadWeatherData } from './dataProvider';

// redux
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from './redux/taskSlice';
import { setEvents } from './redux/eventSlice';
import { setLoadingStatus, setUserInfo } from './redux/userInfoSlice';


require('firebase/auth');


const darkerTheme = createTheme({
  palette: {
    mode: 'dark',
    // palette values for dark mode
    primary: {
      main: '#7f08f9',
      contrastText: '#fff'
    },
    secondary: {
      main: '#6F2CA2'
    },
    divider: '#7212c7',
    background: {
      default: '#000000', // screen background
      paper: '#0f0021', // card background
      weekend: '#000000'
    },
    text: {
      primary: '#fff',
      secondary: '#fff',
    },
    info: {
      main: '#fff'
    },
  },
});


function App() {

  // redux
  const loadingStatus = useSelector((state) => state.userInfo.loadingStatus);
  const showTaskEditor = useSelector((state) => state.tasks.showTaskEditor);
  const showEventEditor = useSelector((state) => state.events.showEventEditor);
  const userInfo = useSelector((state) => state.userInfo.userInfo);
  const dispatch = useDispatch();

  // user state
  const [loggedIn, setLoggedIn] = useState(false);
  const weatherLoadStatus = useRef('not-started');

  //#region login and loading code

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        onLogin(user.uid);
        console.log("auth: " + user.email);
      }
      else {
        setLoggedIn(false);
        onLogout();
      }
    });
  }, []);
  
  // handles the one time actions upon login, such as loading user data from database.
  function onLogin(userID) {
    loadData(userID);
    loadUserInfo(userID).then((userInfo) => {
      dispatch(setUserInfo(userInfo));
    });
    setLoggedIn(true);
  }

  function refreshData() {
    setCurrentDate(dayjs());
    setWeather(null);
    loadData(getUserID());
  }

  function loadData(userID) {
    loadAllTaskData(userID).then((taskData) => {
      dispatch(setTasks(taskData));
      dispatch(setLoadingStatus(['tasks', true]));
    });
    loadEvents(userID, currentDate).then((eventData) => {
      dispatch(setEvents(eventData));
      dispatch(setLoadingStatus(['events', true]));
    });
    loadWeatherData("C", setWeather, weatherLoadStatus);
  }

  function onLogout() {
    dispatch(setTasks(null));
    dispatch(setEvents([]));
    dispatch(setLoadingStatus({
      tasks: false,
      events: false
    }));
  }

  //#endregion

  // calendar state
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [weather, setWeather] = useState();

  // props for the calendar component
  const calendarProps = {
    weather: weather,
    currentDate: currentDate,
  };

  const [calendarFadeIn, setCalendarFadeIn] = useState(true);
  const [reviewTasksFadeIn, setReviewTasksFadeIn] = useState(false);

  const theme = useTheme()
  const breakpointSM = useMediaQuery(theme.breakpoints.up('sm'));

  function handleTransitionBody() {
    // if calendar is showing:
    // - calendarFadeIn = false
    // - - when IsExited is called for calendar, it sets reviewTasksFadeIn = true
    if (calendarFadeIn) {
      setCalendarFadeIn(false);
      return;
    }

    // if reviewTasks is showing:
    // - reviewTasksFadeIn = false
    // - - when IsExited is called for revTasks, it sets calendarFadeIn = true
    if (reviewTasksFadeIn) {
      setReviewTasksFadeIn(false);
      // vice versa; calendarFadeIn will get set to true
      return;
    }
  }

  // if tasks or events are null, that means data hasn't loaded yet.
  if (loggedIn & (!loadingStatus.tasks || !loadingStatus.events)) {
    return (
      <Loading user={userInfo} />
    );
  }

  return (
    <Box sx={{ display: 'flex', height: "100%" }}>
      <ThemeProvider theme={darkerTheme}>
        <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ flexGrow: 1, height: "100%" }}>
              <Bar
              location={weather ? weather.general.city : ''}
              showCalendar={calendarFadeIn}
              loggedIn={loggedIn}
              handleTransition={handleTransitionBody}
              breakpointSM={breakpointSM}
              refreshData={refreshData} />
              
              { loggedIn ? 
              <Body 
                calendarProps={calendarProps}
                calendarFadeIn={calendarFadeIn}
                reviewTasksFadeIn={reviewTasksFadeIn}
                setCalendarFadeIn={setCalendarFadeIn}
                setReviewTasksFadeIn={setReviewTasksFadeIn}
                 />
              : <Login /> }
              
            </Box>
            { showTaskEditor ? 
            <AddTask /> 
            : showEventEditor ?
            <AddTask eventMode />
            : null }
          </LocalizationProvider>
      </ThemeProvider>
    </Box>
  );
}

export default App;
