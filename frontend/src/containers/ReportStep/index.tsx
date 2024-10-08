import {
  filterAndMapCycleTimeSettings,
  formatDuplicatedNameWithSuffix,
  getJiraBoardToken,
  getRealDoneStatus,
  onlyEmptyAndDoneState,
} from '@src/utils/util';
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect';

import { addNotification } from '@src/context/notification/NotificationSlice';

import {
  isSelectBoardMetrics,
  isSelectDoraMetrics,
  selectBasicInfo,
  selectConfig,
  selectDateRange,
  selectPipelineTool,
} from '@src/context/config/configSlice';
import {
  selectReportId,
  selectReportPageFailedTimeRangeInfos,
  selectTimeStamp,
} from '@src/context/stepper/StepperSlice';
import { IPipelineConfig, selectClassificationCharts, selectMetricsContent } from '@src/context/Metrics/metricsSlice';
import { MESSAGE, PIPELINE_TOOL_OTHER_OPTION, RequiredData } from '@src/constants/resources';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { getTotalDateRangeLoadingStatus } from '@src/utils/report';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { MetricTypes } from '@src/constants/commons';
import ReportContent from './ReportContent';
import { useAppSelector } from '@src/hooks';
import { useEffect, useState } from 'react';
import * as echarts from 'echarts';

export interface ReportStepProps {
  handleSave: () => void;
}

export interface DateRangeRequestResult {
  startDate: string;
  endDate: string;
  reportData: ReportResponseDTO | undefined;
}

export function showChart(div: HTMLDivElement | null, options: echarts.EChartsCoreOption) {
  if (div) {
    const chart = echarts.init(div);
    chart.clear();
    chart.setOption(options);
    const resize = () => {
      chart.resize();
    };
    window.addEventListener('resize', resize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', resize);
    };
  }
}

const ReportStep = ({ handleSave }: ReportStepProps) => {
  const dispatch = useAppDispatch();
  const configData = useAppSelector(selectConfig);
  const dateRanges = useAppSelector(selectDateRange);
  const projectName = useAppSelector(selectBasicInfo).projectName;
  const reportPageTimeRangeLoadingStatus = useAppSelector(selectReportPageFailedTimeRangeInfos);
  const allDateRangeLoadingFinished = !getTotalDateRangeLoadingStatus(dateRanges, reportPageTimeRangeLoadingStatus)
    .isLoading;
  const pipelineTools = useAppSelector(selectPipelineTool);

  const { startToRequestData, reportInfos, stopPollingReports, hasPollingStarted } = useGenerateReportEffect();

  const [exportValidityTimeMin, setExportValidityTimeMin] = useState<number | undefined | null>(undefined);
  const [isCsvFileGeneratedAtEnd, setIsCsvFileGeneratedAtEnd] = useState<boolean>(false);

  const csvTimeStamp = useAppSelector(selectTimeStamp);
  const reportId = useAppSelector(selectReportId);
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
    pipelineSettings,
    leadTimeForChanges,
    sourceControlCrews,
    sourceControlConfigurationSettings,
  } = useAppSelector(selectMetricsContent);
  const classificationCharts = useAppSelector(selectClassificationCharts);

  const { metrics, calendarType } = configData.basic;
  const boardingMappingStates = [...new Set(cycleTimeSettings.map((item) => item.value))];
  const isOnlyEmptyAndDoneState = onlyEmptyAndDoneState(boardingMappingStates);
  const includeRework = metrics.includes(RequiredData.ReworkTimes);
  const shouldShowBoardMetrics = useAppSelector(isSelectBoardMetrics);
  const shouldShowDoraMetrics = useAppSelector(isSelectDoraMetrics);

  const targetFieldsWithSuffix = formatDuplicatedNameWithSuffix(targetFields);
  const classificationNames = classificationCharts
    .map((it) => targetFieldsWithSuffix.find((targetField) => targetField.key === it.key))
    .map((it) => it!.name);

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
      targetFields: targetFieldsWithSuffix,
      classificationNames,
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
        deploymentEnvList: pipelineTools.type !== PIPELINE_TOOL_OTHER_OPTION ? getPipelineConfig(pipelineSettings) : [],
      },
      codebaseSetting: {
        type: sourceControl.config.type,
        token: sourceControl.config.token,
        leadTime: getPipelineConfig(leadTimeForChanges),
        crews: sourceControlCrews,
        codebases: sourceControlConfigurationSettings,
      },
    };
  };

  const getPipelineConfig = (pipelineConfigs: IPipelineConfig[]) =>
    pipelineConfigs.flatMap(({ organization, pipelineName, step, branches, repoName }) => {
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
            repoName,
          },
        ];
      }
      return [];
    });

  const basicReportRequestBody = {
    startTime: null,
    endTime: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    calendarType,
    csvTimeStamp,
    metrics,
    metricTypes: [
      ...(shouldShowBoardMetrics ? [MetricTypes.Board] : []),
      ...(shouldShowDoraMetrics ? [MetricTypes.DORA] : []),
    ],
    jiraBoardSetting: shouldShowBoardMetrics ? getJiraBoardSetting() : undefined,
    ...(shouldShowDoraMetrics ? getDoraSetting() : {}),
  };

  useEffect(() => {
    exportValidityTimeMin &&
      isCsvFileGeneratedAtEnd &&
      dispatch(
        addNotification({
          message: MESSAGE.EXPIRE_INFORMATION,
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
              message: MESSAGE.EXPIRE_INFORMATION,
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
    if (hasPollingStarted) return;
    const successfulReportInfos = reportInfos.filter((reportInfo) => reportInfo.reportData);
    if (successfulReportInfos.length === 0) return;
    setExportValidityTimeMin(successfulReportInfos[0].reportData?.exportValidityTime);
    setIsCsvFileGeneratedAtEnd(
      successfulReportInfos.some((reportInfo) => reportInfo.reportData?.isSuccessfulCreateCsvFile),
    );
  }, [dispatch, reportInfos, hasPollingStarted]);

  useEffect(() => {
    startToRequestData(basicReportRequestBody);
    return () => {
      stopPollingReports();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ReportContent
      isSharePage={false}
      metrics={metrics}
      classificationNames={classificationNames}
      allPipelines={pipelineSettings.map((it) => `${it.pipelineName}/${it.step}`)}
      allSourceControls={sourceControlConfigurationSettings.map((it) => `${it.organization}/${it.repo}`)}
      dateRanges={dateRanges}
      startToRequestData={() => startToRequestData(basicReportRequestBody)}
      reportInfos={reportInfos}
      handleSave={handleSave}
      reportId={reportId}
      projectName={projectName}
      allDateRangeLoadingFinished={allDateRangeLoadingFinished}
    ></ReportContent>
  );
};

export default ReportStep;
