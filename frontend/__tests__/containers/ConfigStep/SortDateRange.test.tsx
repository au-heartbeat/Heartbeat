import { SortType } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { SortDateRange } from '@src/containers/ConfigStep/DateRangePicker/SortDateRange';
import { updateDateRangeSortStatus } from '@src/context/config/configSlice';
import { setupStore } from '@test/utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import React from 'react';

let store = setupStore();
const setup = () => {
  store = setupStore();
  return render(
    <Provider store={store}>
      <SortDateRange onChange={() => {}} sortStatus={SortType.DEFAULT} />
    </Provider>,
  );
};
jest.mock('@src/context/config/configSlice', () => ({
  ...jest.requireActual('@src/context/config/configSlice'),
  updateDateRangeSortStatus: jest.fn().mockReturnValue({ type: 'SHOULD_UPDATE_SORT_STATUS' }),
}));

describe('SortDateRange', () => {
  it('should toggle sort order when SortButton is clicked', () => {
    setup();
    const sortButtonContainer = screen.getByLabelText('Time range sort');
    expect(sortButtonContainer).toBeInTheDocument();

    const sortTextButton = screen.getByText('Default sort');
    expect(sortTextButton).toBeInTheDocument();

    const sortButton = screen.getByLabelText('sort button');
    expect(sortButton).toBeInTheDocument();
  });

  it('should toggle sort order when SortButton is clicked', async () => {
    setup();
    const sortButtonContainer = screen.getByLabelText('Time range sort');
    expect(sortButtonContainer).toBeInTheDocument();

    const sortTextButton = screen.getByText('Default sort');

    expect(sortTextButton).toBeInTheDocument();

    const sortButton = screen.getByLabelText('sort button');
    await userEvent.click(sortButton);

    expect(updateDateRangeSortStatus).toHaveBeenCalledTimes(1);
    expect(updateDateRangeSortStatus).toHaveBeenCalledWith(SortType.DESCENDING);
  });

  it('should render right icon with sort status', async () => {
    setup();
    const sortButton = screen.getByLabelText('sort button');
    await userEvent.click(sortButton);
    const arrowDropDown = screen.getByRole('button', { name: 'Descending' });
    expect(arrowDropDown).toBeInTheDocument();
    await userEvent.click(sortButton);
    const arrowDropUp = screen.getByRole('button', { name: 'Ascending' });
    expect(arrowDropUp).toBeInTheDocument();
  });
});
