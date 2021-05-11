import React from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import App from './App';


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

function AppWrapper(props) {
    return (
        <MuiThemeProvider theme={theme}>
            <Provider store={store}>
                <App />
            </Provider>
        </MuiThemeProvider>
    );
}


export default AppWrapper;