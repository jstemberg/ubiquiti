// import "@testing-library/react/dont-cleanup-after-each";
import '@testing-library/jest-dom/extend-expect';
import { render, screen, cleanup, waitFor, fireEvent  } from '@testing-library/react';
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
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => {
    // cleanup();
    server.close()
});

settings.autoUpdates = false;

describe('Page rendering', () => {
    test('Rendering of form', () => {
        render(<AppWrapper />);
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
        expect(screen.getByText(/select file/i, { selector:'label *' })).toBeInTheDocument();
        expect(screen.getByText(/submit/i, { selector:'button span' })).toBeInTheDocument();
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
});