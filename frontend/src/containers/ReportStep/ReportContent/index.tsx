import {
  GeneralErrorKey,
  initReportInfo,
  IReportError,
  IReportInfo,
  TimeoutErrorKey,
  useGenerateReportEffect,
} from '@src/hooks/useGenerateReportEffect';
import { sortDateRanges, sortReportInfos } from '@src/utils/util';

import {
  addNotification,
  closeAllNotifications,
  closeNotification,
  Notification,
} from '@src/context/notification/NotificationSlice';

import {
  HeaderContainer,
  StyledCalendarWrapper,
  StyledChartTabs,
  StyledProjectHeader,
  StyledRetry,
  StyledTab,
  StyledTabs,
} from '@src/containers/ReportStep/style';
import {
  BOARD_METRICS,
  CHART_TAB_STYLE,
  DORA_METRICS,
  MESSAGE,
  REPORT_PAGE_TYPE,
  RequiredData,
} from '@src/constants/resources';
import { DEFAULT_SELECTED_PIPELINE, DoraMetricsChart } from '@src/containers/ReportStep/DoraMetricsChart';
import { CHART_INDEX, DISPLAY_TYPE, MetricTypes } from '@src/constants/commons';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { DateRange, DateRangeList } from '@src/context/config/configSlice';
import DateRangeViewer from '@src/components/Common/DateRangeViewer';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import BoardMetrics from '@src/containers/ReportStep/BoardMetrics';
import DoraMetrics from '@src/containers/ReportStep/DoraMetrics';
import { backStep } from '@src/context/stepper/StepperSlice';
import { ReportButtonGroup } from '../../ReportButtonGroup';
import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { BoardDetail, DoraDetail } from '../ReportDetail';
import { BoardMetricsChart } from '../BoardMetricsChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReplayIcon from '@mui/icons-material/Replay';
import { Box, Tab } from '@mui/material';
import { uniqueId } from 'lodash';

export interface ReportContentProps {
  metrics: string[];
  allPipelines: string[];
  allSourceControls: string[];
  classificationNames: string[];
  dateRanges: DateRangeList;
  startToRequestData: () => void;
  reportInfos: IReportInfo[];
  handleSave?: () => void;
  reportId?: number;
  hideButtons?: boolean;
  isSharePage: boolean;
  projectName: string;
  allDateRangeLoadingFinished: boolean;
}

const timeoutNotificationMessages = {
  [TimeoutErrorKey[MetricTypes.Board]]: 'Board metrics',
  [TimeoutErrorKey[MetricTypes.DORA]]: 'DORA metrics',
  [TimeoutErrorKey[MetricTypes.All]]: 'Report',
};

export interface DateRangeRequestResult {
  startDate: string;
  endDate: string;
  reportData: ReportResponseDTO | undefined;
}

const ReportContent = (props: ReportContentProps) => {
  const {
    metrics,
    allPipelines,
    allSourceControls,
    dateRanges,
    startToRequestData,
    reportInfos,
    handleSave,
    reportId,
    hideButtons = false,
    isSharePage,
    classificationNames,
    projectName,
    allDateRangeLoadingFinished,
  } = props;

  const dispatch = useAppDispatch();

  const descendingDateRanges = sortDateRanges(dateRanges);
  const ascendingDateRanges = descendingDateRanges.slice().toReversed();

  const allDateRanges = ascendingDateRanges.map((range) => {
    const start = new Date(range.startDate!);
    const end = new Date(range.endDate!);
    const formattedStart = `${start.getFullYear()}/${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getDate().toString().padStart(2, '0')}`;
    const formattedEnd = `${end.getFullYear()}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getDate().toString().padStart(2, '0')}`;

    return `${formattedStart}-${formattedEnd}`;
  });
  const ascendingReportInfos = sortReportInfos(reportInfos, false);

  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(descendingDateRanges[0]);
  const [currentDataInfo, setCurrentDataInfo] = useState<IReportInfo>(initReportInfo());
  let isGray = true;

  const {
    closeReportInfosErrorStatus,
    closeBoardMetricsError,
    closePipelineMetricsError,
    closeSourceControlMetricsError,
  } = useGenerateReportEffect();

  const [notifications4SummaryPage, setNotifications4SummaryPage] = useState<Omit<Notification, 'id'>[]>([]);
  const [errorNotificationIds, setErrorNotificationIds] = useState<string[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>(DEFAULT_SELECTED_PIPELINE);

  const startDate = selectedDateRange?.startDate as string;
  const endDate = selectedDateRange?.endDate as string;

  const selectBoardMetricsWithoutClassification = metrics.some(
    (metric) => BOARD_METRICS.includes(metric) && metric !== RequiredData.Classification,
  );
  const selectBoardOnlyClassification = metrics.some(
    (metric) => BOARD_METRICS.includes(metric) && metric === RequiredData.Classification,
  );
  const selectClassificationCharts = classificationNames.length > 0;
  const selectDora = metrics.some((metric) => DORA_METRICS.includes(metric));

  const shouldShowBoardMetrics = selectBoardMetricsWithoutClassification || selectBoardOnlyClassification;
  const shouldShowBoardMetricsChart =
    selectBoardMetricsWithoutClassification || (selectBoardOnlyClassification && selectClassificationCharts);
  const shouldShowDoraMetrics = selectDora;
  const metricsOnlySelectClassification =
    !selectBoardMetricsWithoutClassification && !selectDora && selectBoardOnlyClassification;
  const shouldShowTabs = allDateRanges.length > 1;
  const disabledChartTab = metricsOnlySelectClassification && !selectClassificationCharts;

  const [displayType, setDisplayType] = useState(
    shouldShowTabs && !disabledChartTab ? DISPLAY_TYPE.CHART : DISPLAY_TYPE.LIST,
  );
  const [chartIndex, setChartIndex] = useState(shouldShowBoardMetricsChart ? CHART_INDEX.BOARD : CHART_INDEX.DORA);
  const [pageType, setPageType] = useState<string>(
    shouldShowTabs && !disabledChartTab
      ? shouldShowBoardMetricsChart
        ? REPORT_PAGE_TYPE.BOARD_CHART
        : REPORT_PAGE_TYPE.DORA_CHART
      : metricsOnlySelectClassification
        ? REPORT_PAGE_TYPE.BOARD
        : REPORT_PAGE_TYPE.SUMMARY,
  );
  const isSummaryPage = useMemo(() => pageType === REPORT_PAGE_TYPE.SUMMARY, [pageType]);
  const isChartPage = useMemo(
    () => pageType === REPORT_PAGE_TYPE.DORA_CHART || pageType === REPORT_PAGE_TYPE.BOARD_CHART,
    [pageType],
  );

  const mapDateResult = (descendingDateRanges: DateRangeList, reportInfos: IReportInfo[]) =>
    descendingDateRanges.map(({ startDate, endDate }) => {
      const reportData = reportInfos.find((singleResult) => singleResult.id === startDate)!.reportData;
      return {
        startDate: startDate,
        endDate: endDate,
        reportData,
      } as DateRangeRequestResult;
    });

  const getErrorMessage4Board = () => {
    if (currentDataInfo.reportData?.reportMetricsError.boardMetricsError) {
      return `Failed to get Jira info, status: ${currentDataInfo.reportData.reportMetricsError.boardMetricsError.status}`;
    }
    return (
      currentDataInfo.timeout4Board.message ||
      currentDataInfo.timeout4Report.message ||
      currentDataInfo.generalError4Board.message ||
      currentDataInfo.generalError4Report.message
    );
  };

  useEffect(() => {
    setCurrentDataInfo(reportInfos.find((singleResult) => singleResult.id === selectedDateRange.startDate)!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportInfos, selectedDateRange]);

  useEffect(() => {
    errorNotificationIds.forEach((notificationId) => {
      dispatch(closeNotification(notificationId));
    });
    setErrorNotificationIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateRange]);

  useEffect(() => {
    if (pageType === REPORT_PAGE_TYPE.DORA || pageType === REPORT_PAGE_TYPE.BOARD) {
      dispatch(closeAllNotifications());
    }
  }, [dispatch, pageType]);

  useEffect(() => {
    if ((isSummaryPage || isChartPage) && notifications4SummaryPage.length > 0) {
      const notification = notifications4SummaryPage[0];
      notification && dispatch(addNotification(notification));
      setNotifications4SummaryPage(notifications4SummaryPage.slice(1));
    }
  }, [dispatch, notifications4SummaryPage, isSummaryPage, isChartPage]);

  useEffect(() => {
    if (!currentDataInfo.shouldShowBoardMetricsError) return;
    if (currentDataInfo.reportData?.reportMetricsError.boardMetricsError) {
      const notificationId = uniqueId();
      setErrorNotificationIds((pre) => [...pre, notificationId]);
      setNotifications4SummaryPage((prevState) => [
        ...prevState,
        {
          id: notificationId,
          message: MESSAGE.FAILED_TO_GET_DATA('Board Metrics'),
          type: 'error',
        },
      ]);
    }
    closeBoardMetricsError(selectedDateRange.startDate as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDataInfo.reportData?.reportMetricsError.boardMetricsError]);

  useEffect(() => {
    if (!currentDataInfo.shouldShowPipelineMetricsError) return;
    if (currentDataInfo.reportData?.reportMetricsError.pipelineMetricsError) {
      const notificationId = uniqueId();
      setErrorNotificationIds((pre) => [...pre, notificationId]);
      setNotifications4SummaryPage((prevState) => [
        ...prevState,
        {
          id: notificationId,
          message: MESSAGE.FAILED_TO_GET_DATA('Buildkite'),
          type: 'error',
        },
      ]);
    }
    closePipelineMetricsError(selectedDateRange.startDate as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDataInfo.reportData?.reportMetricsError.pipelineMetricsError]);

  useEffect(() => {
    if (!currentDataInfo.shouldShowSourceControlMetricsError) return;
    if (currentDataInfo.reportData?.reportMetricsError.sourceControlMetricsError) {
      const notificationId = uniqueId();
      setErrorNotificationIds((pre) => [...pre, notificationId]);
      setNotifications4SummaryPage((prevState) => [
        ...prevState,
        {
          id: notificationId,
          message: MESSAGE.FAILED_TO_GET_DATA('GitHub'),
          type: 'error',
        },
      ]);
    }
    closeSourceControlMetricsError(selectedDateRange.startDate as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDataInfo.reportData?.reportMetricsError.sourceControlMetricsError]);

  useEffect(() => {
    Object.values(TimeoutErrorKey).forEach((value) => handleTimeoutAndGeneralError(value));
    Object.values(GeneralErrorKey).forEach((value) => handleTimeoutAndGeneralError(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentDataInfo.timeout4Board,
    currentDataInfo.timeout4Report,
    currentDataInfo.timeout4Dora,
    currentDataInfo.generalError4Board,
    currentDataInfo.generalError4Dora,
    currentDataInfo.generalError4Report,
  ]);

  if (currentDataInfo.reportData?.leadTimeForChanges?.leadTimeForChangesOfPipelines?.length !== 0) {
    isGray = false;
  }

  const showSummary = () => (
    <Box>
      {shouldShowBoardMetrics && (
        <BoardMetrics
          startToRequestBoardData={startToRequestData}
          onShowDetail={() => setPageType(REPORT_PAGE_TYPE.BOARD)}
          boardReport={currentDataInfo.reportData}
          errorMessage={getErrorMessage4Board()}
          metrics={metrics}
        />
      )}
      {shouldShowDoraMetrics && (
        <DoraMetrics
          startToRequestDoraData={startToRequestData}
          onShowDetail={() => setPageType(REPORT_PAGE_TYPE.DORA)}
          doraReport={currentDataInfo.reportData}
          metrics={metrics}
          errorMessage={
            currentDataInfo.timeout4Dora.message ||
            currentDataInfo.timeout4Report.message ||
            currentDataInfo.generalError4Dora.message ||
            currentDataInfo.generalError4Report.message
          }
          isExistSourceControl={isGray}
        />
      )}
    </Box>
  );

  const showTabs = () => (
    <StyledTabs value={displayType} onChange={handleClick} aria-label='display types'>
      <StyledTab
        aria-label='display chart tab'
        sx={{
          borderRight: 'none',
          borderRadius: '0.16rem 0 0 0.16rem',
        }}
        icon={<BarChartIcon />}
        iconPosition='start'
        label='Chart'
        disabled={disabledChartTab}
      />
      <StyledTab
        aria-label='display list tab'
        sx={{
          borderLeft: 'none',
          borderRadius: '0 0.16rem 0.16rem 0',
        }}
        icon={<FormatListBulletedIcon />}
        iconPosition='start'
        label='List'
      />
    </StyledTabs>
  );

  const showChartTabs = () => (
    <StyledChartTabs
      TabIndicatorProps={CHART_TAB_STYLE}
      value={chartIndex}
      onChange={handleChange}
      aria-label='chart tabs'
    >
      <Tab aria-label='board chart' label='Board' {...tabProps(0)} disabled={!shouldShowBoardMetricsChart} />
      <Tab label='DORA' aria-label='dora chart' {...tabProps(1)} disabled={!shouldShowDoraMetrics} />
    </StyledChartTabs>
  );

  const showDoraChart = (data: (ReportResponseDTO | undefined)[]) => (
    <DoraMetricsChart
      data={data}
      dateRanges={allDateRanges}
      metrics={metrics}
      allPipelines={allPipelines}
      allSourceControls={allSourceControls}
      selectedPipeline={selectedPipeline}
      onUpdatePipeline={setSelectedPipeline}
      allDateRangeLoadingFinished={allDateRangeLoadingFinished}
    />
  );

  const showBoardChart = (data: IReportInfo[]) => (
    <BoardMetricsChart
      data={data}
      dateRanges={allDateRanges}
      metrics={metrics}
      classificationCharts={classificationNames}
      allDateRangeLoadingFinished={allDateRangeLoadingFinished}
    />
  );

  const showBoardDetail = (data?: ReportResponseDTO) => (
    <BoardDetail
      isShowBack={!metricsOnlySelectClassification || !isSharePage}
      metrics={metrics}
      onBack={handleBack}
      data={data}
      errorMessage={getErrorMessage4Board()}
    />
  );
  const showDoraDetail = (data: ReportResponseDTO) => (
    <DoraDetail isExistSourceControl={isGray} isShowBack={true} onBack={backToSummaryPage} data={data} />
  );

  const handleBack = () => {
    if (isChartPage || (!shouldShowTabs && isSummaryPage)) {
      dispatch(backStep());
    } else if (metricsOnlySelectClassification) {
      if (selectClassificationCharts) {
        setDisplayType(DISPLAY_TYPE.CHART);
        setPageType(REPORT_PAGE_TYPE.BOARD_CHART);
      } else {
        dispatch(backStep());
      }
    } else if (!isSummaryPage) {
      setDisplayType(DISPLAY_TYPE.LIST);
      setPageType(REPORT_PAGE_TYPE.SUMMARY);
    } else {
      setDisplayType(DISPLAY_TYPE.CHART);
      const pageType =
        !shouldShowBoardMetricsChart || chartIndex === CHART_INDEX.DORA
          ? REPORT_PAGE_TYPE.DORA_CHART
          : REPORT_PAGE_TYPE.BOARD_CHART;
      setPageType(pageType);
    }
  };

  const backToSummaryPage = () => {
    setPageType(REPORT_PAGE_TYPE.SUMMARY);
  };

  const handleTimeoutAndGeneralError = (value: string) => {
    const errorKey = value as keyof IReportError;
    if (!currentDataInfo[errorKey].shouldShow) return;
    if (currentDataInfo[errorKey].message) {
      const notificationId = uniqueId();
      setErrorNotificationIds((pre) => [...pre, notificationId]);
      setNotifications4SummaryPage((prevState) => [
        ...prevState,
        {
          id: notificationId,
          message: timeoutNotificationMessages[errorKey]
            ? MESSAGE.LOADING_TIMEOUT(timeoutNotificationMessages[errorKey])
            : MESSAGE.FAILED_TO_REQUEST,
          type: 'error',
        },
      ]);
    }
    closeReportInfosErrorStatus(selectedDateRange.startDate as string, errorKey);
  };

  const handleClick = (event: React.SyntheticEvent, newValue: number) => {
    const chartType =
      !shouldShowBoardMetricsChart || chartIndex === CHART_INDEX.DORA
        ? REPORT_PAGE_TYPE.DORA_CHART
        : REPORT_PAGE_TYPE.BOARD_CHART;
    const reportListPageType = metricsOnlySelectClassification ? REPORT_PAGE_TYPE.BOARD : REPORT_PAGE_TYPE.SUMMARY;
    const pageType = newValue === DISPLAY_TYPE.LIST ? reportListPageType : chartType;

    setDisplayType(newValue);
    setPageType(pageType);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setChartIndex(newValue);
    setPageType(newValue === CHART_INDEX.BOARD ? REPORT_PAGE_TYPE.BOARD_CHART : REPORT_PAGE_TYPE.DORA_CHART);
  };

  const tabProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  const showPage = (pageType: string, reportData: ReportResponseDTO | undefined) => {
    switch (pageType) {
      case REPORT_PAGE_TYPE.SUMMARY:
        return showSummary();
      case REPORT_PAGE_TYPE.BOARD:
        return showBoardDetail(reportData);
      case REPORT_PAGE_TYPE.DORA:
        return !!reportData && showDoraDetail(reportData);
      case REPORT_PAGE_TYPE.BOARD_CHART:
        return showBoardChart(ascendingReportInfos);
      case REPORT_PAGE_TYPE.DORA_CHART:
        return showDoraChart(ascendingReportInfos.map((infos) => infos.reportData));
    }
  };

  const isShowingChart = () => {
    return pageType === REPORT_PAGE_TYPE.BOARD_CHART || pageType === REPORT_PAGE_TYPE.DORA_CHART;
  };

  const shouldShowChartRetryButton = () => {
    return (
      (currentDataInfo['timeout4Report'].message ||
        currentDataInfo['timeout4Dora'].message ||
        currentDataInfo['timeout4Board'].message) &&
      isShowingChart()
    );
  };

  return (
    <>
      {projectName && <StyledProjectHeader aria-label='project name'>{projectName}</StyledProjectHeader>}
      <HeaderContainer shouldShowTabs={shouldShowTabs}>
        {shouldShowTabs && showTabs()}
        {shouldShowTabs && displayType === DISPLAY_TYPE.CHART && showChartTabs()}
        {startDate && endDate && (
          <StyledCalendarWrapper data-testid={'calendarWrapper'} justCalendar={!shouldShowTabs}>
            {shouldShowChartRetryButton() && (
              <StyledRetry aria-label='chart retry' onClick={startToRequestData}>
                <ReplayIcon />
              </StyledRetry>
            )}
            <DateRangeViewer
              dateRangeList={descendingDateRanges}
              selectedDateRange={selectedDateRange}
              changeDateRange={(dateRange) => setSelectedDateRange(dateRange)}
              isShowingChart={isShowingChart()}
              disabledAll={isShowingChart()}
            />
          </StyledCalendarWrapper>
        )}
      </HeaderContainer>
      {showPage(pageType, currentDataInfo.reportData)}
      {!hideButtons && (
        <ReportButtonGroup
          isShowSave={isSummaryPage}
          isShowExportMetrics={isSummaryPage}
          isShowExportBoardButton={isSummaryPage ? shouldShowBoardMetrics : pageType === REPORT_PAGE_TYPE.BOARD}
          isShowExportPipelineButton={isSummaryPage ? shouldShowDoraMetrics : pageType === REPORT_PAGE_TYPE.DORA}
          isShowExportDoraChartButton={pageType === REPORT_PAGE_TYPE.DORA_CHART}
          isShowExportBoardChartButton={pageType === REPORT_PAGE_TYPE.BOARD_CHART}
          handleBack={() => handleBack()}
          handleSave={() => handleSave!()}
          reportId={reportId!}
          dateRangeRequestResults={mapDateResult(descendingDateRanges, reportInfos)}
        />
      )}
    </>
  );
};

export default ReportContent;
