import { IMetricsPageLoadingStatus, IReportPageLoadingStatus } from '../context/stepper/StepperSlice';
import { DateRange, DateRangeList } from '../context/config/configSlice';
import { formatDateToTimestampString } from './util';

export const getReportPageLoadingStatusWhenGainPollingUrls = (dateRangeList: DateRangeList) => {
  const notLoadingStatus = {
    isLoading: false,
    isLoaded: false,
    isLoadedWithError: false,
  };
  const pageLoadingStatus = dateRangeList.map(({ startDate }) => ({
    startDate: formatDateToTimestampString(startDate!),
    loadingStatus: {
      gainPollingUrl: { isLoading: true, isLoaded: false, isLoadedWithError: false },
      polling: { ...notLoadingStatus },
      boardMetrics: { ...notLoadingStatus },
      pipelineMetrics: { ...notLoadingStatus },
      sourceControlMetrics: { ...notLoadingStatus },
    },
  }));

  return pageLoadingStatus;
};

export const getReportPageLoadingStatusWhenPolling = (dates: string[]) => {
  const loadingStatus = {
    isLoading: true,
    isLoaded: false,
    isLoadedWithError: false,
  };
  const pageLoadingStatus = dates.map((date) => ({
    startDate: formatDateToTimestampString(date),
    loadingStatus: {
      polling: { ...loadingStatus },
      boardMetrics: { ...loadingStatus },
      pipelineMetrics: { ...loadingStatus },
      sourceControlMetrics: { ...loadingStatus },
    },
  }));
  return pageLoadingStatus;
};

export const getDateRangeLoadingStatus = (
  startDate: string,
  pageLoadingStatus: Record<string, IMetricsPageLoadingStatus> | Record<string, IReportPageLoadingStatus>,
) => {
  const errorInfo: IMetricsPageLoadingStatus | IReportPageLoadingStatus = pageLoadingStatus[startDate] || {};

  return {
    isLoading: Object.values(errorInfo).some(({ isLoading }) => isLoading),
    isFailed: Object.values(errorInfo).some(({ isLoaded, isLoadedWithError }) => isLoaded && isLoadedWithError),
  };
};

export const getTotalDateRangeLoadingStatus = (
  dateRangeList: DateRange[],
  pageLoadingStatus: Record<string, IMetricsPageLoadingStatus> | Record<string, IReportPageLoadingStatus>,
) => {
  return dateRangeList.reduce(
    (pre, cur) => {
      const currentStatus = getDateRangeLoadingStatus(formatDateToTimestampString(cur.startDate!), pageLoadingStatus);
      return {
        isLoading: pre.isLoading || currentStatus.isLoading,
        isFailed: pre.isFailed || currentStatus.isFailed,
      };
    },
    { isLoading: false, isFailed: false },
  );
};
