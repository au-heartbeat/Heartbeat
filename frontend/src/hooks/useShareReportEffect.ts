import { IReportError, IReportInfo, assembleReportData, getErrorKey, initReportInfo } from './useGenerateReportEffect';
import { FULFILLED, DATA_LOADING_FAILED, DATE_RANGE_FORMAT } from '../constants/resources';
import { ReportResponseDTO } from '../clients/report/dto/response';
import { reportClient } from '../clients/report/ReportClient';
import { DateRangeList } from '../context/config/configSlice';
import { MetricTypes } from '../constants/commons';
import { useParams } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';

export const useShareReportEffect = () => {
  const { reportId } = useParams();
  const [dateRanges, setDateRanges] = useState<DateRangeList>([]);
  const [reportInfos, setReportInfos] = useState<IReportInfo[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);

  const getData = async () => {
    console.log('getData');
    const reportURLsRes = await reportClient.getReportUrlAndMetrics(reportId!);
    const dateRanges = extractDateRanges(reportURLsRes.data.reportURLs);

    const reportRes = await Promise.allSettled(
      reportURLsRes.data.reportURLs.map((reportUrl: string) => reportClient.getReportDetail(reportUrl)),
    );

    const reportInfos = generateReportInfos(dateRanges, reportRes);
    console.log(dateRanges, reportInfos);

    setMetrics(reportURLsRes.data.metrics);
    setDateRanges(dateRanges);
    setReportInfos(reportInfos);
  };

  const extractDateRanges = (reportURLs: string[]) => {
    return reportURLs.map((link) => {
      const searchString = link.split('/detail')[1];
      const searchParams = new URLSearchParams(searchString);
      return {
        startDate: dayjs(searchParams.get('startTime')!, 'YYYYMMDD').startOf('day').format(DATE_RANGE_FORMAT),
        endDate: dayjs(searchParams.get('endTime')!, 'YYYYMMDD').endOf('day').format(DATE_RANGE_FORMAT),
      };
    });
  };

  const generateReportInfos = (
    dateRanges: DateRangeList,
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
    getData,
  };
};
