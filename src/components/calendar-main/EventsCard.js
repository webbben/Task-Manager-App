import React from 'react';
import { SecondaryCard } from '../custom';
import { Button, CardActions, CardContent } from '@mui/material';
import Event from './Event';
import { useDispatch } from 'react-redux';
import { toggleEventEditor } from '../../redux/eventSlice';


export default function EventsCard(props) {
    const toggleTaskDialog = props.toggleTaskDialog;
    const events = props.events;
    const isToday = props.today;
    const weekend = props.weekend;
    const deleteEventCallback = props.deleteEventCallback;

    const dispatch = useDispatch();

    return (
        <SecondaryCard weekend={+weekend}>
            <CardContent sx={{ padding: '5px' }}>
            { events.length > 0 ?
            events.map((event, i) => {
                return (
                    <Event event={event} toggleTaskDialog={toggleTaskDialog} deleteEventCallback={deleteEventCallback} key={event.title} />
                )
            })
            : "No events today."}
            </CardContent>
            { isToday ?
            <CardActions>
                <Button 
                    size="small" 
                    sx={{ color: 'primary.contrastText' }}
                    onClick={() => dispatch(toggleEventEditor())}
                >Add Event</Button>
            </CardActions>
            : null }
        </SecondaryCard>
    );
}