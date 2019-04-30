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

export default class DialogGetHours extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            open: props.isOpen,
            // from: Date.now() - 2592000000,
            from: null,
            to: Date.now(),
            hours: 0
        };
    }

    // componentDidMount(){
    //     this.computeHours();
    // }

    handleAdd = () => {

        db.company.put({
            name: this.state.name
        })
            .then(() => {
                this.props.onAdd();
            });

        this.setState({ open: false });
    };

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
        }
    }

    handleFromDateChange = (e) => {
        this.setState({
            ...this.state,
            from: e
        }, () => {
            this.computeHours();
        });
    };

    handleToDateChange = (e) => {
        this.setState({
            ...this.state,
            to: e
        }, () => {
            this.computeHours();
        });
    };

    computeHours = () => {
        // if(this.state.from){
        //
        // }
        const from = typeof this.state.from === 'number'? this.state.from: Date.parse(this.state.from);
        const to = typeof this.state.to === 'number'? this.state.to: Date.parse(this.state.to);
        // console.info(db.track.where('date_from').between(Date.parse(this.state.from), Date.parse(this.state.to)));
        db.track.where('date_from').between(from, to).and(x => {
            return x.date_to < to;
        }).toArray((x) => {
            let elapsed_time = 0;
            for(const i of x){
                elapsed_time += i.elapsed_time;
            }

            const hours = Math.trunc(elapsed_time / 1000 / 3600);
            const minutes = Math.trunc(elapsed_time / 1000 % 3600 / 60);
            const seconds = Math.trunc(elapsed_time / 1000 % 3600 % 60);

            this.setState({
                ...this.state,
                hours: ("" + hours).padStart(2, '0') + ":" + ("" + minutes).padStart(2, '0') + ":" + ("" + seconds).padStart(2, '0')
            });
        })
            // .then(x => console.info(x))
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
                        <DialogTitle id="form-dialog-title">Get Hours</DialogTitle>
                        <DialogContent>
                            <InlineDateTimePicker
                                        label="From"
                                        value={this.state.from}
                                        onChange={this.handleFromDateChange}
                                    />
                            <InlineDateTimePicker
                                label="To"
                                value={this.state.to}
                                onChange={this.handleToDateChange}
                            />
                            <div style={{marginTop: '10px'}}/>
                            <h3>{this.state.hours}</h3>
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
                </div>
            </MuiPickersUtilsProvider>
        );
    }
}