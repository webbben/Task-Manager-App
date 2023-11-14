import React from 'react';
import Calendar from "./calendar-main/Calendar";
import Summary from './summary/Summary';


/**
 * Body of the app, below the app bar. Either the calendar or the review tasks view.
 * @param {*} props 
 */
export default function Body(props) {
    const calendarProps = props.calendarProps;
    const taskCallbackProps = props.taskCallbackProps;
    const calendarFadeIn = props.calendarFadeIn;
    const setCalendarFadeIn = props.setCalendarFadeIn;
    const reviewTasksFadeIn = props.reviewTasksFadeIn;
    const setReviewTasksFadeIn = props.setReviewTasksFadeIn;

    return (
        <div>
            <Calendar 
                {...calendarProps}
                {...taskCallbackProps}
                calendarFadeIn={calendarFadeIn}
                reviewTasksFadeIn={reviewTasksFadeIn}
                setReviewTasksFadeIn={setReviewTasksFadeIn} />
            <Summary
                reviewTasksFadeIn={reviewTasksFadeIn}
                calendarFadeIn={calendarFadeIn} 
                setCalendarFadeIn={setCalendarFadeIn}
                taskCallbackProps={taskCallbackProps} />
        </div>
    );
}