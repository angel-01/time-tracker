import React, {Component} from 'react';
import './App.css';
import Fab from '@material-ui/core/Fab';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import {withStyles} from '@material-ui/core/styles';
import db from './lib/db';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TimelapseIcon from '@material-ui/icons/Timelapse';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';

const styles = theme => ({
    fab: {
        // position: 'absolute',
        // bottom: theme.spacing.unit * 2,
        // right: theme.spacing.unit * 2,
    },
});

class App extends Component {

    constructor(props) {
        super(props);

        const {classes, theme} = props;
        this.classes = classes;

        this.state = {
            elapsed_time: 0,
            elapsed_time_to_show: '00:00:00',
            start_time: null,
            is_running: false,
            track_history: [],
            show_confirmation_at_id: null
        };

        this.time_interval_manager = null;
    }

    componentDidMount() {
        return db.track.reverse().toArray()
            .then((x) => {
                this.setState({
                    ...this.state,
                    track_history: x
                });
            });
    }

    handleDelete = (e) => {
        this.setState({
            ...this.state,
            show_confirmation_at_id: parseInt(e.currentTarget.dataset.id)
        })
    };

    handleCancelDelete = () => {
        this.setState({
            ...this.state,
            show_confirmation_at_id: null
        })
    };

    handleConfirmDelete = (e) => {
        db.track.delete(parseInt(e.currentTarget.dataset.id))
            .then(() => {
                return db.track.reverse().toArray();
            })
            .then((x) => {
                this.setState({
                    ...this.state,
                    show_confirmation_at_id: null,
                    track_history: x
                })
            })
        ;
    };

    handlePlay = () => {

        // console.info(Math.trunc(1000 / 1000 / 3600));
        // console.info(1000 / 1000 % 60);

        this.setState({
            ...this.state,
            start_time: Date.now()
        });
        this.time_interval_manager = setInterval(() => {
            const new_now = Date.now();
            const elapsed_time = new_now - this.state.start_time;

            const hours = Math.trunc(elapsed_time / 1000 / 3600);
            const minutes = Math.trunc(elapsed_time / 1000 % 3600 / 60);
            const seconds = Math.trunc(elapsed_time / 1000 % 3600 % 60);
            const elapsed_time_to_show = ("" + hours).padStart(2, '0') + ":" + ("" + minutes).padStart(2, '0') + ":" + ("" + seconds).padStart(2, '0');
            this.setState({
                ...this.state,
                elapsed_time: elapsed_time,
                elapsed_time_to_show: elapsed_time_to_show,
                is_running: true
            });
        }, 1000);
    };

    handlePause = () => {
        clearInterval(this.time_interval_manager);
        const now = Date.now();

        db.track.put({
            date_from: this.state.start_time,
            date_to: Date.now(),
            elapsed_time: now - this.state.start_time,
            elapsed_time_text: this.state.elapsed_time_to_show,
            date: new Date(this.state.start_time)
        })
            .then(() => {

                return db.track.reverse().toArray();
            })
            .then((x) => {
                this.setState({
                    ...this.state,
                    track_history: x
                });
            });

        this.setState({
            ...this.state,
            is_running: false
        });


    };

    render() {
        let button = null;
        if (this.state.is_running) {
            button = <Fab color="primary" className={this.classes.fab} onClick={this.handlePause}>
                <StopIcon/>
            </Fab>
        }
        else {
            button = <Fab color="primary" className={this.classes.fab} onClick={this.handlePlay}>
                <PlayArrowIcon/>
            </Fab>
        }

        let listItems = [];

        for (let i of this.state.track_history) {
            const date = new Date(i.date);
            listItems.push(
                <ListItem button key={i.id} onClick={this.handleSelectCompany} data-id={i.id} data-name={i.name}>
                    <ListItemIcon style={{marginRight: '5px'}}>
                        <TimelapseIcon color={"primary"}/>
                    </ListItemIcon>
                    <ListItemText primary={date.toDateString() + ': ' + i.elapsed_time_text} style={{paddingLeft: 0}}/>
                    <ListItemIcon
                        style={{marginRight: '5px', display: i.id !== this.state.show_confirmation_at_id? 'inherit': 'none'}}
                        onClick={this.handleDelete}
                        data-id={i.id}>

                        <DeleteIcon color={"error"}/>
                    </ListItemIcon>
                    <span style={{display: i.id === this.state.show_confirmation_at_id? 'inherit': 'none'}}>
                        <ListItemIcon style={{marginRight: '5px'}} onClick={this.handleConfirmDelete} data-id={i.id}>
                            <DoneIcon color={"primary"}/>
                        </ListItemIcon>
                        <ListItemIcon style={{marginRight: '5px'}} onClick={this.handleCancelDelete}>
                            <CancelIcon color={"error"}/>
                        </ListItemIcon>
                    </span>
                </ListItem>
            );
        }

        return (
            <main style={{display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <div>
                    <div style={{width: '100%', textAlign: 'center'}}>
                        <span className="timer">{this.state.elapsed_time_to_show}</span>
                    </div>
                    <div style={{width: '100%', textAlign: 'center'}}>
                        {button}
                    </div>
                    <div style={{width: '100%'}}>
                        <List component="nav">
                            {listItems}
                        </List>
                    </div>
                </div>
            </main>
        );
    }
}

export default withStyles(styles, {withTheme: true})(App);