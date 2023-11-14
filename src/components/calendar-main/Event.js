import { AccordionActions, AccordionDetails, AccordionSummary, Box, Grow, IconButton, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { SlimAccordion } from '../custom';
import { Clear, Edit } from '@mui/icons-material';
import DeleteDialog from './DeleteDialog';
import { useDispatch } from 'react-redux';
import { deleteEvent, toggleEventEditor } from '../../redux/eventSlice';

export default function Event(props) {
    const title = props.event.title;
    const desc = props.event.desc;
    const start = props.event.start ? props.event.start.format('h:mma') : null;
    const end = props.event.end ? props.event.end.format('h:mma') : null;

    const dispatch = useDispatch();

    function handleDeleteEvent() {
        setDialogOpen(false);
        dispatch(deleteEvent(props.event));
    }

    const [dialogOpen, setDialogOpen] = useState(false);

    var timeSlot;
    if (start && end) { timeSlot = `(${start} - ${end})`; }
    else if (start && !end) { timeSlot = `(${start})`; }
    else if (!start && end) { timeSlot = `(Ends @ ${end})`; }
    else { timeSlot = '(All day)'; }

    return (
        <Box>
        <Grow in>
            <SlimAccordion
            sx={{ 
                backgroundColor: 'inherit', 
                width: '100%', 
                boxShadow: 'none' }}
            disableGutters>
                <AccordionSummary
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                    sx={{ margin: '0' }}
                >
                    <Typography>{`■ ${title} ${timeSlot}`}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: '8px 16px 0px'}}>
                    {desc}
                </AccordionDetails>
                <AccordionActions>
                    <Tooltip title='Edit event'>
                        <IconButton sx={{color: 'white' }} onClick={() => dispatch(toggleEventEditor(props.event))}><Edit /></IconButton>
                    </Tooltip>
                    <Tooltip title='Delete event'>
                        <IconButton sx={{ color: 'white' }} onClick={() => setDialogOpen(true)}><Clear /></IconButton>
                    </Tooltip>
                </AccordionActions>
            </SlimAccordion>
        </Grow>
        <DeleteDialog 
            open={dialogOpen}
            title="Delete Event"
            subject="event"
            acceptCallback={handleDeleteEvent}
            cancelCallback={() => setDialogOpen(false)} />
        </Box>
    );
}