import thunk from 'redux-thunk';
import reducers from './reducers';
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';

const appReducer = combineReducers(reducers);

const enhancer = compose(
    applyMiddleware(thunk),
);

const store = createStore(appReducer, enhancer);

export default store;