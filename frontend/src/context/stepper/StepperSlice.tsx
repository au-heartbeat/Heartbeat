import { STEP_NUMBER } from '@src/constants/commons';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@src/store';

interface LoadingStatus {
  isLoading: boolean;
  isLoaded: boolean;
  isLoadedWithError: boolean;
}

export interface IMetricsPageLoadingStatus {
  boardInfo?: LoadingStatus;
  pipelineInfo?: LoadingStatus;
  pipelineStep?: LoadingStatus;
}

export interface IReportPageLoadingStatus {
  gainPollingUrl?: LoadingStatus;
  polling?: LoadingStatus;
  boardMetrics?: LoadingStatus;
  pipelineMetrics?: LoadingStatus;
  sourceControlMetrics?: LoadingStatus;
}

export interface IPageLoadingStatusPayload<T> {
  startDate: string;
  loadingStatus: T;
}

export interface StepState {
  stepNumber: number;
  timeStamp: number;
  shouldMetricsLoaded: boolean;
  metricsPageTimeRangeLoadingStatus: Record<string, IMetricsPageLoadingStatus>;
  reportPageTimeRangeLoadingStatus: Record<string, IReportPageLoadingStatus>;
  reportId?: number;
}

const initialState: StepState = {
  stepNumber: STEP_NUMBER.CONFIG_PAGE,
  timeStamp: 0,
  shouldMetricsLoaded: true,
  metricsPageTimeRangeLoadingStatus: {},
  reportPageTimeRangeLoadingStatus: {},
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
      if (state.shouldMetricsLoaded && state.stepNumber === STEP_NUMBER.CONFIG_PAGE) {
        state.metricsPageTimeRangeLoadingStatus = {};
      }
      if (state.stepNumber === STEP_NUMBER.METRICS_PAGE) {
        state.reportPageTimeRangeLoadingStatus = {};
      }
      state.shouldMetricsLoaded = true;
      state.stepNumber += 1;
    },
    backStep: (state) => {
      state.shouldMetricsLoaded = false;
      state.stepNumber = state.stepNumber === STEP_NUMBER.CONFIG_PAGE ? STEP_NUMBER.CONFIG_PAGE : state.stepNumber - 1;
    },
    updateShouldMetricsLoaded: (state, action) => {
      state.shouldMetricsLoaded = action.payload;
    },
    updateTimeStamp: (state, action) => {
      state.timeStamp = action.payload;
    },
    updateReportId: (state, action) => {
      state.reportId = action.payload;
    },
    updateMetricsPageLoadingStatus: (state, action) => {
      const loadingStatusList: IPageLoadingStatusPayload<IMetricsPageLoadingStatus>[] = action.payload;

      loadingStatusList.forEach((singleTimeRangeInfo) => updateInfo(singleTimeRangeInfo));

      function updateInfo(loadingInfo: IPageLoadingStatusPayload<IMetricsPageLoadingStatus>) {
        const { startDate, loadingStatus } = loadingInfo;
        state.metricsPageTimeRangeLoadingStatus[startDate] = {
          ...state.metricsPageTimeRangeLoadingStatus[startDate],
          ...loadingStatus,
        };
      }
    },

    updateReportPageLoadingStatus: (state, action) => {
      const loadingStatusList: IPageLoadingStatusPayload<IReportPageLoadingStatus>[] = action.payload;

      loadingStatusList.forEach((singleTimeRangeInfo) => updateInfo(singleTimeRangeInfo));

      function updateInfo(loadingInfo: IPageLoadingStatusPayload<IReportPageLoadingStatus>) {
        const { startDate, loadingStatus } = loadingInfo;
        state.reportPageTimeRangeLoadingStatus[startDate] = {
          ...state.reportPageTimeRangeLoadingStatus[startDate],
          ...loadingStatus,
        };
      }
    },
  },
});

export const {
  resetStep,
  nextStep,
  backStep,
  updateShouldMetricsLoaded,
  updateTimeStamp,
  updateReportId,
  updateMetricsPageLoadingStatus,
  updateReportPageLoadingStatus,
} = stepperSlice.actions;

export const selectStepNumber = (state: RootState) => state.stepper.stepNumber;
export const selectTimeStamp = (state: RootState) => state.stepper.timeStamp;
export const selectReportId = (state: RootState) => state.stepper.reportId;
export const shouldMetricsLoaded = (state: RootState) => state.stepper.shouldMetricsLoaded;
export const selectMetricsPageFailedTimeRangeInfos = (state: RootState) =>
  state.stepper.metricsPageTimeRangeLoadingStatus;

export const selectReportPageFailedTimeRangeInfos = (state: RootState) =>
  state.stepper.reportPageTimeRangeLoadingStatus;

export default stepperSlice.reducer;
