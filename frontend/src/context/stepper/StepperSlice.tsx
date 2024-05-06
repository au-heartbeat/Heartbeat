import { createSlice } from '@reduxjs/toolkit';
import { ZERO } from '@src/constants/commons';
import type { RootState } from '@src/store';

export interface StepState {
  stepNumber: number;
  timeStamp: number;
  shouldMetricsLoad: boolean;
  failedMetricsBoardTimeRange: string[];
  failedMetricsPipelineTimeRange: string[];
}

const initialState: StepState = {
  stepNumber: 0,
  timeStamp: 0,
  shouldMetricsLoad: true,
  failedMetricsBoardTimeRange: [],
  failedMetricsPipelineTimeRange: [],
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
      state.shouldMetricsLoad = true;
      state.stepNumber += 1;
    },
    backStep: (state) => {
      state.shouldMetricsLoad = false;
      state.stepNumber = state.stepNumber === ZERO ? ZERO : state.stepNumber - 1;
    },
    updateTimeStamp: (state, action) => {
      state.timeStamp = action.payload;
    },
    updateFailedMetricsBoardTimeRange: (state, action) => {
      state.failedMetricsBoardTimeRange = action.payload;
    },
    updateFailedMetricsPipelineTimeRange: (state, action) => {
      state.failedMetricsPipelineTimeRange = action.payload;
    },
  },
});

export const {
  resetStep,
  nextStep,
  backStep,
  updateTimeStamp,
  updateFailedMetricsBoardTimeRange,
  updateFailedMetricsPipelineTimeRange,
} = stepperSlice.actions;

export const selectStepNumber = (state: RootState) => state.stepper.stepNumber;
export const selectTimeStamp = (state: RootState) => state.stepper.timeStamp;
export const shouldMetricsLoad = (state: RootState) => state.stepper.shouldMetricsLoad;
export const selectFailedMetricsBoardTimeRange = (state: RootState) => state.stepper.failedMetricsBoardTimeRange;
export const selectFailedMetricsPipelineTimeRange = (state: RootState) => state.stepper.failedMetricsPipelineTimeRange;

export default stepperSlice.reducer;
