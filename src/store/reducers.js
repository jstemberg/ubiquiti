import main from './main/reducer';
import { reducer as formReducer } from 'redux-form';

const reducers = {
    main,
    form: formReducer
};

export default reducers;