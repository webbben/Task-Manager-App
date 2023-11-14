import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React from 'react';
import { AcceptButton, CancelButton } from '../custom';


export default function DeleteDialog(props) {
    const title = props.title;
    const subject = props.subject;
    const open = props.open;
    const acceptCallback = props.acceptCallback;
    const cancelCallback = props.cancelCallback;

    return (
        <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
            <DialogTitle id="alert-dialog-title">
            {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                {`Are you sure you want to delete this ${subject}? Once it's deleted, you will be unable to recover it.`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <AcceptButton onClick={() => acceptCallback()} autoFocus>Accept</AcceptButton>
                <CancelButton onClick={() => cancelCallback()}>Cancel</CancelButton>
            </DialogActions>
        </Dialog>
    );
}