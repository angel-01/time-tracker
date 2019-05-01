import React, {Component} from 'react';
import './App.css';
import Fab from '@material-ui/core/Fab';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CloseIcon from '@material-ui/icons/Close';
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
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import IDBExportImport from 'indexeddb-export-import';

import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import AssignmentIcon from '@material-ui/icons/Assignment';
import classNames from 'classnames';
import DialogGetHours from "./DialogGetHours";
import DialogGetPeriodHours from "./DialogGetPeriodHours";

const drawerWidth = 240;

const styles = theme => ({
    fab: {
        // position: 'absolute',
        // bottom: theme.spacing.unit * 2,
        // right: theme.spacing.unit * 2,
    },
    root: {
        display: 'flex',
        height: '100%'
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        height: '100vh',
        overflow: 'auto',
    },
    chartContainer: {
        marginLeft: -22,
    },
    tableContainer: {
        height: 320,
    },
    h5: {
        marginBottom: theme.spacing.unit * 2,
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
            show_confirmation_at_id: null,
            current_track_id: null,
            is_drawer_open: false,
            is_dialog_get_hours_open: false,
            is_dialog_get_period_hours_open: false,
        };

        this.time_interval_manager = null;

        this.download = (filename, text) => {
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        };
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
        const now = Date.now();
        this.setState({
            ...this.state,
            start_time: now
        });
        db.app_state.where(':id').equals(1).first()
            .then(x => {
                if(!x){
                    console.info('no esta');
                    return db.app_state.put({
                        id: 1,
                        current_period: 1
                    })
                        .then(() => db.app_state.where(':id').equals(1).first())
                }

                return Promise.resolve(x);
            })
            .then((x) => {
                return db.track.put({
                    date_from: now,
                    date: new Date(now),
                    period: x.current_period
                })
            })
            .then((x) => {
                this.setState({
                    ...this.state,
                    current_track_id: x
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
                    this.updateCurrentTrack();
                }, 1000);
            });
    };

    handleStop = () => {
        clearInterval(this.time_interval_manager);
        this.updateCurrentTrack()
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

    handleExport = () => {
        const idb_db = db.backendDB(); // get native IDBDatabase object from Dexie wrapper

        // export to JSON, clear database, and import from JSON
        IDBExportImport.exportToJsonString(idb_db, (err, jsonString) => {
            if(err)
                console.error(err);
            else {
                this.download((new Date()).toLocaleString('es-ES') + ".track_bak", jsonString);
                // IDBExportImport.clearDatabase(idb_db, function(err) {
                //     if(!err) // cleared data successfully
                //         IDBExportImport.importFromJsonString(idb_db, jsonString, function(err) {
                //             if (!err)
                //                 console.log("Imported data successfully");
                //         });
                // });
            }
        });
    };

    updateCurrentTrack = () => {
        const now = Date.now();

        return db.track.where(":id").equals(this.state.current_track_id).modify({
            date_from: this.state.start_time,
            date_to: now,
            elapsed_time: now - this.state.start_time,
            elapsed_time_text: this.state.elapsed_time_to_show,
            date: new Date(this.state.start_time)
        })
    };

    handleDrawerOpen = () => {
        this.setState({
            ...this.state,
            is_drawer_open: true
        });
    };

    handleDrawerClose = () => {
        this.setState({
            ...this.state,
            is_drawer_open: false
        });
    };

    handleDialogGetHoursOpen = () => {
        this.setState({
            ...this.state,
            is_dialog_get_hours_open: true
        })
    };

    handleDialogGetPeriodHoursOpen = () => {
        this.setState({
            ...this.state,
            is_dialog_get_period_hours_open: true
        })
    };

    handleDialogGetHoursClose = () => {
        this.setState({
            ...this.state,
            is_dialog_get_hours_open: false
        })
    };

    handleDialogGetPeriodHoursClose = () => {
        this.setState({
            ...this.state,
            is_dialog_get_period_hours_open: false
        })
    };

    handleClosePeriod = () => {
        if(this.state.is_running)
            alert("Stop first!!!");
        else
            db.app_state.where(':id').equals(1).first()
                .then((x) => db.app_state.where(':id').equals(1).modify({
                    current_period: x.current_period + 1
                }));
    };

    render() {
        let button = null;
        if (this.state.is_running) {
            button = <Fab color="primary" className={this.classes.fab} onClick={this.handleStop}>
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
            <div className={this.classes.root}>
                <CssBaseline/>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classNames(this.classes.drawerPaper, !this.state.is_drawer_open && this.classes.drawerPaperClose),
                    }}
                    open={this.state.is_drawer_open}
                >
                    <div className={this.classes.toolbarIcon} style={{display: this.state.is_drawer_open? 'flex': 'none'}}>
                        <IconButton onClick={this.handleDrawerClose}>
                            <ChevronLeftIcon/>
                        </IconButton>
                    </div>
                    <div className={this.classes.toolbarIcon} style={{display: this.state.is_drawer_open? 'none': 'flex'}}>
                        <IconButton onClick={this.handleDrawerOpen}>
                            <ChevronRightIcon/>
                        </IconButton>
                    </div>
                    <Divider/>
                    <List>
                        <div>
                            <ListItem button onClick={this.handleDialogGetHoursOpen}>
                                <ListItemIcon>
                                    <TimelapseIcon />
                                </ListItemIcon>
                                <ListItemText primary="Get Hours" />
                            </ListItem>
                            <ListItem button onClick={this.handleClosePeriod}>
                                <ListItemIcon>
                                    <CloseIcon />
                                </ListItemIcon>
                                <ListItemText primary="Close Period" />
                            </ListItem>
                            <ListItem button onClick={this.handleDialogGetPeriodHoursOpen}>
                                <ListItemIcon>
                                    <CalendarTodayIcon />
                                </ListItemIcon>
                                <ListItemText primary="Get Period's Hours" />
                            </ListItem>
                        </div>
                    </List>
                    <Divider/>
                    <List>
                        <div>
                            <ListSubheader inset>Saved reports</ListSubheader>
                            <ListItem button>
                                <ListItemIcon>
                                    <BarChartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Reports" />
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <LayersIcon />
                                </ListItemIcon>
                                <ListItemText primary="Integrations" />
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Current month" />
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Last quarter" />
                            </ListItem>
                            <ListItem button>
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Year-end sale" />
                            </ListItem>
                        </div>
                    </List>
                </Drawer>
                <main style={{display: 'flex', height: '100%', justifyContent: 'center', /*alignItems: 'center'*/}} className={this.classes.content}>
                    <div className={this.classes.appBarSpacer}/>
                    <div>
                        <div style={{width: '100%', textAlign: 'center', cursor: 'pointer'}}>
                            <span className="timer" onClick={this.handleExport}>{this.state.elapsed_time_to_show}</span>
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
                <DialogGetHours isOpen={this.state.is_dialog_get_hours_open} onClose={this.handleDialogGetHoursClose}/>
                <DialogGetPeriodHours isOpen={this.state.is_dialog_get_period_hours_open} onClose={this.handleDialogGetPeriodHoursClose}/>
            </div>
        );
    }
}

export default withStyles(styles, {withTheme: true})(App);
