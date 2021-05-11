import * as types from './actionTypes';
import { createSelector } from 'reselect';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

const initialState = Immutable({
    loading: false,
    lastUpdate: undefined,
    items: []
});


export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.LOADING_STARTED:
            return state.set('loading', true);
        case types.LOADING_FINISHED:
            return state.set('loading', false);
        case types.ITEM_APPEND:
            return state.update('items', items => items.concat(action.row));
        case types.ITEM_FETCHED:
            return state.merge({
                loading: false,
                lastUpdate: action.dateFetched.toISOString(),
                items: action.items
            });
        default:
            return state;
    }
}


/* ----------- SELECTORS ------------- */

/**
 * Get timestamp of last update of items
 * @param {Object} state 
 * @returns {Object} Date object
 */
export const getLastUpdate = (state) => {
    return new Date(state.main.lastUpdate);
}

/**
 * Get all items as a collection
 * @param {Object} state 
 * @returns {Array.<Object>} Array of item object
 */
export const getAllItems = (state) => {
    return state.main.items;
}

/**
 * Get all sorted items as a collection
 * @param {Object} state 
 * @returns {Array.<Object>} Array of item object
 */
export const getAllItemsSorted = createSelector(
    [getAllItems], (items) => (_.sortBy(items, 'name'))
);

/**
 * Tells if data is refreshing
 * @param {Object} state 
 * @returns {Boolean}
 */
export const isLoading = (state) => {
    return state.main.loading;
}