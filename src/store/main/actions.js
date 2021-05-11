import * as settings from '../../settings';
import * as types from './actionTypes';
import axios from 'axios';

/**
 * Validate data from server
 * @param {Array} data 
 * @returns boolean 
 */
const validateData = (data) => {
    if(!Array.isArray(data)) return false;
    for (const item of data) {
        if(typeof item !== 'object' || typeof item.name !== 'string' || !Number.isInteger(item.height) || typeof item.file !== 'string') return false;
    }
    return true;
}

/**
 * Download data from server and update store
 * @return {Object} action
 */
 export function downloadData() {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: types.LOADING_STARTED });
            const date = new Date();
            const response = await axios.get(settings.endpointData);

            if(response.status === 200 && validateData(response.data)) {
                dispatch({
                    type: types.ITEM_FETCHED,
                    items: response.data,
                    dateFetched: date
                });
                return true;
            } else {
                throw new Error('Invalid data');
            }
        } catch(error) {
            dispatch({ type: types.LOADING_FINISHED });
            // https://github.com/axios/axios#handling-errors
            if (error.response) {
                throw new Error('Error while downloading data');
            } else if (error.request) {
                throw new Error('Data could not be loaded, check your internet connection and try it again.');
            } else {
                throw new Error('Error while downloading data');
            }
        };
    };
}

/**
 * Append data to store
 * @param {Object} row 
 * @returns 
 */
export function appendData(row) {
    return {
        type: types.ITEM_APPEND,
        row: row,
    }
}