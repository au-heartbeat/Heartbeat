import { selectReportPageFailedTimeRangeInfos, updateReportPageLoadingStatus } from '@src/context/stepper/StepperSlice';
import { IReportError, IReportInfo, assembleReportData, getErrorKey, initReportInfo } from './useGenerateReportEffect';
import { getReportPageLoadingStatusWhenPolling, getTotalDateRangeLoadingStatus } from '../utils/report';
import { FULFILLED, DATA_LOADING_FAILED, DATE_RANGE_FORMAT } from '../constants/resources';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { ReportResponseDTO } from '../clients/report/dto/response';
import { reportClient } from '../clients/report/ReportClient';
import { formatDateToTimestampString } from '../utils/util';
import { DateRange } from '../context/config/configSlice';
import { NotFoundError } from '../errors/NotFoundError';
import { MetricTypes } from '../constants/commons';
import { useParams } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';

export const useShareReportEffect = () => {
  const { reportId } = useParams();
  const dispatch = useAppDispatch();
  const [dateRanges, setDateRanges] = useState<DateRange[]>([]);
  const [reportInfos, setReportInfos] = useState<IReportInfo[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [classificationNames, setClassificationNames] = useState<string[]>([]);
  const [allPipelines, setAllPipelines] = useState<string[]>([]);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const reportPageTimeRangeLoadingStatus = useAppSelector(selectReportPageFailedTimeRangeInfos);
  const allDateRangeLoadingFinished = !getTotalDateRangeLoadingStatus(dateRanges, reportPageTimeRangeLoadingStatus)
    .isLoading;

  const getData = async () => {
    try {
      const reportURLsRes = await reportClient.getReportUrlAndMetrics(reportId!);
      const dateRanges = extractDateRanges(reportURLsRes.data.reportURLs);

      resetReportPageLoadingStatusBeforeGetReports(dateRanges);
      const reportRes = await Promise.allSettled(
        reportURLsRes.data.reportURLs.map((reportUrl: string) => reportClient.getReportDetail(reportUrl)),
      );

      const reportInfos = generateReportInfos(dateRanges, reportRes);
      updateReportPageLoadingStatusInfoAfterGetReports(dateRanges, reportRes);

      setMetrics(reportURLsRes.data.metrics);
      setAllPipelines(reportURLsRes.data.pipelines);
      setClassificationNames(reportURLsRes.data.classificationNames);
      setDateRanges(dateRanges);
      setReportInfos(reportInfos);
    } catch (e) {
      const err = e as Error;
      if (err instanceof NotFoundError) {
        setIsExpired(true);
      }
    }
  };

  const resetReportPageLoadingStatusBeforeGetReports = (dateRanges: DateRange[]) => {
    dispatch(
      updateReportPageLoadingStatus(getReportPageLoadingStatusWhenPolling(dateRanges.map((date) => date.startDate!))),
    );
  };

  const updateReportPageLoadingStatusInfoAfterGetReports = (
    dateRanges: DateRange[],
    reportRes: PromiseSettledResult<AxiosResponse<ReportResponseDTO, unknown>>[],
  ) => {
    const pageLoadingStatus = reportRes.map((res, index) => {
      const isSuccess = res.status === FULFILLED;
      const loadingStatus = {
        isLoading: false,
        isLoaded: true,
        isLoadedWithError: !isSuccess,
      };
      return {
        startDate: formatDateToTimestampString(dateRanges[index].startDate!),
        loadingStatus: {
          polling: { ...loadingStatus },
          boardMetrics: { ...loadingStatus },
          pipelineMetrics: { ...loadingStatus },
          sourceControlMetrics: { ...loadingStatus },
        },
      };
    });
    dispatch(updateReportPageLoadingStatus(pageLoadingStatus));
  };

  const extractDateRanges = (reportURLs: string[]) => {
    return reportURLs.map((link) => {
      const searchString = link.split('/detail')[1];
      const searchParams = new URLSearchParams(searchString);
      return {
        startDate: dayjs(searchParams.get('startTime'), 'YYYYMMDD').startOf('day').format(DATE_RANGE_FORMAT),
        endDate: dayjs(searchParams.get('endTime'), 'YYYYMMDD').endOf('day').format(DATE_RANGE_FORMAT),
      };
    });
  };

  const generateReportInfos = (
    dateRanges: DateRange[],
    reportRes: PromiseSettledResult<AxiosResponse<ReportResponseDTO, unknown>>[],
  ) => {
    return reportRes.map((res, index) => {
      const reportInfo = initReportInfo();
      reportInfo.id = dateRanges[index].startDate!;

      if (res.status === FULFILLED) {
        const { data } = res.value;
        reportInfo.reportData = assembleReportData(data);
        reportInfo.shouldShowBoardMetricsError = true;
        reportInfo.shouldShowPipelineMetricsError = true;
        reportInfo.shouldShowSourceControlMetricsError = true;
      } else {
        const errorKey = getErrorKey(res.reason, MetricTypes.All) as keyof IReportError;
        reportInfo[errorKey] = { message: DATA_LOADING_FAILED, shouldShow: true };
      }
      return reportInfo;
    });
  };

  return {
    dateRanges,
    reportInfos,
    metrics,
    classificationNames,
    isExpired,
    getData,
    allPipelines,
    allDateRangeLoadingFinished,
  };
};
