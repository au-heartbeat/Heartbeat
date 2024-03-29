import {
  initDeploymentFrequencySettings,
  saveUsers,
  updateShouldGetBoardConfig,
  updateShouldGetPipelineConfig,
} from '@src/context/Metrics/metricsSlice';
import { DateRangePickerSection } from '@src/containers/ConfigStep/DateRangePicker';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ERROR_DATE, TIME_RANGE_ERROR_MESSAGE } from '../../fixtures';
import { setupStore } from '../../utils/setupStoreUtil';
import { Provider } from 'react-redux';
import React from 'react';
import dayjs from 'dayjs';

const START_DATE_LABEL = 'From *';
const END_DATE_LABEL = 'To *';
const TODAY = dayjs('2024-03-20');
const INPUT_DATE_VALUE = TODAY.format('MM/DD/YYYY');
let store = setupStore();

jest.mock('@src/context/Metrics/metricsSlice', () => ({
  ...jest.requireActual('@src/context/Metrics/metricsSlice'),
  updateShouldGetBoardConfig: jest.fn().mockReturnValue({ type: 'SHOULD_UPDATE_BOARD_CONFIG' }),
  updateShouldGetPipelineConfig: jest.fn().mockReturnValue({ type: 'SHOULD_UPDATE_PIPELINE_CONFIG' }),
  initDeploymentFrequencySettings: jest.fn().mockReturnValue({ type: 'INIT_DEPLOYMENT_SETTINGS' }),
  saveUsers: jest.fn().mockReturnValue({ type: 'SAVE_USERS' }),
}));

const setup = () => {
  store = setupStore();
  return render(
    <Provider store={store}>
      <DateRangePickerSection />
    </Provider>,
  );
};

describe('DateRangePickerSection', () => {
  describe('Single range behaviors', () => {
    const expectDate = (inputDate: HTMLInputElement) => {
      expect(inputDate.value).toEqual(expect.stringContaining(TODAY.date().toString()));
      expect(inputDate.value).toEqual(expect.stringContaining((TODAY.month() + 1).toString()));
      expect(inputDate.value).toEqual(expect.stringContaining(TODAY.year().toString()));
    };

    it('should render DateRangePicker', () => {
      setup();

      expect(screen.queryAllByText(START_DATE_LABEL)).toHaveLength(1);
      expect(screen.queryAllByText(END_DATE_LABEL)).toHaveLength(1);
    });

    it('should show right start date when input a valid date given init start date is null ', () => {
      setup();
      const startDateInput = screen.getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      fireEvent.change(startDateInput, { target: { value: INPUT_DATE_VALUE } });

      expectDate(startDateInput);
    });

    it('should show right end date when input a valid date given init end date is null ', () => {
      setup();
      const endDateInput = screen.getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;

      fireEvent.change(endDateInput, { target: { value: INPUT_DATE_VALUE } });
      expectDate(endDateInput);
    });

    it('should Auto-fill endDate which is after startDate 13 days when fill right startDate ', () => {
      setup();
      const endDate = TODAY.add(13, 'day');
      const startDateInput = screen.getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      const endDateInput = screen.getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;

      fireEvent.change(startDateInput, { target: { value: INPUT_DATE_VALUE } });

      expect(endDateInput.value).toEqual(expect.stringContaining(endDate.date().toString()));
      expect(endDateInput.value).toEqual(expect.stringContaining((endDate.month() + 1).toString()));
      expect(endDateInput.value).toEqual(expect.stringContaining(endDate.year().toString()));
    });

    it('should not Auto-fill endDate which is after startDate 14 days when fill wrong format startDate ', () => {
      setup();
      const startDateInput = screen.getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      const endDateInput = screen.getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;

      fireEvent.change(startDateInput, { target: { value: ERROR_DATE } });

      expect(startDateInput.valueAsDate).toEqual(null);
      expect(endDateInput.valueAsDate).toEqual(null);
    });

    it('should dispatch update configuration when change startDate', () => {
      setup();
      const startDateInput = screen.getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      fireEvent.change(startDateInput, { target: { value: INPUT_DATE_VALUE } });
      expect(updateShouldGetBoardConfig).toHaveBeenCalledWith(true);
      expect(updateShouldGetPipelineConfig).toHaveBeenCalledWith(true);
      expect(initDeploymentFrequencySettings).toHaveBeenCalled();
      expect(saveUsers).toHaveBeenCalledWith([]);
    });

    it('should dispatch update configuration when change endDate', () => {
      setup();
      const endDateInput = screen.getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;
      fireEvent.change(endDateInput, { target: { value: INPUT_DATE_VALUE } });
      expect(updateShouldGetBoardConfig).toHaveBeenCalledWith(true);
      expect(updateShouldGetPipelineConfig).toHaveBeenCalledWith(true);
      expect(initDeploymentFrequencySettings).toHaveBeenCalled();
      expect(saveUsers).toHaveBeenCalledWith([]);
    });
  });

  describe('Multiple range amount behaviors', () => {
    it('should not show remove button when there is only one range by default', () => {
      setup();
      const removeButton = screen.queryByRole('button', { name: 'Remove' });
      const ranges = screen.getAllByLabelText('Range picker row');

      expect(removeButton).not.toBeInTheDocument();
      expect(ranges).toHaveLength(1);
    });

    it('should allow user to add up to 6 ranges', () => {
      setup();
      const addButton = screen.getByLabelText('Button for adding date range');
      const defaultRanges = screen.getAllByLabelText('Range picker row');

      expect(defaultRanges).toHaveLength(1);

      new Array(5).fill(true).forEach(() => fireEvent.click(addButton));
      const ranges = screen.getAllByLabelText('Range picker row');

      expect(ranges).toHaveLength(6);
      expect(addButton).toBeDisabled();
    });

    it('should show remove button when ranges are more than 1 and user is able to remove the range itself by remove button within that row', () => {
      setup();
      const addButton = screen.getByLabelText('Button for adding date range');
      fireEvent.click(addButton);

      const ranges = screen.getAllByLabelText('Range picker row');
      expect(ranges).toHaveLength(2);
      ranges.forEach((range) => {
        const removeButtonForThisRange = within(range).queryByRole('button', { name: 'Remove' });
        expect(removeButtonForThisRange).toBeVisible();
      });

      const firstRemoveButton = within(ranges[0]).queryByRole('button', { name: 'Remove' }) as HTMLButtonElement;
      fireEvent.click(firstRemoveButton);

      const currentRanges = screen.getAllByLabelText('Range picker row');
      expect(currentRanges).toHaveLength(1);
    });
  });

  describe('Multiple ranges date interactions', () => {
    it('should disable the unselected dates between 2 selected date ranges', () => {
      setup();
      const addButton = screen.getByLabelText('Button for adding date range');
      fireEvent.click(addButton);
      const rangeDate1 = ['03/01/2024', '03/10/2024'];
      const rangeDate2 = ['03/12/2024', '03/25/2024'];

      const ranges = screen.getAllByLabelText('Range picker row');
      const startDate1Input = within(ranges[0]).getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      const endDate1Input = within(ranges[0]).getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;
      const startDate2Input = within(ranges[1]).getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      const endDate12nput = within(ranges[1]).getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;
      fireEvent.change(startDate1Input, { target: { value: rangeDate1[0] } });
      fireEvent.change(endDate1Input, { target: { value: rangeDate1[1] } });
      fireEvent.change(startDate2Input, { target: { value: rangeDate2[0] } });
      fireEvent.change(endDate12nput, { target: { value: rangeDate2[1] } });
      fireEvent.click(addButton);
      const range3 = screen.getAllByLabelText('Range picker row')[2];
      const range3StartDateCalendarIcon = within(range3).getAllByTestId('CalendarTodayIcon')[0];
      fireEvent.click(range3StartDateCalendarIcon);
      const targetGappedDate = screen
        .getAllByRole('gridcell')
        .filter((gridcell) => gridcell.innerHTML === '11')[0] as HTMLButtonElement;

      expect(targetGappedDate).toBeDisabled();
    });

    it('should auto fill end date when change star date by cloeset earliest date of other ranges', () => {
      setup();
      const addButton = screen.getByLabelText('Button for adding date range');
      fireEvent.click(addButton);
      const rangeDate1 = ['03/12/2024', '03/25/2024'];
      const rangeDate2 = ['03/08/2024'];

      const ranges = screen.getAllByLabelText('Range picker row');
      const startDate1Input = within(ranges[0]).getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      const endDate1Input = within(ranges[0]).getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;
      fireEvent.change(startDate1Input, { target: { value: rangeDate1[0] } });
      fireEvent.change(endDate1Input, { target: { value: rangeDate1[1] } });
      fireEvent.click(addButton);
      const range2 = screen.getAllByLabelText('Range picker row')[1];
      const startDate2Input = within(range2).getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      fireEvent.change(startDate2Input, { target: { value: rangeDate2[0] } });
      const endDate2Input = within(range2).getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;

      expect(endDate2Input.value).toEqual('03/11/2024');
    });

    it('should display error message for start-date and end-date respectively when time ranges conflict', () => {
      setup();
      const addButton = screen.getByLabelText('Button for adding date range');
      const rangeDate1 = ['03/12/2024', '03/25/2024'];
      const rangeDate2 = ['03/08/2024', '03/26/2024'];
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      const ranges = screen.getAllByLabelText('Range picker row');
      const startDate1Input = within(ranges[0]).getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      const endDate1Input = within(ranges[0]).getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;
      const startDate2Input = within(ranges[1]).getByRole('textbox', { name: START_DATE_LABEL }) as HTMLInputElement;
      const endDate12nput = within(ranges[1]).getByRole('textbox', { name: END_DATE_LABEL }) as HTMLInputElement;
      fireEvent.change(startDate1Input, { target: { value: rangeDate1[0] } });
      fireEvent.change(endDate1Input, { target: { value: rangeDate1[1] } });
      fireEvent.change(startDate2Input, { target: { value: rangeDate2[0] } });
      fireEvent.change(endDate12nput, { target: { value: rangeDate2[1] } });

      expect(screen.getByText(TIME_RANGE_ERROR_MESSAGE.START_DATE_INVALID_TEXT)).toBeVisible();
      expect(screen.getByText(TIME_RANGE_ERROR_MESSAGE.END_DATE_INVALID_TEXT)).toBeVisible();
    });
  });
});
