import "firebase/database";
import firebase from "firebase/app";
import dayjs from "dayjs";
import { OPENWEATHER_API_KEY } from "./private";
import { DEFAULT_COORDS } from "./constants";

//#region database schema

/*
== database schema ==
Concept here is that you never load the $uid level node directly; only one of the child nodes, like userinfo or calendar/$date.
The purpose here is so that you can load a specific calendar date, and not all the calendar dates at the same time.
This is important due to how firebase realtime databases load all child nodes of a node you load. So this would theoretically limit
to only loading tasks/events for a specific calendar date.

users {
    $uid {
        userinfo {
            firstName,
            lastName,
            email
        }
        events {
            2023 {
                02 {
                    09 {
                        $eventID
                    }
                }
            }
        }
        tasks {
            incomplete {
                $taskID
                ...
            },
            completed {
                2023 {
                    02 {
                        09 {
                            $taskID
                            ...
                        }
                        ...
                    }
                    ...
                }
                ...
            }
        }
    }
    ...
}

tasks {
    $taskID {
        ownerUID,
        title,
        desc,
        origDueDate,
        curDueDate,
        completed,
    }
    ...
}

events {
    $eventID {
        title,
        desc,
        date,
        timeRange,
    }
    ...
}
*/

//#endregion

//#region user

/**
 * Creates a user node in the database.
 * @param {string} userID 
 * @param {string} email 
 * @param {*} userInfo object containing all the general info for a user
 */
export function createUserNode(userID, email, userInfo) {
    firebase.database().ref('users/' + userID + '/userinfo').set({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: email,
    }, (error) => {
        if (error) console.warn(error);
    });
}

export async function loadUserInfo(userID) {
    const userInfo = await getRefVal(`users/${userID}/userinfo`);
    return userInfo;
}

//#endregion

//#region tasks

/**
 * Creates a task and adds it to the database.
 * @param {string} userID 
 * @param {*} taskInfo object containing all the info for a task
 */
export function createTask(userID, taskInfo) {
    var db = firebase.database();
    var taskListRef = db.ref('users/' + userID + '/tasks/incomplete');
    var newTaskRef = taskListRef.push();
    var taskID = newTaskRef.key;

    // just stores the task ID
    newTaskRef.set({
        taskID: taskID
    }, (error) => {
        if (error) console.warn(error);
    });

    // store actual task object
    saveTaskToDB(taskInfo, taskID, true);
    return taskID;
}

/**
 * Updates the given task with new data
 * @param {string} taskID 
 */
export function updateTask(taskID, taskInfo) {
    saveTaskToDB(taskInfo, taskID);
}

/**
 * Saves a task to the database.
 * @param {object} taskObj task object with all the data we wish to save
 * @param {string} taskID task ID for this task
 * @param {boolean} createNew if true, will do first-time creation steps. defaults to false.
 * @param {string} callingCode name of the function calling this - if you want it included in console error messages.
 */
function saveTaskToDB(taskObj, taskID, createNew=false, callingCode="saveTaskToDB") {
    if (!taskID) {
        console.warn(`${callingCode}: no task ID provided...`);
        return;
    }
    var db = firebase.database();
    var taskRef = db.ref('tasks/' + taskID);
    const taskClone = { ...taskObj }; // copy so changes don't affect original object
    taskClone.taskID = taskID;

    // newly created task operations
    if (createNew) {
        taskClone.dateOriginal = taskClone.date.unix();
    }

    // format values for database
    taskClone.dateString = taskClone.date.format("MMM DD YYYY");
    taskClone.date = taskClone.date.unix();
    if (taskClone.compDate) {
        taskClone.compDate = taskClone.compDate.unix();
    }

    taskRef.set(taskClone, (error) => {
        if (error) {
            console.warn(`${callingCode}: failed to save task...`);
            console.warn(error);
        };
    });
}

/**
 *  
 * @param {boolean} complete if true, will complete the task. if false (or null), will uncomplete the task.
 * @param {object} taskObj task object containing all its info (including the taskID)
 * @param {string} userID 
 * @param {dayjs} currentDate today's date
 */
export function toggleCompleteTask(complete, taskObj, userID) {
    if (!taskObj || !userID) { 
        console.warn("toggleCompleteTask: one of the required inputs is missing");
        console.warn(taskObj);
        console.warn(userID);
        return;
    }
    if (complete) completeTask(taskObj, userID);
    else uncompleteTask(taskObj, userID);
}

/**
 * completes a given task
 * @param {*} taskObj task object to be completed
 * @param {string} userID 
 */
async function completeTask(taskObj, userID) {
    if (!taskObj || !userID) return;
    var db = firebase.database();
    const taskID = taskObj.taskID;

    const taskCopy = {...taskObj};
    const currentDate = dayjs();

    // update the task node to mark it as complete
    taskCopy.comp = true;
    taskCopy.date = currentDate;
    taskCopy.compDate = currentDate;
    updateTask(taskID, taskCopy);

    // remove it from the user's incomplete tasks list
    delNode(`users/${userID}/tasks/incomplete/${taskID}`, db);

    // store it as a completed task for the user
    const year = currentDate.year();
    const month = currentDate.month();
    const date = currentDate.date();
    const path = 'users/' + userID + '/tasks/completed/' + year + '/' + month + '/' + date + '/' + taskID;
    var completeTaskRef = db.ref(path);
    completeTaskRef.set({ taskID: taskID }, (error) => {
        if (error) console.warn(error);
    });
}

async function uncompleteTask(taskObj, userID) {
    var db = firebase.database();
    const taskID = taskObj.taskID;

    // remove complete task ref
    // can't find the comp task ref if we don't know the comp date. todo: look up task by ID?
    if (taskObj.compDate) {
        const year = taskObj.compDate.year();
        const month = taskObj.compDate.month();
        const date = taskObj.compDate.date();
        const path = `users/${userID}/tasks/completed/${year}/${month}/${date}/${taskID}`;
        delNode(path);
    }
    else {
        console.warn(`uncomplete task: couldn't find complete date for ${taskID}. completed task ref was not removed...`);
    }

    // add task to incomplete list
    var incompleteTaskRef = db.ref('users/' + userID + '/tasks/incomplete/' + taskID);
    incompleteTaskRef.set({ taskID: taskID }, (error) => {
        if (error) console.warn(error);
    });

    // update the actual task to be incomplete
    const taskCopy = {...taskObj};
    taskCopy.comp = false;
    taskCopy.compDate = null;
    updateTask(taskID, taskCopy);
}



/**
 * deletes the given task if it exists. removes it from the user's incomplete tasks list and also hard-deletes the task itself.
 * @param {string} userID 
 * @param {string} taskID 
 */
export function deleteTask(userID, taskID) {
    // only incomplete tasks can be deleted;
    // delete task reference in the user's incomplete tasks, and then the actual task itself
    delNode(`users/${userID}/tasks/incomplete/${taskID}`);
    delNode(`tasks/${taskID}`);
    console.log("deleted task " + taskID);

    // Note: if a deleted task has refs that slips through our logic somehow there is also
    // "self cleaning" code in the loading tasks code to delete ghost task refs
}

/**
 * load all incomplete tasks for a user. incomplete tasks are either for today or a future date.
 * @param {string} userID 
 * @returns list of all the task objects loaded.
 */
export async function loadIncompleteTasks(userID) {
    var db = firebase.database();
    const path = `users/${userID}/tasks/incomplete`;
    var tasks = [];
    const taskSnapshotVals = await getRefVal(path, db);

    for (const val in taskSnapshotVals) {
        let taskObj = await loadTaskByID(val, db);
        if (!taskObj) {
            // delete this ref if task doesn't exist
            delNode(`${path}/${val}`, db);
        }
        tasks.push(taskObj);
    }
    return tasks;
}

/**
 * load all task data for the given user
 * @param {string} userID 
 * @param {number} lookbackMonths number of months to look back for tasks
 * @returns object containing all the tasks by month and day
 */
export async function loadAllTaskData(userID, lookbackMonths=1) {

    var monthlyTasks = await loadCompletedTasksLookback(userID, lookbackMonths);
    const incompleteTasks = await loadIncompleteTasks(userID);

    // all incomplete tasks will be in the current month or later.  map them to their month and day
    var monthly = {};

    // initialize an empty slot for today's date - since all overdue tasks will be inserted there instead of their true month.
    monthly[dayjs().month()] = {
        date: dayjs(),
        days: {}
    };
    monthly[dayjs().month()].days[dayjs().date()] = {
        tasks: [],
        date: dayjs()
    };

    for (const task of incompleteTasks) {
        // put old incomplete tasks into today's date
        const month = task.date.isBefore(dayjs(), 'month') ? dayjs().month() : task.date.month();
        if (!monthly[month]) {
            monthly[month] = {};
            monthly[month].date = task.date;
            monthly[month].days = {} // map tasks by day
        }
        const day = task.date.isBefore(dayjs(), 'day') ? dayjs().date() : task.date.date();
        if (!monthly[month].days[day]) {
            monthly[month].days[day] = {};
            monthly[month].days[day].tasks = [];
            monthly[month].days[day].date = task.date;
        }
        monthly[month].days[day].tasks.push(task);
    }

    // merge into the completed tasks monthly list
    for (const monthKey in monthly) {
        const monthObj = monthly[monthKey];

        // check if should be merged into month in the completed tasks list
        var merged = false;
        for (const compMonthKey in monthlyTasks) {
            const compTaskMonth = monthlyTasks[compMonthKey];
            if (monthObj.date.isSame(compTaskMonth.date, 'month')) {
                // merge these month objects
                merged = true;
                for (const dayKey in monthObj.days) {
                    const dayObj = monthObj.days[dayKey];

                    // day already exists in comp tasks month
                    if (compTaskMonth.days[dayKey]) {
                        compTaskMonth.days[dayKey].tasks = compTaskMonth.days[dayKey].tasks.concat(dayObj.tasks);
                    }
                    // day doesn't exist in comp tasks month yet
                    else {
                        compTaskMonth.days[dayKey] = { ...dayObj };
                    }
                }
            }
        }
        if (!merged) {
            monthlyTasks[monthObj.date.month()] = monthObj;
        }
    }

    return monthlyTasks;
}


/**
 * Loads completed tasks up to a specific number of months back. For example, if it's August now and you load 2 months back, 
 * you will get all completed tasks from June (6) to August (8).
 * @param {string} userID 
 * @param {number} lookbackMonths number of months to look back (default=1)
 */
async function loadCompletedTasksLookback(userID, lookbackMonths=1) {
    var output = {};
    var db = firebase.database();
    const currentDate = dayjs();

    for (let i = 0; i <= lookbackMonths; i++) {
        const lookbackDate = currentDate.subtract(i, 'month');
        const tasks = await loadCompletedTasksMonth(userID, lookbackDate, db);
        if (tasks) { 
            output[lookbackDate.month()] = tasks;
        }
    }

    return output;
}

/**
 * Loads the completed tasks for a given month
 * @param {string} userID 
 * @param {number} month numerical value for the month (0 based)
 * @param {number} year numerical value for the year (2 digit)
 * @param {firebase.database.Database} db 
 * @returns object containing a list of the task objects for the month
 */
async function loadCompletedTasksMonth(userID, lookbackDate, db) {
    if (!db) { db = firebase.database(); }
    const year = lookbackDate.year();
    const month = lookbackDate.month();
    const path = 'users/' + userID + '/tasks/completed/' + year + '/' + month;
    const json = await getRefVal(path, db);
    
    // get the actual task values and pack into object
    let monthObj = {};
    monthObj.days = {}; // map the tasks to their day of the month
    monthObj.date = lookbackDate; // to know the month this obj represents

    for (const day in json) {
        for (const taskID of Object.keys(json[day])) {
            const taskObj = await loadTaskByID(taskID, db);
            if (!taskObj) {
                // no data was found, so delete this ref
                delNode(`${path}/${day}/${taskID}`, db);
                continue;
            }
            // group tasks by day
            if (!monthObj.days[day]) {
                monthObj.days[day] = {};
                monthObj.days[day].tasks = [];
                monthObj.days[day].date = taskObj.date; // for formatting day string later
            }
            monthObj.days[day].tasks.push(taskObj);
        }
    }

    return monthObj;
}

/**
 * Load a task from the database by its task ID.
 * @param {string} taskID task ID for the task you want to load.
 * @param {firebase.database.Database} db firebase database ref, if you already have it.
 * @returns object containing the task info
 */
async function loadTaskByID(taskID, db=null) {
    if (!db) {
        db = firebase.database();
    }
    var output = await getRefVal('tasks/' + taskID)

    // convert dates back to dayjs objects
    if (output) {
        if (output.date) output.date = dayjs.unix(output.date);
        if (output.compDate) output.compDate = dayjs.unix(output.compDate);
    }

    confirmTaskIntegrity(output, taskID);
    return output;
}

/**
 * Checks to see if a task loaded from the server has correct information.
 * @param {object} taskObj task object that was loaded from server
 */
async function confirmTaskIntegrity(taskObj, taskID) {
    const idStr = `[${taskID}]`;
    if (!taskObj) {
        console.warn(`${idStr} Task loaded with no data. There may be a bug somewhere causing ghost tasks.`);
        return;
    }
    if (!taskObj.date || !taskObj.dateOriginal || !taskObj.dateString) {
        console.warn(`${idStr} Task missing dates:`);
        if (!taskObj.date) console.warn('task.date');
        if (!taskObj.dateOriginal) console.warn('task.dateOriginal');
        if (!taskObj.dateString) console.warn('task.dateString');
        return true;
    }
    if (!taskObj.title) {
        console.warn(`${idStr} Task missing title!`);
        return true;
    }
    return false;
}


/**
 * Retrieves the data at the specified node in the firebase realtime database.
 * Handles getting the value of the snapshot and all that.
 * @param {string} path path to the firebase node
 * @param {firebase.database.Database} db db ref, if you already have it
 * @returns value of the node at the given path, or null if it doesn't exist
 */
async function getRefVal(path, db = null) {
    if (!db) {
        db = firebase.database();
    }
    var ref = db.ref(path);
    const snapshot = await ref.get();
    if (!snapshot.exists()) return null;
    return snapshot.val();
}

/**
 * Deletes the node at the given path in the firebase realtime database.
 * @param {string} path path to the node to be deleted
 * @param {firebase.database.Database} db db ref, if you already have it
 */
async function delNode(path, db = null) {
    if (!db) {
        db = firebase.database();
    }
    var ref = db.ref(path);
    ref.remove((error) => {
        if (error) { 
            console.warn(error); 
        }
    });
    console.log(`deleting node ${path}`);
}

//#endregion

//#region events

export async function loadEvents(userID, currentDate) {
    var db = firebase.database();
    var events = [];

    const dates = [
        currentDate,
        currentDate.add(1, 'day'),
        currentDate.add(2, 'day'),
        currentDate.add(3, 'day'),
        currentDate.add(4, 'day')
    ];

    for (const date of dates) {
        const eventDay = await getRefVal(eventPath(userID, date), db);
        if (!eventDay) continue;
        for (const eventLink in eventDay) {
            var event = await loadEventByID(eventLink, db);
            if (event) events.push(event);
        }
    }
    return events;
}

async function loadEventByID(eventID, db) {
    if (!db) db = firebase.database();
    var event = await getRefVal('events/' + eventID, db);
    if (!event) return null;
    event.date = dayjs.unix(event.date);
    if (event.start) { event.start = dayjs.unix(event.start); }
    if (event.end) { event.end = dayjs.unix(event.end); }
    return event;
}

export async function createEvent(userID, eventObj) {
    var db = firebase.database();
    if (!eventObj || !eventObj.date) return;

    // create event node
    var eventsRef = db.ref('events/');
    var newEventNodeRef = eventsRef.push();
    const eventID = newEventNodeRef.key;

    newEventNodeRef.set({
        eventID: eventID,
        date: eventObj.date.unix(),
        start: eventObj.start ? eventObj.start.unix() : null,
        end: eventObj.end ? eventObj.end.unix() : null,
        title: eventObj.title,
        desc: eventObj.desc
    });

    // link event to user
    const path = eventPath(userID, eventObj.date, eventID);
    var userEventRef = db.ref(path);
    userEventRef.set({ eventID: eventID });
}

export async function updateEvent(userID, eventObj) {
    var db = firebase.database();
    const eventID = eventObj.eventID;
    var eventRef = db.ref('events/' + eventID);

    // check if date changed first; if so, update the user event link's location
    const oldEvent = await loadEventByID(eventID, db);
    if (!oldEvent.date.isSame(eventObj.date)) {
        // remove old user event link
        delNode(eventPath(userID, oldEvent.date, eventID), db);
        // add new user event link
        var newUserEventRef = db.ref(eventPath(userID, eventObj.date, eventID));
        newUserEventRef.set({ eventID: eventID });
    }
    eventRef.set({
        eventID: eventObj.eventID,
        date: eventObj.date.unix(),
        start: eventObj.start ? eventObj.start.unix() : null,
        end: eventObj.end ? eventObj.end.unix() : null,
        title: eventObj.title,
        desc: eventObj.desc
    });
}

/**
 * Deletes an event from firebase.
 * @param {string} userID 
 * @param {*} eventObj event object to be deleted.
 */
export async function deleteEvent(userID, eventObj) {
    var db = firebase.database();
    const eventID = eventObj.eventID;
    // delete event node
    delNode(`events/${eventID}`, db);
    // delete event link in user node
    delNode(eventPath(userID, eventObj.date, eventObj.eventID), db);
}

/**
 * Gets the path string for a user's event ref
 * @param {string} userID 
 * @param {dayjs} date date of the event
 * @param {string} eventID 
 * @returns path to the event ref in the user
 */
function eventPath(userID, date, eventID='') {
    const year = date.year();
    const month = date.month();
    const day = date.date();
    return 'users/' + userID + '/events/' + year + '/' + month + '/' + day + '/' + eventID;
}

//#endregion

//#region weather api

/**
 * =========================================================
 * ====================== Weather API ======================
 * =========================================================
 */


export const WEATHER_DATE_FORMAT = 'MM/DD';

// api doc here:
// https://openweathermap.org/forecast5

function getRequest(units, lat, lon) {
    if (!lat || ! lon) {
        lat = DEFAULT_COORDS.lat;
        lon = DEFAULT_COORDS.lon;
    }
    const unitParam = (units === "F") ? "imperial" : "metric";
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=${unitParam}`;
}

const weatherIcons = {
    clear: "mdi-weather-sunny",
    clouds: "mdi-weather-cloudy",
    wind: "mdi-weather-windy",
    drizzle: "mdi-weather-rainy",
    rain: "mdi-weather-pouring",
    thunderstorm: "mdi-weather-lightning",
    snow: "mdi-weather-snowy",
    atmosphere: "mdi-weather-fog",
    unknown: "mdi-weather-cloudy-clock"
}

function getWeatherIcon(code) {
    const category = resolveWeatherCode(code);
    return weatherIcons[category];
}

/**
 * gives the weather category for a given weather code.
 * @param {String} code 
 * @returns weather category
 */
function resolveWeatherCode(code) {
    if (code >= 200 & code < 300) {
        return 'thunderstorm';
    }
    if (code >= 300 & code < 400) {
        return 'drizzle';
    }
    if (code >= 500 & code < 600) {
        return 'rain';
    }
    if (code >= 600 & code < 700) {
        return 'snow';
    }
    if (code >= 700 & code < 800) {
        return 'atmosphere';
    }
    if (code === 800) {
        return 'clear';
    }
    if (code > 800 & code <= 804) {
        return 'clouds';
    }
    return 'unknown';
}

function getCoords() {
    if (!navigator.geolocation) {
        return;
    }

    return new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
    );
}

/**
 * openweather api
 * @param {String} units units for measurements
 * @returns object containing temperature and weather properties
 */
export async function loadWeatherData(units="C", setWeather, loadWeatherRef) {
    // get location
    let lat = null;
    let lon = null;
    try {
        loadWeatherRef.current = 'location-req';
        const position = await getCoords();
        lat = position.coords.latitude;
        lon = position.coords.longitude;
    } catch (err) {
        console.warn(err.message);
    }

    const req = getRequest(units, lat, lon);
    var json = null;
    loadWeatherRef.current = 'started';
    await fetch(req)
    .then(function(resp) { return resp.json() }).then(function(data) {
        json = data;
    })
    .catch(function(error) {
        console.warn(error);
    });

    const parsedData = parseDataByDay(json);
    loadWeatherRef.current = 'done';
    setWeather(parsedData);
}

/**
 * parses the json data into an array of data per day. returns an array of 5 objects (object per day) of the following format:
 * 
 * array[day].dow = day of week
 * array[day].temp = temperature
 * array[day].high = high temp for the day (?)
 * array[day].low = low temp for the day (?)
 * array[day].desc = description of weather
 * 
 * @param {object} json 
 * @returns objects for each day's weather data
 */
function parseDataByDay(json) {
    var daily = {};

    if (!json) return daily;

    const cnt = json.cnt;
    daily.general = {
        city: json.city.name,
        message: json.message
    };

    for (let i = 0; i < cnt; i++) {
        const rawDate = dayjs.unix(json.list[i].dt);
        const date = rawDate.format(WEATHER_DATE_FORMAT);
        if (!daily[date]) { daily[date] = {}; }
        if (!daily[date].dow) { 
            daily[date].dow = rawDate.format('dddd'); 
        }
        if (!daily[date].desc) {
            
            daily[date].desc = []; 
        }
        daily[date].desc.push(json.list[i].weather[0].main);

        let temp = json.list[i].main.temp;
        let precip = json.list[i].pop;

        if (!daily[date].tempList) {
            daily[date].tempList = [];
        }
        daily[date].tempList.push(Math.round(temp));

        // average...
        // temp
        if (!daily[date].temp) { daily[date].temp = temp; }
        else { daily[date].temp += temp; }
        // chance of precipitation
        if (!daily[date].precip) { daily[date].precip = precip; }
        else { daily[date].precip += precip; }
        
        // low
        if (!daily[date].low || temp < daily[date].low) {
            daily[date].low = temp;
        }
        
        // high
        if (!daily[date].high || temp > daily[date].high) {
            daily[date].high = temp;
        }

        if (!daily[date].reads) { daily[date].reads = 1; }
        else { daily[date].reads++; }
    }
    
    for (const day of Object.keys(daily)) {
        if (day === 'general') { continue; }
        daily[day].temp = Math.round(daily[day].temp / daily[day].reads);
        daily[day].low = Math.round(daily[day].low);
        daily[day].high = Math.round(daily[day].high);
        daily[day].precip = Math.round((daily[day].precip / daily[day].reads) * 100);
        daily[day].desc = daily[day].desc[Math.floor(daily[day].desc.length / 2)];
    }

    return daily;
}


//#endregion