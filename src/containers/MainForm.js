import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextField, renderFileField, SubmitButton } from '../components/FormElements';
import { makeStyles } from '@material-ui/core/styles';
import { capitalizeFirstLetter } from '../utils';
import Alert from '@material-ui/lab/Alert';
import * as settings from '../settings';

const useMainFormStyles = makeStyles({
    root: {
        
    },
    alertWarning: {
        marginBottom: 20
    }
});

const validate = (values, props) => {
    const errors = {}
    const requiredFields = [
        'name',
        'height',
        'file'
    ]
    requiredFields.forEach(field => {
        if(settings.formValidationEnabled) {
            if(!values[field]) {
                errors[field] = capitalizeFirstLetter(field)+' is required';
            }
            if(values['name'] && values['name'].length > 100) {
                errors['name'] = 'Maximum length is 100 characters';
            }
            if(values['height']) {
                if(!values['height'].match(/^\d*$/)) {
                    errors['height'] = 'Height must be integer';
                } else if(parseInt(values['height']) > 500) {
                    errors['height'] = 'Maximum height is 500';
                } else if(parseInt(values['height']) < 0) {
                    errors['height'] = 'Height must be larger than 0';
                }
            }
            if(values['file'] && values['file']['size'] > 10*1024*1024) {
                errors['file'] = 'Maximum size of file is 10 MB';
            }
        }
    });
    return errors;
}

const MainForm = props => {
    const { handleSubmit, submitting, error } = props;
    const classes = useMainFormStyles(props);

    return (
        <form onSubmit={handleSubmit} id='mainForm'>
            {error && <Alert severity="error" className={classes.alertWarning}>{error}</Alert>}
            <Field
                name="name"
                label="Name"
                id="form-name"
                component={renderTextField}
                type="text"
                inputProps={settings.formValidationEnabled ? {
                    minLength: 1,
                    maxLength: 100
                }:{}}
            />
            <Field
                name="height"
                label="Height"
                id="form-height"
                component={renderTextField}
                type="number"
                inputProps={settings.formValidationEnabled ? {
                    min: 0,
                    max: 500
                }:{}}
            />
            <Field
                name="file"
                label="Select file"
                id="form-file"
                component={renderFileField}
            />
            <SubmitButton
                id="form-submit"
                disabled={submitting}
                label="Submit"
            />
        </form>
    )
}

const componentWithForms = reduxForm({
    form: 'mainForm',
    validate
})(MainForm);

export default componentWithForms;