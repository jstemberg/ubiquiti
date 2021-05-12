import React from 'react';
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';
import * as mainSelectors from '../store/main/reducer';

const useTableStyles = makeStyles(theme => ({
    root: {
        maxWidth: 800,
        margin: 'auto',
    },
    tableContainer: {
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[2],
        backgroundColor: theme.palette.background.paper
    },
    loadingPlaceholder: {
        height: 4
    },
    tableHead: {
        fontWeight: 'bold',
    },
    noDataRow: {
        textAlign: 'center',
        color: theme.palette.text.secondary
    },
    downloadAlert: {
        marginBottom: 20
    }
}));

const DataTable = (props) => {
    const classes = useTableStyles(props);

    return (
        <div className={classes.root}>
            {props.downloadError && <Alert severity="error" className={classes.downloadAlert} >{props.downloadError}</Alert>}
            <TableContainer className={classes.tableContainer}>
                {props.loading ? <LinearProgress />:<div className={classes.loadingPlaceholder}></div>}
                <Table className={classes.table} aria-label="simple table">
                    <TableHead className={classes.tableHead}>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Height</TableCell>
                            <TableCell align="right">File</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.items.length > 0 ? (
                            props.items.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">{row.name}</TableCell>
                                    <TableCell align="right">{row.height}</TableCell>
                                    <TableCell align="right">{row.file}</TableCell>
                                </TableRow>
                            ))
                        ):(
                            <TableRow>
                                <TableCell colSpan={3} className={classes.noDataRow}>No data available</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

function mapStateToProps(state) {
    return {
        items:    mainSelectors.getAllItemsSorted(state),
        loading:  mainSelectors.isLoading(state)
    };
}

export default connect(mapStateToProps)(DataTable);