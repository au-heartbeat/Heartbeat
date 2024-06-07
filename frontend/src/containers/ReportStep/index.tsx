import {
  filterAndMapCycleTimeSettings,
  formatDuplicatedNameWithSuffix,
  getJiraBoardToken,
  getRealDoneStatus,
  onlyEmptyAndDoneState,
  sortDateRanges,
} from '@src/utils/util';
import {
  GeneralErrorKey,
  initReportInfo,
  IReportError,
  IReportInfo,
  TimeoutErrorKey,
  useGenerateReportEffect,
} from '@src/hooks/useGenerateReportEffect';

import {
  addNotification,
  closeAllNotifications,
  closeNotification,
  Notification,
} from '@src/context/notification/NotificationSlice';

import {
  DateRange,
  DateRangeList,
  isOnlySelectClassification,
  isSelectBoardMetrics,
  isSelectDoraMetrics,
  isSelectDoraMetricsAndClassification,
  selectConfig,
  selectDateRange,
} from '@src/context/config/configSlice';
import {
  HeaderContainer,
  StyledCalendarWrapper,
  StyledRetry,
  StyledTab,
  StyledTabs,
  StyledTabWrapper,
} from '@src/containers/ReportStep/style';
import {
  BOARD_METRICS,
  CALENDAR,
  CHART_TAB_STYLE,
  DORA_METRICS,
  MESSAGE,
  REPORT_PAGE_TYPE,
  RequiredData,
} from '@src/constants/resources';
import { IPipelineConfig, selectMetricsContent } from '@src/context/Metrics/metricsSlice';
import { CHART_INDEX, DISPLAY_TYPE, MetricTypes } from '@src/constants/commons';
import { DoraMetricsChart } from '@src/containers/ReportStep/DoraMetricsChart';
import { backStep, selectTimeStamp } from '@src/context/stepper/StepperSlice';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { ReportButtonGroup } from '@src/containers/ReportButtonGroup';
import DateRangeViewer from '@src/components/Common/DateRangeViewer';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import BoardMetrics from '@src/containers/ReportStep/BoardMetrics';
import DoraMetrics from '@src/containers/ReportStep/DoraMetrics';
import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { BoardDetail, DoraDetail } from './ReportDetail';
import BarChartIcon from '@mui/icons-material/BarChart';
import { BoardMetricsChart } from './BoardMetricsChart';
import ReplayIcon from '@mui/icons-material/Replay';
import { Box, Tab, Tabs } from '@mui/material';
import { useAppSelector } from '@src/hooks';
import { uniqueId } from 'lodash';

export interface ReportStepProps {
  handleSave: () => void;
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

const ReportStep = ({ handleSave }: ReportStepProps) => {
  const dispatch = useAppDispatch();
  const configData = useAppSelector(selectConfig);
  const dateRanges = useAppSelector(selectDateRange);

  const descendingDateRanges = sortDateRanges(dateRanges);
  const ascendingDateRanges = descendingDateRanges.slice();

  const allDateRanges = ascendingDateRanges.reverse().map((range) => {
    const start = new Date(range.startDate!);
    const end = new Date(range.endDate!);
    const formattedStart = `${start.getFullYear()}/${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getDate().toString().padStart(2, '0')}`;
    const formattedEnd = `${end.getFullYear()}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getDate().toString().padStart(2, '0')}`;

    return `${formattedStart}-${formattedEnd}`;
  });

  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(descendingDateRanges[0]);
  const [currentDataInfo, setCurrentDataInfo] = useState<IReportInfo>(initReportInfo());

  const {
    startToRequestData,
    reportInfos,
    stopPollingReports,
    closeReportInfosErrorStatus,
    closeBoardMetricsError,
    closePipelineMetricsError,
    closeSourceControlMetricsError,
    hasPollingStarted,
  } = useGenerateReportEffect();

  const [exportValidityTimeMin, setExportValidityTimeMin] = useState<number | undefined | null>(undefined);
  const [pageType, setPageType] = useState<string>(REPORT_PAGE_TYPE.SUMMARY);
  const [isCsvFileGeneratedAtEnd, setIsCsvFileGeneratedAtEnd] = useState<boolean>(false);
  const [notifications4SummaryPage, setNotifications4SummaryPage] = useState<Omit<Notification, 'id'>[]>([]);
  const [errorNotificationIds, setErrorNotificationIds] = useState<string[]>([]);

  const csvTimeStamp = useAppSelector(selectTimeStamp);
  const {
    cycleTimeSettingsType,
    cycleTimeSettings,
    treatFlagCardAsBlock,
    users,
    targetFields,
    doneColumn,
    assigneeFilter,
    importedData: { importedAdvancedSettings, reworkTimesSettings },
    pipelineCrews,
    deploymentFrequencySettings,
    leadTimeForChanges,
  } = useAppSelector(selectMetricsContent);

  const startDate = selectedDateRange?.startDate as string;
  const endDate = selectedDateRange?.endDate as string;
  const { metrics, calendarType } = configData.basic;
  const boardingMappingStates = [...new Set(cycleTimeSettings.map((item) => item.value))];
  const isOnlyEmptyAndDoneState = onlyEmptyAndDoneState(boardingMappingStates);
  const includeRework = metrics.includes(RequiredData.ReworkTimes);
  const shouldShowBoardMetrics = useAppSelector(isSelectBoardMetrics);
  const shouldShowDoraMetrics = useAppSelector(isSelectDoraMetrics);
  const shouldShowTabs = allDateRanges.length > 1;
  const onlySelectClassification = useAppSelector(isOnlySelectClassification);
  const selectDoraMetricsAndClassification = useAppSelector(isSelectDoraMetricsAndClassification);
  const [chartIndex, setChartIndex] = useState(
    selectDoraMetricsAndClassification || !shouldShowBoardMetrics ? CHART_INDEX.DORA : CHART_INDEX.BOARD,
  );
  const [displayType, setDisplayType] = useState(DISPLAY_TYPE.LIST);
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

  const getJiraBoardSetting = () => {
    const { token, type, site, projectKey, boardId, email } = configData.board.config;

    return {
      token: getJiraBoardToken(token, email),
      type: type.toLowerCase().replace(' ', '-'),
      site,
      projectKey,
      boardId,
      boardColumns: filterAndMapCycleTimeSettings(cycleTimeSettings),
      treatFlagCardAsBlock,
      users,
      assigneeFilter,
      targetFields: formatDuplicatedNameWithSuffix(targetFields),
      doneColumn: getRealDoneStatus(cycleTimeSettings, cycleTimeSettingsType, doneColumn),
      reworkTimesSetting:
        includeRework && !isOnlyEmptyAndDoneState
          ? {
              reworkState: reworkTimesSettings.reworkState,
              excludedStates: reworkTimesSettings.excludeStates,
            }
          : null,
      overrideFields: [
        {
          name: 'Story Points',
          key: importedAdvancedSettings?.storyPoint ?? '',
          flag: true,
        },
        {
          name: 'Flagged',
          key: importedAdvancedSettings?.flag ?? '',
          flag: true,
        },
      ],
    };
  };

  const getDoraSetting = () => {
    const { pipelineTool, sourceControl } = configData;

    return {
      buildKiteSetting: {
        pipelineCrews,
        ...pipelineTool.config,
        deploymentEnvList: getPipelineConfig(deploymentFrequencySettings),
      },
      codebaseSetting: {
        type: sourceControl.config.type,
        token: sourceControl.config.token,
        leadTime: getPipelineConfig(leadTimeForChanges),
      },
    };
  };

  const getPipelineConfig = (pipelineConfigs: IPipelineConfig[]) =>
    pipelineConfigs.flatMap(({ organization, pipelineName, step, branches }) => {
      const pipelineConfigFromPipelineList = configData.pipelineTool.verifiedResponse.pipelineList.find(
        (pipeline) => pipeline.name === pipelineName && pipeline.orgName === organization,
      );
      if (pipelineConfigFromPipelineList) {
        const { orgName, orgId, name, id, repository } = pipelineConfigFromPipelineList;
        return [
          {
            orgId,
            orgName,
            id,
            name,
            step,
            repository,
            branches,
          },
        ];
      }
      return [];
    });

  const basicReportRequestBody = {
    startTime: null,
    endTime: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    considerHoliday: calendarType === CALENDAR.CHINA,
    csvTimeStamp,
    metrics,
    metricTypes: [
      ...(shouldShowBoardMetrics ? [MetricTypes.Board] : []),
      ...(shouldShowDoraMetrics ? [MetricTypes.DORA] : []),
    ],
    jiraBoardSetting: shouldShowBoardMetrics ? getJiraBoardSetting() : undefined,
    ...(shouldShowDoraMetrics ? getDoraSetting() : {}),
  };

  const boardReportRequestBody = {
    ...basicReportRequestBody,
    metrics: metrics.filter((metric) => BOARD_METRICS.includes(metric)),
    metricTypes: [MetricTypes.Board],
    buildKiteSetting: undefined,
    codebaseSetting: undefined,
  };

  const doraReportRequestBody = {
    ...basicReportRequestBody,
    metrics: metrics.filter((metric) => DORA_METRICS.includes(metric)),
    metricTypes: [MetricTypes.DORA],
    jiraBoardSetting: undefined,
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
    exportValidityTimeMin &&
      isCsvFileGeneratedAtEnd &&
      dispatch(
        addNotification({
          message: MESSAGE.EXPIRE_INFORMATION(exportValidityTimeMin),
        }),
      );
  }, [dispatch, exportValidityTimeMin, isCsvFileGeneratedAtEnd]);

  useEffect(() => {
    if (exportValidityTimeMin && isCsvFileGeneratedAtEnd) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        const remainingExpireTime = 5 * 60 * 1000;
        const remainingTime = exportValidityTimeMin * 60 * 1000 - elapsedTime;
        if (remainingTime <= remainingExpireTime) {
          dispatch(
            addNotification({
              message: MESSAGE.EXPIRE_INFORMATION(5),
            }),
          );
          clearInterval(timer);
        }
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [dispatch, exportValidityTimeMin, isCsvFileGeneratedAtEnd]);

  useEffect(() => {
    if (pageType === REPORT_PAGE_TYPE.DORA || pageType === REPORT_PAGE_TYPE.BOARD) {
      dispatch(closeAllNotifications());
    }
  }, [dispatch, pageType]);

  useEffect(() => {
    if (hasPollingStarted) return;
    const successfulReportInfos = reportInfos.filter((reportInfo) => reportInfo.reportData);
    if (successfulReportInfos.length === 0) return;
    setExportValidityTimeMin(successfulReportInfos[0].reportData?.exportValidityTime);
    setIsCsvFileGeneratedAtEnd(
      successfulReportInfos.some((reportInfo) => reportInfo.reportData?.isSuccessfulCreateCsvFile),
    );
  }, [dispatch, reportInfos, hasPollingStarted]);

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

  useEffect(() => {
    setPageType(onlySelectClassification ? REPORT_PAGE_TYPE.BOARD : REPORT_PAGE_TYPE.SUMMARY);
    startToRequestData(basicReportRequestBody);
    return () => {
      stopPollingReports();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSummary = () => (
    <Box sx={{ marginTop: allDateRanges.length > 1 ? '0' : '-3.4rem' }}>
      {shouldShowBoardMetrics && (
        <BoardMetrics
          startToRequestBoardData={() => startToRequestData(boardReportRequestBody)}
          onShowDetail={() => setPageType(REPORT_PAGE_TYPE.BOARD)}
          boardReport={currentDataInfo.reportData}
          errorMessage={getErrorMessage4Board()}
        />
      )}
      {shouldShowDoraMetrics && (
        <DoraMetrics
          startToRequestDoraData={() => startToRequestData(doraReportRequestBody)}
          onShowDetail={() => setPageType(REPORT_PAGE_TYPE.DORA)}
          doraReport={currentDataInfo.reportData}
          errorMessage={
            currentDataInfo.timeout4Dora.message ||
            currentDataInfo.timeout4Report.message ||
            currentDataInfo.generalError4Dora.message ||
            currentDataInfo.generalError4Report.message
          }
        />
      )}
    </Box>
  );

  const showTabs = () => (
    <StyledTabWrapper>
      <Box sx={{ marginRight: '2.5rem' }}>
        <StyledTabs value={displayType} onChange={handleClick} aria-label='display types'>
          <StyledTab
            aria-label='display list tab'
            sx={{
              borderRight: 'none',
              borderRadius: '0.16rem 0 0 0.16rem',
            }}
            icon={<FormatListBulletedIcon />}
            iconPosition='start'
            label='List'
          />
          <StyledTab
            aria-label='display chart tab'
            sx={{
              borderLeft: 'none',
              borderRadius: '0 0.16rem 0.16rem 0',
            }}
            icon={<BarChartIcon />}
            iconPosition='start'
            label='Chart'
            disabled={onlySelectClassification}
          />
        </StyledTabs>
      </Box>
      {displayType === DISPLAY_TYPE.CHART && (
        <Box>
          <Tabs TabIndicatorProps={CHART_TAB_STYLE} value={chartIndex} onChange={handleChange} aria-label='chart tabs'>
            <Tab
              aria-label='board chart'
              label='Board'
              {...tabProps(0)}
              disabled={selectDoraMetricsAndClassification || !shouldShowBoardMetrics}
            />
            <Tab label='DORA' aria-label='dora chart' {...tabProps(1)} disabled={!shouldShowDoraMetrics} />
          </Tabs>
        </Box>
      )}
    </StyledTabWrapper>
  );

  const showDoraChart = (data: (ReportResponseDTO | undefined)[]) => (
    <DoraMetricsChart data={data} dateRanges={allDateRanges} metrics={metrics} />
  );

  const showBoardChart = (data?: IReportInfo[] | undefined) => (
    <BoardMetricsChart data={data} dateRanges={allDateRanges} metrics={metrics} />
  );

  const showBoardDetail = (data?: ReportResponseDTO) => (
    <BoardDetail onBack={() => handleBack()} data={data} errorMessage={getErrorMessage4Board()} />
  );
  const showDoraDetail = (data: ReportResponseDTO) => <DoraDetail onBack={() => backToSummaryPage()} data={data} />;

  const handleBack = () => {
    setDisplayType(DISPLAY_TYPE.LIST);
    isSummaryPage || onlySelectClassification ? dispatch(backStep()) : backToSummaryPage();
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
    const pageType =
      newValue === DISPLAY_TYPE.LIST
        ? REPORT_PAGE_TYPE.SUMMARY
        : selectDoraMetricsAndClassification || chartIndex === CHART_INDEX.DORA
          ? REPORT_PAGE_TYPE.DORA_CHART
          : REPORT_PAGE_TYPE.BOARD_CHART;

    setDisplayType(newValue);
    setPageType(pageType);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setChartIndex(newValue);
    setPageType(newValue === CHART_INDEX.BOARD ? REPORT_PAGE_TYPE.BOARD_CHART : REPORT_PAGE_TYPE.DORA_CHART);
  };

  const handleChartRetry = () => {
    pageType === REPORT_PAGE_TYPE.DORA_CHART
      ? startToRequestData(doraReportRequestBody)
      : startToRequestData(boardReportRequestBody);
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
        return showBoardChart(reportInfos);
      case REPORT_PAGE_TYPE.DORA_CHART:
        return showDoraChart(reportInfos.map((infos) => infos.reportData));
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
      <HeaderContainer shouldShowTabs={shouldShowTabs}>
        {shouldShowTabs && showTabs()}
        {startDate && endDate && (
          <StyledCalendarWrapper
            data-testid={'calendarWrapper'}
            isSummaryPage={isSummaryPage}
            shouldShowChart={allDateRanges.length > 1}
          >
            {shouldShowChartRetryButton() && (
              <StyledRetry aria-label='chart retry' onClick={handleChartRetry}>
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
      <ReportButtonGroup
        isShowSave={isSummaryPage}
        isShowExportMetrics={isSummaryPage}
        isShowExportBoardButton={isSummaryPage ? shouldShowBoardMetrics : pageType === REPORT_PAGE_TYPE.BOARD}
        isShowExportPipelineButton={isSummaryPage ? shouldShowDoraMetrics : pageType === REPORT_PAGE_TYPE.DORA}
        isShowExportDoraChartButton={pageType === REPORT_PAGE_TYPE.DORA_CHART}
        isShowExportBoardChartButton={pageType === REPORT_PAGE_TYPE.BOARD_CHART}
        handleBack={() => handleBack()}
        handleSave={() => handleSave()}
        csvTimeStamp={csvTimeStamp}
        dateRangeRequestResults={mapDateResult(descendingDateRanges, reportInfos)}
      />
    </>
  );
};

export default ReportStep;
