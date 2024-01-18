import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect';
import { useAppSelector } from '@src/hooks';
import { isSelectBoardMetrics, isSelectDoraMetrics, selectConfig } from '@src/context/config/configSlice';
import { StyledCalendarWrapper, StyledErrorNotification } from '@src/containers/ReportStep/style';
import { useNotificationLayoutEffectInterface } from '@src/hooks/useNotificationLayoutEffect';
import { MESSAGE, REPORT_PAGE_TYPE, REQUIRED_DATA } from '@src/constants/resources';
import { backStep, selectTimeStamp } from '@src/context/stepper/StepperSlice';
import { ErrorNotification } from '@src/components/ErrorNotification';
import { ReportButtonGroup } from '@src/containers/ReportButtonGroup';
import DateRangeViewer from '@src/components/Common/DateRangeViewer';
import { ErrorResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import BoardMetrics from '@src/containers/ReportStep/BoardMetrics';
import DoraMetrics from '@src/containers/ReportStep/DoraMetrics';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { Nullable } from '@src/utils/types';
import { BoardDetail, DoraDetail } from './ReportDetail';
import { useNavigate } from 'react-router-dom';
import { ROUTE } from '@src/constants/router';

export interface ReportStepProps {
  notification: useNotificationLayoutEffectInterface;
  handleSave: () => void;
}

const ReportStep = ({ notification, handleSave }: ReportStepProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    isServerError,
    startToRequestBoardData,
    startToRequestDoraData,
    reportData,
    stopPollingReports,
    timeout4Board,
    timeout4Dora,
    timeout4Report,
  } = useGenerateReportEffect();

  const [exportValidityTimeMin, setExportValidityTimeMin] = useState<number | undefined | null>(undefined);
  const [pageType, setPageType] = useState<string>(REPORT_PAGE_TYPE.SUMMARY);
  const [isBackFromDetail, setIsBackFromDetail] = useState<boolean>(false);
  const [allMetricsCompleted, setAllMetricsCompleted] = useState<boolean>(false);
  const [boardMetricsError, setBoardMetricsError] = useState<Nullable<ErrorResponse>>(null);
  const [pipelineMetricsError, setPipelineMetricsError] = useState<Nullable<ErrorResponse>>(null);
  const [sourceControlMetricsError, setSourceControlMetricsError] = useState<Nullable<ErrorResponse>>(null);
  const [timeoutError4Board, setTimeoutError4Board] = useState('');
  const [timeoutError4Dora, setTimeoutError4Dora] = useState('');
  const [timeoutError4Report, setTimeoutError4Report] = useState('');

  const configData = useAppSelector(selectConfig);
  const csvTimeStamp = useAppSelector(selectTimeStamp);

  const startDate = configData.basic.dateRange.startDate ?? '';
  const endDate = configData.basic.dateRange.endDate ?? '';
  const metrics = configData.basic.metrics;

  const { addNotification, closeAllNotifications } = notification;
  const [errorMessage, setErrorMessage] = useState<string>();

  const shouldShowBoardMetrics = useAppSelector(isSelectBoardMetrics);
  const shouldShowDoraMetrics = useAppSelector(isSelectDoraMetrics);
  const onlySelectClassification = metrics.length === 1 && metrics[0] === REQUIRED_DATA.CLASSIFICATION;
  const isSummaryPage = useMemo(() => pageType === REPORT_PAGE_TYPE.SUMMARY, [pageType]);

  useEffect(() => {
    setPageType(onlySelectClassification ? REPORT_PAGE_TYPE.BOARD : REPORT_PAGE_TYPE.SUMMARY);
  }, []);

  useLayoutEffect(() => {
    exportValidityTimeMin &&
      allMetricsCompleted &&
      addNotification({
        message: MESSAGE.EXPIRE_INFORMATION(exportValidityTimeMin),
      });
  }, [exportValidityTimeMin, allMetricsCompleted]);

  useLayoutEffect(() => {
    if (exportValidityTimeMin && allMetricsCompleted) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        const remainingExpireTime = 5 * 60 * 1000;
        const remainingTime = exportValidityTimeMin * 60 * 1000 - elapsedTime;
        if (remainingTime <= remainingExpireTime) {
          addNotification({
            message: MESSAGE.EXPIRE_INFORMATION(5),
          });
          clearInterval(timer);
        }
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [exportValidityTimeMin, allMetricsCompleted]);

  useLayoutEffect(() => {
    closeAllNotifications();
  }, [pageType]);

  useEffect(() => {
    setExportValidityTimeMin(reportData?.exportValidityTime);
    reportData && setAllMetricsCompleted(reportData.allMetricsCompleted);
  }, [reportData]);

  useLayoutEffect(() => {
    return () => {
      stopPollingReports();
    };
  }, []);

  useEffect(() => {
    if (isSummaryPage && reportData) {
      setBoardMetricsError(reportData.reportMetricsError.boardMetricsError);
      setPipelineMetricsError(reportData.reportMetricsError.pipelineMetricsError);
      setSourceControlMetricsError(reportData.reportMetricsError.sourceControlMetricsError);
    }
  }, [reportData, isSummaryPage]);

  useEffect(() => {
    boardMetricsError &&
      addNotification({
        message: MESSAGE.FAILED_TO_GET_DATA('Board Metrics'),
        type: 'error',
      });
  }, [boardMetricsError]);

  useEffect(() => {
    pipelineMetricsError &&
      addNotification({
        message: MESSAGE.FAILED_TO_GET_DATA('Buildkite'),
        type: 'error',
      });
  }, [pipelineMetricsError]);

  useEffect(() => {
    sourceControlMetricsError &&
      addNotification({
        message: MESSAGE.FAILED_TO_GET_DATA('Github'),
        type: 'error',
      });
  }, [sourceControlMetricsError]);

  useEffect(() => {
    isSummaryPage && setTimeoutError4Report(timeout4Report);
  }, [timeout4Report, isSummaryPage]);

  useEffect(() => {
    isSummaryPage && setTimeoutError4Board(timeout4Board);
  }, [timeout4Board, isSummaryPage]);

  useEffect(() => {
    isSummaryPage && setTimeoutError4Dora(timeout4Dora);
  }, [timeout4Dora, isSummaryPage]);

  useEffect(() => {
    timeoutError4Report &&
      addNotification({
        message: MESSAGE.LOADING_TIMEOUT('Report'),
        type: 'error',
      });
  }, [timeoutError4Report]);

  useEffect(() => {
    timeoutError4Board &&
      addNotification({
        message: MESSAGE.LOADING_TIMEOUT('Board metrics'),
        type: 'error',
      });
  }, [timeoutError4Board]);

  useEffect(() => {
    timeoutError4Dora &&
      addNotification({
        message: MESSAGE.LOADING_TIMEOUT('DORA metrics'),
        type: 'error',
      });
  }, [timeoutError4Dora]);

  const showSummary = () => (
    <>
      {shouldShowBoardMetrics && (
        <BoardMetrics
          isBackFromDetail={isBackFromDetail}
          startDate={startDate}
          endDate={endDate}
          startToRequestBoardData={startToRequestBoardData}
          onShowDetail={() => setPageType(REPORT_PAGE_TYPE.BOARD)}
          boardReport={reportData}
          csvTimeStamp={csvTimeStamp}
          timeoutError={timeout4Board || timeout4Report}
        />
      )}
      {shouldShowDoraMetrics && (
        <DoraMetrics
          isBackFromDetail={isBackFromDetail}
          startDate={startDate}
          endDate={endDate}
          startToRequestDoraData={startToRequestDoraData}
          onShowDetail={() => setPageType(REPORT_PAGE_TYPE.DORA)}
          doraReport={reportData}
          csvTimeStamp={csvTimeStamp}
          timeoutError={timeout4Dora || timeout4Report}
        />
      )}
    </>
  );
  const showBoardDetail = (data: ReportResponseDTO) => <BoardDetail onBack={() => handleBack()} data={data} />;
  const showDoraDetail = (data: ReportResponseDTO) => <DoraDetail onBack={() => backToSummaryPage()} data={data} />;

  const handleBack = () => {
    isSummaryPage || onlySelectClassification ? dispatch(backStep()) : backToSummaryPage();
  };

  const backToSummaryPage = () => {
    setPageType(REPORT_PAGE_TYPE.SUMMARY);
    setIsBackFromDetail(true);
  };

  return (
    <>
      {isServerError ? (
        navigate(ROUTE.ERROR_PAGE)
      ) : (
        <>
          {startDate && endDate && (
            <StyledCalendarWrapper data-testid={'calendarWrapper'} isSummaryPage={isSummaryPage}>
              <DateRangeViewer startDate={startDate} endDate={endDate} />
            </StyledCalendarWrapper>
          )}
          {errorMessage && (
            <StyledErrorNotification>
              <ErrorNotification message={errorMessage} />
            </StyledErrorNotification>
          )}
          {isSummaryPage
            ? showSummary()
            : !!reportData &&
              (pageType === REPORT_PAGE_TYPE.BOARD ? showBoardDetail(reportData) : showDoraDetail(reportData))}
          <ReportButtonGroup
            isShowSave={isSummaryPage}
            isShowExportMetrics={isSummaryPage}
            isShowExportBoardButton={isSummaryPage ? shouldShowBoardMetrics : pageType === REPORT_PAGE_TYPE.BOARD}
            isShowExportPipelineButton={isSummaryPage ? shouldShowDoraMetrics : pageType === REPORT_PAGE_TYPE.DORA}
            handleBack={() => handleBack()}
            handleSave={() => handleSave()}
            reportData={reportData}
            startDate={startDate}
            endDate={endDate}
            csvTimeStamp={csvTimeStamp}
            setErrorMessage={(message) => {
              setErrorMessage(message);
            }}
          />
        </>
      )}
    </>
  );
};

export default ReportStep;
