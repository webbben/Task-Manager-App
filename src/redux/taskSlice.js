import { createSlice } from "@reduxjs/toolkit";
import { getUserID } from "../authContext";
import { updateTask as updateTaskDB, createTask as createTaskDB, deleteTask as deleteTaskDB, toggleCompleteTask as toggleCompleteDB } from "../dataProvider";
import dayjs from "dayjs";


export const taskSlice = createSlice({
    name: 'tasks',
    initialState: {
        tasks: null,
        showTaskEditor: false,
        taskToEdit: null
    },
    reducers: {
        createTask: (state, action) => {
            const newTask = action.payload;
            if (!newTask || ! newTask.title) {
                return;
            }

            newTask.taskID = createTaskDB(getUserID(), newTask);

            // insert the new task into it's correct month/day nodes
            var newTasks = {...state.tasks};
            const month = newTask.date.month();
            const day = newTask.date.date();
            if (!newTasks[month]) {
                newTasks[month] = {
                    date: newTask.date,
                    days: {}
                };
            }
            if (!newTasks[month].days[day]) {
                newTasks[month].days[day] = {
                    date: newTask.date,
                    tasks: []
                }
            }
            newTasks[month].days[day].tasks.push(newTask);

            state.tasks = newTasks;
        },
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        deleteTask: (state, action) => {
            const task = action.payload;
            const month = task.date.month();
            const day = task.date.date();
            const taskID = task.taskID;
            var newTasks = {...state.tasks};

            // delete on database
            deleteTaskDB(getUserID(), taskID);

            // remove the task from state (if it can be found)
            var found = false;
            if (newTasks[month]) {
                if (newTasks[month].days[day]) {
                    newTasks[month].days[day].tasks = newTasks[month].days[day].tasks.filter((t) => t.taskID !== taskID);
                    found = true;
                }
            }
            if (!found) {
                let curMonth = dayjs().month();
                let curDay = dayjs().date();
                // it's probably an overdue task, so check today's date too
                if (newTasks[curMonth]) {
                    if (newTasks[curMonth].days[curDay]) {
                        newTasks[curMonth].days[curDay].tasks = newTasks[curMonth].days[curDay].tasks.filter((t) => t.taskID !== taskID);
                        found = true;
                    }
                }
            }
            if (!found) {
            console.warn(`deleting task ${taskID}: couldn't find in its date location. perhaps it's saved weirdly? should be deleted now either way...`);
            }

            state.tasks = newTasks;
        },
        updateTask: (state, action) => {
            const newTask = action.payload;

            if (!newTask.taskID) {
                console.warn("editing task error: no task ID provided");
                return;
            }
            updateTaskDB(newTask.taskID, newTask);

            // remove the old task, wherever it may be
            // since the date may have changed in newTask, we can't find it directly
            var updatedTasks = {...state.tasks};
            var found = false;
            for (const monthKey in updatedTasks) {
                const monthObj = updatedTasks[monthKey];
                
                for (const dayKey in monthObj.days) {
                    const dayObj = monthObj.days[dayKey];
                    for (const task of dayObj.tasks) {
                        if (task.taskID === newTask.taskID) {
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        dayObj.tasks = dayObj.tasks.filter((t) => t.taskID !== newTask.taskID);
                        break;
                    }
                }
                if (found) break;
            }

            if (!found) {
                console.warn("updateTask: the existing task was not found...");
                return;
            }
            
            // add new task into state object
            const month = newTask.date.month();
            const day = newTask.date.date();
            if (!updatedTasks[month]) {
                updatedTasks[month] = {
                    date: newTask.date,
                    days: {}
                };
            }
            if (!updatedTasks[month].days[day]) {
                updatedTasks[month].days[day] = {
                    date: newTask.date,
                    tasks: []
                };
            }
            updatedTasks[month].days[day].tasks.push(newTask);

            state.tasks = updatedTasks;
        },
        toggleCompleteTask: (state, action) => {
            const [date, taskObj] = action.payload;
            const month = date.month();
            const day = date.date();

            if (!state.tasks[month] || ! state.tasks[month].days[day]) {
                console.warn('toggleCompleteTask: date associated with task doesnt exist...');
                return;
            }

            // save change to database
            const copy = {...taskObj};
            copy.comp = !copy.comp;
            toggleCompleteDB(copy.comp, copy, getUserID());

            // update state
            // if we are completing the task, move it to today's task list since we've completed it today
            if (copy.comp) {
                copy.compDate = dayjs();
                copy.date = dayjs();
                state.tasks[month].days[day].tasks = state.tasks[month].days[day].tasks.filter((task) => task.taskID !== taskObj.taskID);
                state.tasks[dayjs().month()].days[dayjs().date()].tasks.push(copy);
            }
            // if we are 'un-completing' the task, leave it where it is but mark as incomplete
            else {
                for (const task of state.tasks[month].days[day].tasks) {
                    if (task.taskID === taskObj.taskID) {
                        task.comp = copy.comp;
                        break;
                    }
                }
            }

            
        },
        toggleTaskEditor: (state, action) => {
            const taskToEdit = action.payload;
            state.taskToEdit = taskToEdit; // pass as null when editor is closing
            state.showTaskEditor = !state.showTaskEditor;
        },
    }
});

export const { createTask, setTasks, deleteTask, updateTask, toggleCompleteTask, toggleTaskEditor } = taskSlice.actions;
export default taskSlice.reducer;