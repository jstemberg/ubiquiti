import React from 'react';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import CheckIcon from '@material-ui/icons/Check';
import { formatBytes } from '../utils';


// TEXT FIELDS 
const Text = ({ classes, input, label, meta: { touched, invalid, error }, ...custom}) => {
    // console.log(input);
    return (
        <TextField
            variant="outlined"
            label={label}
            className={classes.root}
            placeholder={label}
            error={touched && invalid}
            helperText={touched && error}
            InputProps={{
                endAdornment: (!touched || invalid) ? null:(
                    <InputAdornment position="end">
                        <CheckIcon className={classes.check} />
                    </InputAdornment>
                )
            }}
            fullWidth
            {...input}
            {...custom}
        />
    );
}
export const renderTextField = withStyles(theme => ({
    root: {
        display: 'block',
        marginBottom: 15
    },
    check: {
        color: theme.palette.success.main
    }
}))(Text);

// FILE
const File = ({ classes, input, label, meta: { touched, invalid, error }, ...custom}) => {
    const handleChange = (e) => {
        const { onChange } = input;
        onChange(e.target.files[0])
    };
    return (
        <div className={classes.root}>
            <input
                className={classes.input}
                id="contained-button-file"
                type="file"
                onChange={handleChange}
            />
            <label htmlFor="contained-button-file">
                <Button
                    variant="outlined"
                    size="large"
                    component="span"
                    disableElevation
                    fullWidth
                    endIcon={(invalid || !input.value) ? null:<span><CheckIcon className={classes.check} /></span>}
                    classes={{
                        label: classes.label,
                        root: classes.buttonRoot,
                        endIcon: classes.endIcon
                    }}
                    {...custom}>
                    <span>{label}{input.value ? <span className={classes.fileInfo}> ({input.value.name}, {formatBytes(input.value.size)})</span>:""}</span>
                </Button>
                {touched && <FormHelperText error variant="outlined">{error}</FormHelperText>}
            </label>
        </div>
    );
}
export const renderFileField = withStyles(theme => ({
    root: {
        display: 'block'
    },
    input: {
        display: 'none'
    },
    buttonRoot: {
        padding: '18.5px 14px',
        letterSpacing: 'normal',
        lineHeight: '1'
    },
    label: {
        justifyContent: 'space-between',
        textTransform: 'capitalize',
        color: theme.palette.text.secondary,
        fontSize: 16,
        fontWeight: '400'
    },
    fileInfo: {
        textTransform: 'none'
    },
    check: {
        color: theme.palette.success.main,
        fontSize: '1.5rem',
    },
    endIcon: {
        lineHeight: '1',
        marginTop: '-0.3rem',
        marginBottom: '-0.3rem',
    }
}))(File);


// BUTTONS
const SubmitButtonComponent = ({ classes, label, disabled, pristine, submitting, color, size, ...custom}) => {
    // console.log(input);
    return (
        <Button
            variant="contained"
            color={color || 'primary'}
            size={size || 'large'}
            type="submit"
            disabled={disabled || pristine || submitting}
            className={classes.root}
            {...custom}
            >
            {label}
        </Button>
    );
}
export const SubmitButton = withStyles({
    root: {
        marginTop: 30,
        color: '#ffffff'
    }
})(SubmitButtonComponent);