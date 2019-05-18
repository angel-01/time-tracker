import React, { Fragment, useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
// import DateTimePicker from 'material-ui-datetimepicker';
import { InlineDateTimePicker } from "material-ui-pickers";
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import db from './lib/db';

export default class DialogGetPeriodHours extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            open: props.isOpen,
            current_period: null,
            hours: '00:00:00'
        };

        this.computeHours = (z) => {
            let elapsed_time = 0;
            for(const i of z){
                elapsed_time += i.elapsed_time;
            }

            const hours = Math.trunc(elapsed_time / 1000 / 3600);
            const minutes = Math.trunc(elapsed_time / 1000 % 3600 / 60);
            const seconds = Math.trunc(elapsed_time / 1000 % 3600 % 60);

            return ("" + hours).padStart(2, '0') + ":" + ("" + minutes).padStart(2, '0') + ":" + ("" + seconds).padStart(2, '0');
        }
    }

    componentDidMount(){

    }

    handleClose = () => {
        this.setState({ open: false });
        this.props.onClose();
    };

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.isOpen !== this.state.open) {
            this.setState(
            {
                open: nextProps.isOpen
            });
            if(nextProps.isOpen){
                db.app_state.where(':id').equals(1).first()
                    .then((x) => {
                        if(x){
                            db.track.where('period').equals(x.current_period).toArray()
                                .then(z => {
                                    this.setState({
                                        ...this.state,
                                        current_period: x.current_period,
                                        hours: this.computeHours(z)
                                    })
                                })
                        }
                    })
            }
        }
    }

    handleChange = (e) => {
        const period = parseInt(e.currentTarget.value);
        if(period){
            db.track.where('period').equals(period).toArray()
                .then(z => {
                    this.setState({
                        ...this.state,
                        current_period: period,
                        hours: this.computeHours(z)
                    })
                })
        }
        else {
            this.setState({
                ...this.state,
                current_period: '',
                hours: "00:00:00"
            })
        }
    };

    render() {
        return (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <div>
                    <Dialog
                        open={this.state.open}
                        onClose={this.handleClose}
                        aria-labelledby="form-dialog-title"
                    >
                        <DialogTitle id="form-dialog-title">Get Period's Hours</DialogTitle>
                        <DialogContent>
                            <TextField value={this.state.current_period} onChange={this.handleChange}/>
                            <div style={{marginTop: '10px'}}/>
                            <h3>{this.state.hours}</h3>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleClose} color="primary">
                                Ok
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </MuiPickersUtilsProvider>
        );
    }
}