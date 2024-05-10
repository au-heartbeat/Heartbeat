import { createSlice } from '@reduxjs/toolkit';
import { ZERO } from '@src/constants/commons';
import type { RootState } from '@src/store';

export interface StepState {
  stepNumber: number;
  timeStamp: number;
  shouldMetricsLoaded: boolean;
  metricsPageFailedTimeRangeList: string[];
}

const initialState: StepState = {
  stepNumber: 0,
  timeStamp: 0,
  shouldMetricsLoaded: true,
  metricsPageFailedTimeRangeList: [],
};

export const stepperSlice = createSlice({
  name: 'stepper',
  initialState,
  reducers: {
    resetStep: (state) => {
      state.stepNumber = initialState.stepNumber;
      state.timeStamp = initialState.timeStamp;
    },
    nextStep: (state) => {
      if (state.shouldMetricsLoaded && state.stepNumber === 0) {
        state.metricsPageFailedTimeRangeList = [];
      }
      state.shouldMetricsLoaded = true;
      state.stepNumber += 1;
    },
    backStep: (state) => {
      state.shouldMetricsLoaded = false;
      state.stepNumber = state.stepNumber === ZERO ? ZERO : state.stepNumber - 1;
    },
    updateShouldMetricsLoaded: (state, action) => {
      state.shouldMetricsLoaded = action.payload;
    },
    updateTimeStamp: (state, action) => {
      state.timeStamp = action.payload;
    },
    updateMetricsPageFailedTimeRange: (state, action) => {
      state.metricsPageFailedTimeRangeList = state.metricsPageFailedTimeRangeList.concat(action.payload);
    },
  },
});

export const {
  resetStep,
  nextStep,
  backStep,
  updateShouldMetricsLoaded,
  updateTimeStamp,
  updateMetricsPageFailedTimeRange,
} = stepperSlice.actions;

export const selectStepNumber = (state: RootState) => state.stepper.stepNumber;
export const selectTimeStamp = (state: RootState) => state.stepper.timeStamp;
export const shouldMetricsLoaded = (state: RootState) => state.stepper.shouldMetricsLoaded;
export const selectMetricsPageFailedTimeRange = (state: RootState) => state.stepper.metricsPageFailedTimeRangeList;

export default stepperSlice.reducer;
