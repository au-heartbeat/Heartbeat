import { DateRangeList } from '../context/config/configSlice';
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
