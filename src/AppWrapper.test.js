// import "@testing-library/react/dont-cleanup-after-each";
import '@testing-library/jest-dom/extend-expect';
import { render, screen, cleanup, waitFor, fireEvent  } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import AppWrapper from './AppWrapper';
import * as settings from './settings';

const server = setupServer(
    rest.get('/data-correct', (req, res, ctx) => {
        return res(ctx.json([{ name: 'Kubula', height: 46, file: 'soubor.jpg' }]))
    }),
    rest.get('/data-incorrect', (req, res, ctx) => {
        return res(ctx.json([{ naaame: 'Kubula', height: 46, file: 'soubor.jpg' }]))
    }),
    rest.get('/data-empty', (req, res, ctx) => {
        return res(ctx.json([]))
    }),
    rest.post('/submit-correct', (req, res, ctx) => {
        return res(ctx.json({ uploadId: "2f58f7b5-3a04-4783-94ba-db34315823d7" }));
    }),
    rest.post('/submit-network-error', (req, res, ctx) => {
        return res.networkError('Failed to connect');
    }),
    rest.post('/submit-invalid-payload', (req, res, ctx) => {
        return res(
            ctx.status(301),
            ctx.json({statusCode: 400, error: "Bad Request", message: "Invalid request payload input"} )
        );
    }),
    rest.post('/upload-correct/:fileId', (req, res, ctx) => {
        return res(ctx.json({ result: true }))
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

settings.autoUpdates = false;

describe('Page rendering', () => {
    test('Rendering of form', () => {
        render(<AppWrapper />);
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/select file/i)).toBeInTheDocument();
        expect(screen.getByText(/submit/i)).toBeInTheDocument();
    });
    test('Rendering of data table', () => {
        render(<AppWrapper />);
        expect(screen.getByText(/name/i, { selector:'thead tr th' })).toBeInTheDocument();
        expect(screen.getByText(/height/i, { selector:'thead tr th' })).toBeInTheDocument();
        expect(screen.getByText(/file/i, { selector:'thead tr th' })).toBeInTheDocument();
    });
});
describe('Downloading data', () => {
    test('Download and display correct data', async () => {
        settings.endpointData = '/data-correct';
        render(<AppWrapper />);
        fireEvent(document, new Event('downloadData'));
        await waitFor(() => screen.getAllByText('Kubula', { selector:'tbody tr th' }));
        expect(screen.getAllByText('Kubula', { selector:'tbody tr th' })[0]).toBeInTheDocument();
    });
    test('Download incorrect data and display warning', async () => {
        settings.endpointData = '/data-incorrect';
        render(<AppWrapper />);
        fireEvent(document, new Event('downloadData'));
        await waitFor(() => screen.getByText('Error while downloading data', { selector: 'div' }));
        expect(screen.getByText('Error while downloading data', { selector: 'div' })).toBeInTheDocument();
    });
    test('Download empty array and display info text (no data on server)', async () => {
        settings.endpointData = '/data-empty';
        render(<AppWrapper />);
        fireEvent(document, new Event('downloadData'));
        await waitFor(() => screen.getByText('No data available'));
        expect(screen.getByText('No data available')).toBeInTheDocument();
    });
    test('Network error while downloading', async () => {
        jest.spyOn(console, 'error').mockImplementationOnce(() => {});
        settings.endpointData = '/data-network-error';
        render(<AppWrapper />);
        fireEvent(document, new Event('downloadData'));
        await waitFor(() => screen.getByText('Data could not be loaded, check your internet connection and try it again.'));
        expect(screen.getByText('Data could not be loaded, check your internet connection and try it again.')).toBeInTheDocument();
    });
    test('Download and display correct data from production API', async () => {
        settings.endpointData = 'http://file-upload.ubncloud.com/data';
        render(<AppWrapper />);
        fireEvent(document, new Event('downloadData'));
        await waitFor(() => document.querySelectorAll('table tbody tr'), { timeout: 3000 });
        expect(document.querySelectorAll('table tbody tr')[0]).toBeInTheDocument();
    });
});

const fillForm = () => {
    // https://testing-library.com/docs/ecosystem-user-event/#typeelement-text-options
    userEvent.type(screen.getByLabelText(/name/i), 'Peter');
    expect(screen.getByLabelText(/name/i)).toHaveValue('Peter');

    userEvent.type(screen.getByLabelText(/height/i), '157');
    expect(screen.getByLabelText(/height/i)).toHaveValue(157);
    
    userEvent.upload(screen.getByLabelText(/select file/i), new File(['avatar'], 'avatar.png', { type: 'image/png' }));
    expect(screen.getByLabelText(/select file/i).files).toHaveLength(1);
}

describe('Form', () => {
    test('Validation required fileds (submit empty form)', async () => {
        settings.formValidationEnabled = true;
        render(<AppWrapper />);
        
        userEvent.click(screen.getByText(/submit/i));

        await waitFor(() => screen.getByText('Name is required'));
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Height is required')).toBeInTheDocument();
        expect(screen.getByText('File is required')).toBeInTheDocument();
    });
});

describe('Form', () => {
    test('Successfull form submit ', async () => {
        settings.appendDataImmediately = true;
        settings.endpointSubmit = '/submit-correct';
        settings.endpointUpload = '/upload-correct';
        render(<AppWrapper />);
        
        fillForm();
        userEvent.click(screen.getByText(/submit/i));

        await waitFor(() => screen.getByText('Form was submitted'));
        expect(screen.getByText('Form was submitted')).toBeInTheDocument();

        await waitFor(() => screen.getByText('Peter'));
        expect(screen.getByText('Peter', { selector:'tbody tr th' })).toBeInTheDocument();
    });
});

describe('Form', () => {
    test('Network error while submitting ', async () => {
        settings.endpointSubmit = '/submit-network-error';
        settings.endpointUpload = '/upload-correct';
        render(<AppWrapper />);
        
        fillForm();
        userEvent.click(screen.getByText(/submit/i));

        await waitFor(() => screen.getByText('Application is probably offline, check your internet connection and try it again.'));
        expect(screen.getByText('Application is probably offline, check your internet connection and try it again.')).toBeInTheDocument();
    });
});

describe('Form', () => {
    test('Invalid payload to server', async () => {
        settings.formValidationEnabled = false;
        settings.endpointSubmit = '/submit-invalid-payload';
        settings.endpointUpload = '/upload-correct';
        render(<AppWrapper />);
        
        fillForm();
        userEvent.click(screen.getByText(/submit/i));

        await waitFor(() => screen.getByText('Error while submitting form'));
        expect(screen.getByText('Error while submitting form')).toBeInTheDocument();
    });
});