import { act, render, screen, waitFor, within } from '@testing-library/react';
import { updateAdvancedSettings } from '@src/context/Metrics/metricsSlice';
import { Advance } from '@src/containers/MetricsStep/Advance/Advance';
import { ADVANCED_SETTINGS_TITLE } from '../../fixtures';
import { setupStore } from '../../utils/setupStoreUtil';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import React from 'react';

const mockedUseAppDispatch = jest.fn();
jest.mock('@src/hooks/useAppDispatch', () => ({
  useAppDispatch: () => mockedUseAppDispatch,
}));

let store = null;

describe('Advance', () => {
  store = setupStore();
  const setup = () => {
    store = setupStore();
    render(
      <Provider store={store}>
        <Advance />
      </Provider>,
    );
  };
  afterEach(() => {
    store = null;
  });

  it('should show Advanced setting title when render Advance component', () => {
    setup();
    expect(screen.getByText(ADVANCED_SETTINGS_TITLE)).toBeInTheDocument();
  });

  it('should show Advanced setting input when click check box', async () => {
    setup();
    await act(async () => {
      await userEvent.click(screen.getByRole('checkbox'));
    });

    await waitFor(() => {
      expect(mockedUseAppDispatch).toHaveBeenCalledWith(updateAdvancedSettings({ storyPoint: '', flag: '' }));
    });
  });

  it('should input Advanced setting value after click check box', async () => {
    setup();

    await act(async () => {
      await userEvent.click(screen.getByRole('checkbox'));
      const storyPointInput = within(screen.getByTestId('Story Point')).getByLabelText(
        'input Story Point',
      ) as HTMLInputElement;
      const flagInput = within(screen.getByTestId('Flag')).getByLabelText('input Flag') as HTMLInputElement;
      await userEvent.type(storyPointInput, '123');
      await userEvent.type(flagInput, '456');
    });

    await waitFor(() => {
      expect(mockedUseAppDispatch).toHaveBeenCalledWith(updateAdvancedSettings({ flag: '456', storyPoint: '123' }));
    });
  });
});
