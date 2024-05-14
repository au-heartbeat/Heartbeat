import {
  filterAndMapCycleTimeSettings,
  formatDuplicatedNameWithSuffix,
  getJiraBoardToken,
  getRealDoneStatus,
  onlyEmptyAndDoneState,
  sortDateRanges,
} from '@src/utils/util';
import {
  DateRange,
  DateRangeList,
  isOnlySelectClassification,
  isSelectBoardMetrics,
  isSelectDoraMetrics,
  selectConfig,
} from '@src/context/config/configSlice';
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
  BOARD_METRICS,
  CALENDAR,
  DORA_METRICS,
  MESSAGE,
  REPORT_PAGE_TYPE,
  REQUIRED_DATA,
} from '@src/constants/resources';
import { ListChartButtonContainer, StyledCalendarWrapper } from '@src/containers/ReportStep/style';
import { IPipelineConfig, selectMetricsContent } from '@src/context/Metrics/metricsSlice';
import { AllErrorResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import { DoraMetricsChart } from '@src/containers/ReportStep/DoraMetricsChart';
import { backStep, selectTimeStamp } from '@src/context/stepper/StepperSlice';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { ReportButtonGroup } from '@src/containers/ReportButtonGroup';
import DateRangeViewer from '@src/components/Common/DateRangeViewer';
import BoardMetrics from '@src/containers/ReportStep/BoardMetrics';
import DoraMetrics from '@src/containers/ReportStep/DoraMetrics';
import { ChartListButton } from '@src/components/Common/Buttons';
import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { BoardDetail, DoraDetail } from './ReportDetail';
import BarChartIcon from '@mui/icons-material/BarChart';
import { METRIC_TYPES } from '@src/constants/commons';
import { Box, Tab, Tabs } from '@mui/material';
import { useAppSelector } from '@src/hooks';
import Button from '@mui/material/Button';
import { uniqueId } from 'lodash';

export interface ReportStepProps {
  handleSave: () => void;
}

const timeoutNotificationMessages = {
  [TimeoutErrorKey[METRIC_TYPES.BOARD]]: 'Board metrics',
  [TimeoutErrorKey[METRIC_TYPES.DORA]]: 'DORA metrics',
  [TimeoutErrorKey[METRIC_TYPES.ALL]]: 'Report',
};

export interface DateRangeRequestResult {
  startDate: string;
  endDate: string;
  overallMetricsCompleted: boolean | null;
  boardMetricsCompleted: boolean | null;
  doraMetricsCompleted: boolean | null;
  reportMetricsError: AllErrorResponse;
}

const ReportStep = ({ handleSave }: ReportStepProps) => {
  const dispatch = useAppDispatch();
  const configData = useAppSelector(selectConfig);
  const descendingDateRanges = sortDateRanges(configData.basic.dateRange);
  const allDateRanges = descendingDateRanges.reverse().map((range) => {
    const start = new Date(range.startDate!);
    const end = new Date(range.endDate!);
    // 格式化日期为 MM/DD
    const formattedStart = `${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getDate().toString().padStart(2, '0')}`;
    const formattedEnd = `${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getDate().toString().padStart(2, '0')}`;

    return `${formattedStart}-${formattedEnd}`;
  });

  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(descendingDateRanges[0]);
  const [chartIndex, setChartIndex] = React.useState(0);
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
  const [isShowingChart, setIsShowingChart] = useState<boolean>(false);
  const [isChartFailed, setIsChartFailed] = useState<boolean>(false);
  const [chartRetry, setChartRetry] = useState<boolean>(false);

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
  const includeRework = metrics.includes(REQUIRED_DATA.REWORK_TIMES);
  const shouldShowBoardMetrics = useAppSelector(isSelectBoardMetrics);
  const shouldShowDoraMetrics = useAppSelector(isSelectDoraMetrics);
  const onlySelectClassification = useAppSelector(isOnlySelectClassification);
  const isSummaryPage = useMemo(() => pageType === REPORT_PAGE_TYPE.SUMMARY, [pageType]);
  const isChartPage = useMemo(
    () => pageType === REPORT_PAGE_TYPE.DORA_CHART || pageType === REPORT_PAGE_TYPE.BOARD_CHART,
    [pageType],
  );

  const mapDateResult = (descendingDateRanges: DateRangeList, reportInfos: IReportInfo[]) =>
    descendingDateRanges.map(({ startDate, endDate }) => {
      const reportData = reportInfos.find((singleResult) => singleResult.id === startDate)?.reportData ?? null;
      return {
        startDate: startDate,
        endDate: endDate,
        overallMetricsCompleted: reportData?.overallMetricsCompleted ?? null,
        boardMetricsCompleted: reportData?.boardMetricsCompleted ?? null,
        doraMetricsCompleted: reportData?.doraMetricsCompleted ?? null,
        reportMetricsError: reportData?.reportMetricsError ?? {
          boardMetricsError: null,
          pipelineMetricsError: null,
          sourceControlMetricsError: null,
        },
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
    considerHoliday: calendarType === CALENDAR.CHINA,
    csvTimeStamp,
    metrics,
    metricTypes: [
      ...(shouldShowBoardMetrics ? [METRIC_TYPES.BOARD] : []),
      ...(shouldShowDoraMetrics ? [METRIC_TYPES.DORA] : []),
    ],
    jiraBoardSetting: shouldShowBoardMetrics ? getJiraBoardSetting() : undefined,
    ...(shouldShowDoraMetrics ? getDoraSetting() : {}),
  };

  const boardReportRequestBody = {
    ...basicReportRequestBody,
    metrics: metrics.filter((metric) => BOARD_METRICS.includes(metric)),
    metricTypes: [METRIC_TYPES.BOARD],
    buildKiteSetting: undefined,
    codebaseSetting: undefined,
  };

  const doraReportRequestBody = {
    ...basicReportRequestBody,
    metrics: metrics.filter((metric) => DORA_METRICS.includes(metric)),
    metricTypes: [METRIC_TYPES.DORA],
    jiraBoardSetting: undefined,
  };

  useEffect(() => {
    setCurrentDataInfo(reportInfos.find((singleResult) => singleResult.id === selectedDateRange.startDate)!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportInfos, selectedDateRange]);

  // Dispatch pop-up when chart generating failed
  useEffect(() => {
    isChartFailed &&
      dispatch(
        addNotification({
          type: 'error',
          message: MESSAGE.DORA_CHART_LOADING_FAILED,
        }),
      );
  }, [isChartFailed, dispatch]);

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
    <>
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
    </>
  );

  const showDoraChart = (data: (ReportResponseDTO | undefined)[]) => (
    <DoraMetricsChart data={data} dateRanges={allDateRanges} setIsChartFailed={setIsChartFailed} retry={chartRetry} />
  );
  const showBoardDetail = (data?: ReportResponseDTO) => (
    <BoardDetail onBack={() => handleBack()} data={data} errorMessage={getErrorMessage4Board()} />
  );
  const showDoraDetail = (data: ReportResponseDTO) => <DoraDetail onBack={() => backToSummaryPage()} data={data} />;

  const handleBack = () => {
    isSummaryPage || onlySelectClassification ? dispatch(backStep()) : backToSummaryPage();
  };

  const backToSummaryPage = () => {
    setPageType(REPORT_PAGE_TYPE.SUMMARY);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setChartIndex(newValue);
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

  const handleListClick = () => {
    setIsShowingChart(false);
    setPageType(REPORT_PAGE_TYPE.SUMMARY);
  };

  const handleChartClick = () => {
    setIsShowingChart(true);
    setPageType(REPORT_PAGE_TYPE.DORA_CHART);
  };

  const handleChartRetry = () => {
    setChartRetry(!chartRetry);
    setIsChartFailed(false);
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
      case REPORT_PAGE_TYPE.DORA_CHART:
        return showDoraChart(reportInfos.map((infos) => infos.reportData));
    }
  };

  return (
    <>
      {startDate && endDate && (
        <StyledCalendarWrapper data-testid={'calendarWrapper'} isSummaryPage={isSummaryPage}>
          <ListChartButtonContainer>
            <ChartListButton onClick={handleListClick} startIcon={<FormatListBulletedIcon />}>
              List
            </ChartListButton>
            <ChartListButton onClick={handleChartClick} startIcon={<BarChartIcon />}>
              Chart
            </ChartListButton>
          </ListChartButtonContainer>
          <Box>
            <Tabs value={chartIndex} onChange={handleChange} aria-label='chart tabs'>
              <Tab label='Board' {...tabProps(0)} />
              <Tab label='DORA' {...tabProps(1)} />
            </Tabs>
          </Box>
          {isChartFailed && pageType === REPORT_PAGE_TYPE.DORA_CHART && (
            <Button aria-label='chart retry' onClick={handleChartRetry}>
              retry
            </Button>
          )}
          <DateRangeViewer
            dateRangeList={descendingDateRanges}
            selectedDateRange={selectedDateRange}
            changeDateRange={(dateRange) => setSelectedDateRange(dateRange)}
            disabledAll={isShowingChart}
          />
        </StyledCalendarWrapper>
      )}
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
        isChartFailed={isChartFailed}
        dateRangeRequestResults={mapDateResult(descendingDateRanges, reportInfos)}
      />
    </>
  );
};

export default ReportStep;
