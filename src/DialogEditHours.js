import React, {Fragment, useState} from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
// import DateTimePicker from 'material-ui-datetimepicker';
import {InlineDateTimePicker} from "material-ui-pickers";
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider} from 'material-ui-pickers';
import db from './lib/db';

export default class DialogEditHours extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: props.isOpen,
            // from: Date.now() - 2592000000,
            hours: 0,
            minutes: 0,
            seconds: 0,
            track: null
        };
    }

    componentDidMount() {
        // this.computeHours();
    }

    handleClose = () => {

        const elapsed_time = this.state.hours * 60 * 60 * 1000 + this.state.minutes * 60 * 1000 + this.state.seconds * 1000;
        const track = this.state.track;
        track.elapsed_time = elapsed_time;

        const hours = Math.trunc(elapsed_time / 1000 / 3600);
        const minutes = Math.trunc(elapsed_time / 1000 % 3600 / 60);
        const seconds = Math.trunc(elapsed_time / 1000 % 3600 % 60);

        track.elapsed_time_text = ("" + hours).padStart(2, '0') + ":" + ("" + minutes).padStart(2, '0') + ":" + ("" + seconds).padStart(2, '0');
        track.date_to = track.date_from + elapsed_time;

        db.track.where(":id").equals(track.id).modify(track).then(() => {
            this.setState({open: false});
            this.props.onClose();
        });
    };

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        // if (nextProps.isOpen !== this.state.open) {
        //     this.setState(
        //         {
        //             ...this.state,
        //             open: nextProps.isOpen
        //         });
        // }
        if (nextProps.track_id !== this.state.track_id && nextProps.track_id) {
            db.track.where(':id').equals(parseInt(nextProps.track_id)).first()
                .then(track => {
                    console.info('nextProps.track_id', nextProps.track_id);
                    console.info('last', track);
                    if (track){
                        const hours = Math.trunc(track.elapsed_time / 1000 / 3600);
                        const minutes = Math.trunc(track.elapsed_time / 1000 % 3600 / 60);
                        const seconds = Math.trunc(track.elapsed_time / 1000 % 3600 % 60);
                        this.setState({
                            ...this.state,
                            track: track,
                            open: nextProps.isOpen,
                            hours,
                            minutes,
                            seconds
                        })
                    }
                });
        }
    }

    handleHoursChange = (e) => {
        const val = e.currentTarget.value;
        if(val){
            this.setState({
                ...this.state,
                hours: parseInt(e.currentTarget.value)
            })
        }
        else{
            this.setState({
                ...this.state,
                hours: ''
            })
        }
    };

    handleMinutesChange = (e) => {
        const val = e.currentTarget.value;
        if(val){
            this.setState({
                ...this.state,
                minutes: parseInt(e.currentTarget.value)
            })
        }
        else{
            this.setState({
                ...this.state,
                minutes: ''
            })
        }
    };

    handleSecondsChange = (e) => {
        const val = e.currentTarget.value;
        if(val){
            this.setState({
                ...this.state,
                seconds: parseInt(e.currentTarget.value)
            })
        }
        else{
            this.setState({
                ...this.state,
                seconds: ''
            })
        }
    };

    render() {
        return (
            <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Edit</DialogTitle>
                <DialogContent>
                    {/*<InlineDateTimePicker*/}
                        {/*label="From"*/}
                        {/*value={this.state.from}*/}
                        {/*onChange={this.handleFromDateChange}*/}
                    {/*/>*/}
                    {/*<InlineDateTimePicker*/}
                        {/*label="To"*/}
                        {/*value={this.state.to}*/}
                        {/*onChange={this.handleToDateChange}*/}
                    {/*/>*/}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="hours"
                        label="Hours"
                        type="number"
                        fullWidth
                        value={this.state.hours}
                        onChange={this.handleHoursChange}
                    />
                    <TextField
                        margin="dense"
                        id="minutes"
                        label="Minutes"
                        type="number"
                        fullWidth
                        value={this.state.minutes}
                        onChange={this.handleMinutesChange}
                    />
                    <TextField
                        margin="dense"
                        id="seconds"
                        label="Seconds"
                        type="number"
                        fullWidth
                        value={this.state.seconds}
                        onChange={this.handleSecondsChange}
                    />
                    {/*<div style={{marginTop: '10px'}}/>*/}
                    {/*<h3>{this.state.hours}</h3>*/}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Ok
                    </Button>
                    {/*<Button onClick={this.handleAdd} color="primary">*/}
                    {/*Add*/}
                    {/*</Button>*/}
                </DialogActions>
            </Dialog>
        );
    }
}