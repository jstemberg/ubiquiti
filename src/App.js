import React, { useEffect } from 'react';
import { connect } from 'react-redux'
import { SubmissionError, reset } from 'redux-form';
import { Provider } from 'react-redux';
import store from './store/store';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import logo from './logo_simple.svg';
import MainForm from './containers/MainForm';
import DataTable from './containers/DataTable';
import Snackbar from '@material-ui/core/Snackbar';
import LinearProgress from '@material-ui/core/LinearProgress';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import * as settings from './settings';
import * as mainActions from './store/main/actions';


const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    palette: {
        type: 'light',
        primary: {
            main: '#00a0df',
            // light: '#ff6f60',
            // dark: '#ab000d'
        },
        secondary: {
            main: grey[100]
        }
    },
});

const useAppStyles = makeStyles(theme => ({
    app: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    logo: {
        display: 'block',
        margin: 'auto',
        width: 140,
        marginTop: 20,
        marginBottom: 30
    },
    formWrapper: {
        margin: 'auto',
        width: 500,
        paddingBottom: 0,
        flex: '0',
        boxSizing: 'border-box'
    },
    tableWrapper: {
        backgroundColor: theme.palette.background.default,
        flex: '1',
        padding: '40px 20px',
    },
    progressWrapper: {
        height: 70,
        boxSizing: 'border-box',
        paddingTop: 20
    },
    progressLabel: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        marginBottom: 2,
        fontSize: '0.85rem'
    },
    progressRoot: {
        height: 10,
        borderRadius: theme.shape.borderRadius
    },
    progressBar: {
        borderRadius: theme.shape.borderRadius
    },
    [theme.breakpoints.down('xs')]: {
        formWrapper: {
            width: '100%',
            padding: '0px 20px',
        }
    }
}));

function App(props) {
    const classes = useAppStyles(props);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [progressValue, setProgressValue] = React.useState(0);
    const [downloadError, setDownloadError] = React.useState(false);

    /**
     * Init application when App component is mounted
     */
    useEffect(() => {
        let interval;
        if(settings.autoUpdates) {
            downloadData();
            interval = setInterval(downloadData, settings.updateInterval);
        }
        document.addEventListener('downloadData', downloadData);
        return () => {
            if(settings.autoUpdates) {
                clearInterval(interval);
            }
            document.removeEventListener('downloadData', downloadData);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Download data from server
     */
    const downloadData = async () => {
        try {
            await props.dispatch(mainActions.downloadData())
            setDownloadError(false);
        } catch (error) {
            setDownloadError(error.message);
        }
    }

    /**
     * Update progress bar
     * @param {Object} progressEvent 
     */
    const updateProgress = (progressEvent) => {
        setProgressValue(progressEvent.loaded / progressEvent.total * 100);
    }

    /**
     * Upload file from form
     * @param {string} id 
     * @param {File} file 
     */
    const uploadFile = async (id, file, values) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            const responseUpload = await axios.post(settings.endpointUpload+'/'+id, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: updateProgress
            })
            if(responseUpload.status === 200 && responseUpload.data.result) {
                setSnackbarOpen(true);
                setUploading(false);
                setProgressValue(0);
                props.dispatch(reset('mainForm'));
                document.querySelectorAll('#mainForm input[type=file]').forEach(el => {el.value = null;}); // Fix that enables select same file more times
                if(settings.appendDataImmediately) {
                    props.dispatch(mainActions.appendData({
                        name: values.name,
                        height: values.height,
                        file: values.file.name
                    }));
                } else {
                    downloadData();
                }
            } else {
                throw new SubmissionError({file: 'Uploading failed'});
            }
        } catch(error) {
            setUploading(false);
            setProgressValue(0);
            if(error instanceof SubmissionError)  {
                throw error;
            } else {
                // https://github.com/axios/axios#handling-errors
                if (error.response) {
                    throw new SubmissionError({file: error.response.data.message});
                } else if (error.request) {
                    throw new SubmissionError({_error: 'Application is probably offline, check your internet connection and try it again.'});
                } else {
                    throw new SubmissionError({file: error.response.data.message});
                }
            }
        }
    }

    /**
     * Submit form data
     * @param {Object} values 
     * @returns 
     */
    const handleSubmit = async (values) => {
        try {
            const responseSubmit = await axios.post(settings.endpointSubmit, {
                name: values.name,
                height: values.height
            });
            if(responseSubmit.status === 200 && responseSubmit.data.uploadId) {
                await uploadFile(responseSubmit.data.uploadId, values.file, values);
            } else {
                throw new SubmissionError({file: 'Submitting Failed'});
            }
        } catch(error) {
            if(error instanceof SubmissionError)  {
                throw error;
            } else {
                // https://github.com/axios/axios#handling-errors
                if (error.response) {
                    throw new SubmissionError({_error: 'Error while submitting form'});
                } else if (error.request) {
                    throw new SubmissionError({_error: 'Application is probably offline, check your internet connection and try it again.'});
                } else {
                    throw new SubmissionError({_error: 'Error while submitting form'});
                }
            }
        };

        return true;
    };

    /**
     * Close snackbar handler
     * @param {Object} event 
     * @param {string} reason 
     * @returns 
     */
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    return (
        <MuiThemeProvider theme={theme}>
            <Provider store={store}>
                <div className={classes.app}>
                    <div className={classes.logoWrapper}>
                        <img src={logo} className={classes.logo} alt="logo" />
                    </div>
                    <div className={classes.formWrapper}>
                        <MainForm
                            onSubmit={handleSubmit}
                        />
                        <div className={classes.progressWrapper}>
                        {uploading &&
                            <>
                            <div className={classes.progressLabel}>Uploading {Math.round(progressValue)} %</div>
                            <LinearProgress
                                classes={{ root: classes.progressRoot, bar: classes.progressBar }}
                                value={progressValue}
                                variant='determinate'
                            />
                            </>
                        }
                        </div>
                    </div>
                    <div className={classes.tableWrapper}>
                        <DataTable downloadError={downloadError} />
                    </div>
                </div>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'right'}}
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert onClose={handleCloseSnackbar} severity="success">Form was submitted</Alert>
                </Snackbar>
            </Provider>
        </MuiThemeProvider>
    );
}

function mapStateToProps(state) {
    return {

    };
}

export default connect(mapStateToProps)(App);