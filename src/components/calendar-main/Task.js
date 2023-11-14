import { Clear, Edit, ExpandMore } from "@mui/icons-material";
import { AccordionDetails, AccordionSummary, Box, Checkbox, Grow, SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { SlimAccordion } from "../custom";
import DeleteDialog from "./DeleteDialog";
import { deleteTask, toggleCompleteTask, toggleTaskEditor } from "../../redux/taskSlice";
import { useDispatch } from "react-redux";


export default function Task(props) {
    const taskName = props.task.title;
    const taskDesc = props.task.desc;
    const dueDate = dayjs(props.task.date);
    const isCompactMode = props.compact;
    const isComplete = props.task.comp;
    const date = props.date;

    // redux
    const dispatch = useDispatch();

    if (!date) {
        console.warn(`Task: no date was provided in props (${taskName})`);
    }

    const [isOpen, setIsOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const isOverDue = dueDate.isBefore(date, 'day');
    const bgColor = isComplete ? "green" : (isOverDue ? '#513f66' : "black");

    function onClickComplete(event) {
        event.stopPropagation();
        dispatch(toggleCompleteTask([date, props.task]));
        if (isOpen) setIsOpen(false);
    }

    function onClickDelete(event) {
        event.stopPropagation();
        setDialogOpen(true);
    }

    function handleDeleteTask() {
        setDialogOpen(false);
        dispatch(deleteTask(props.task));
    }

    return (
        <Box>
            <Grow in>
            <SlimAccordion
                disableGutters
                square={true}
                expanded={isOpen} 
                onChange={() => setIsOpen(!isOpen)}
                sx={{
                    borderRadius: "10px",
                    width: "100%",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    backgroundColor: bgColor,
                    margin: '0',
                    borderColor: '#d9bbfc'
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                    sx={{ margin: '0' }}
                >
                    <Tooltip title="Complete task" enterDelay={2000}>
                        <Checkbox checked={isComplete} style={{ color: 'white' }} onClick={(e) => onClickComplete(e)} size="small" />
                    </Tooltip>
                    <Typography variant="body1"
                        sx={{ 
                            alignSelf: 'center', 
                            paddingLeft: '0.5em', 
                            flexGrow: 1,
                            flexShrink: 1,
                        }}
                        >
                        {taskName}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: '8px ' + (isCompactMode ? '8px' : '16px') + ' 0px' }}>
                    { isOverDue ?
                    <Typography>
                        {"(" + dueDate.format('M/D') + ")"}
                    </Typography> : null }
                    <Typography gutterBottom={isComplete}>
                        {taskDesc}
                    </Typography>
                    { !isComplete ?
                    <SpeedDial 
                        ariaLabel="options" 
                        icon={<SpeedDialIcon />} 
                        direction="right" 
                        FabProps={{
                            sx: {
                                bgcolor: 'inherit',
                                '&:hover': {
                                    bgcolor: 'inherit',
                                },
                                width: '30px',
                                height: '35px',
                                margin: '3px 3px 6px 0px',
                                boxShadow: 'none'
                            }
                        }}
                        >
                        <SpeedDialAction 
                            icon={<Edit />}
                            tooltipTitle="Edit task"
                            onClick={() => dispatch(toggleTaskEditor(props.task))}
                            FabProps={{
                                sx: {
                                    bgcolor: 'secondary.main',
                                    '&:hover': {
                                        bgcolor: 'purple',
                                    },
                                    width: '35px',
                                    height: '35px',
                                    margin: '3px 3px 6px 0px'
                                }
                            }}/>
                        <SpeedDialAction 
                            icon={<Clear />}
                            tooltipTitle="Delete task"
                            onClick={(e) => onClickDelete(e)}
                            FabProps={{
                                sx: {
                                    bgcolor: 'secondary.main',
                                    '&:hover': {
                                        bgcolor: 'orangered',
                                    },
                                    width: '35px',
                                    height: '35px',
                                    margin: '3px 3px 6px 3px'
                                }
                            }}/>
                    </SpeedDial> : null }
                    
                </AccordionDetails>
            </SlimAccordion>
            </Grow>
            <DeleteDialog
                open={dialogOpen}
                title="Delete Task"
                subject = "task"
                acceptCallback={handleDeleteTask}
                cancelCallback={() => setDialogOpen(false)} />
        </Box>
        
    );
}