import {
  selectDateRange,
  selectIsProjectCreated,
  selectMetrics,
  selectBoard,
  updateJiraVerifyResponse,
  selectUsers,
  selectJiraColumns,
  selectPipelineTool,
} from '@src/context/config/configSlice';
import {
  selectMetricsContent,
  selectShouldGetBoardConfig,
  updateFirstTimeRoadMetricsBoardData,
  updateMetricsState,
  updateShouldGetBoardConfig,
} from '@src/context/Metrics/metricsSlice';
import {
  MetricSelectionHeader,
  MetricSelectionWrapper,
  MetricsSelectionTitle,
  StyledErrorMessage,
  StyledRetryButton,
} from '@src/containers/MetricsStep/style';
import {
  AxiosRequestErrorCode,
  CycleTimeSettingsTypes,
  DONE,
  MESSAGE,
  PIPELINE_TOOL_OTHER_OPTION,
  RequiredData,
} from '@src/constants/resources';
import { DeploymentFrequencySettings } from '@src/containers/MetricsStep/DeploymentFrequencySettings';
import { addNotification, closeAllNotifications } from '@src/context/notification/NotificationSlice';
import { SourceControlConfiguration } from '@src/containers/MetricsStep/SouceControlConfiguration';
import { Classification } from '@src/containers/MetricsStep/Classification';
import { shouldMetricsLoaded } from '@src/context/stepper/StepperSlice';
import DateRangeViewer from '@src/components/Common/DateRangeViewer';
import { useGetBoardInfoEffect } from '@src/hooks/useGetBoardInfo';
import { combineBoardInfo, sortDateRanges } from '@src/utils/util';
import { CycleTime } from '@src/containers/MetricsStep/CycleTime';
import { RealDone } from '@src/containers/MetricsStep/RealDone';
import { useCallback, useEffect, useLayoutEffect } from 'react';
import EmptyContent from '@src/components/Common/EmptyContent';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { Crews } from '@src/containers/MetricsStep/Crews';
import { Loading } from '@src/components/Loading';
import ReworkSettings from './ReworkSettings';
import { Advance } from './Advance/Advance';
import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';

const MetricsStep = () => {
  const boardConfig = useAppSelector(selectBoard);
  const isProjectCreated = useAppSelector(selectIsProjectCreated);
  const dispatch = useAppDispatch();
  const requiredData = useAppSelector(selectMetrics);
  const users = useAppSelector(selectUsers);
  const jiraColumns = useAppSelector(selectJiraColumns);
  const pipelineTools = useAppSelector(selectPipelineTool);
  const targetFields = useAppSelector(selectMetricsContent).targetFields;
  const { cycleTimeSettings, cycleTimeSettingsType } = useAppSelector(selectMetricsContent);
  const dateRanges = useAppSelector(selectDateRange);
  const descendingSortedDateRanges = sortDateRanges(dateRanges);

  const { startDate, endDate } = descendingSortedDateRanges[0];
  const isShowCrewsAndRealDone =
    requiredData.includes(RequiredData.Velocity) ||
    requiredData.includes(RequiredData.CycleTime) ||
    requiredData.includes(RequiredData.Classification) ||
    requiredData.includes(RequiredData.ReworkTimes);
  const isShowRealDone =
    cycleTimeSettingsType === CycleTimeSettingsTypes.BY_COLUMN &&
    cycleTimeSettings.filter((e) => e.value === DONE).length > 1;
  const { getBoardInfo, isLoading, errorMessage, boardInfoFailedStatus } = useGetBoardInfoEffect();
  const shouldLoad = useAppSelector(shouldMetricsLoaded);
  const shouldGetBoardConfig = useAppSelector(selectShouldGetBoardConfig);

  const getInfo = useCallback(
    async () => {
      getBoardInfo({
        ...boardConfig,
        dateRanges,
      }).then((res) => {
        if (res && res.length) {
          const commonPayload = combineBoardInfo(res);
          dispatch(updateJiraVerifyResponse(commonPayload));
          dispatch(updateMetricsState(merge(commonPayload, { isProjectCreated: isProjectCreated })));
          dispatch(updateShouldGetBoardConfig(false));
          dispatch(updateFirstTimeRoadMetricsBoardData(false));
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const popup = () => {
      if (boardInfoFailedStatus === MetricsDataFailStatus.PartialFailed4xx) {
        dispatch(
          addNotification({
            type: 'warning',
            message: MESSAGE.BOARD_INFO_REQUEST_PARTIAL_FAILED_4XX,
          }),
        );
      } else if (
        boardInfoFailedStatus === MetricsDataFailStatus.PartialFailedNoCards ||
        boardInfoFailedStatus === MetricsDataFailStatus.PartialFailedTimeout
      ) {
        dispatch(
          addNotification({
            type: 'warning',
            message: MESSAGE.BOARD_INFO_REQUEST_PARTIAL_FAILED_OTHERS,
          }),
        );
      }
    };
    if (!isLoading) {
      popup();
    }
  }, [boardInfoFailedStatus, dispatch, isLoading]);

  useLayoutEffect(() => {
    if (!shouldLoad) return;
    dispatch(closeAllNotifications());
    if (!isShowCrewsAndRealDone || !shouldGetBoardConfig) return;
    getInfo();
  }, [shouldLoad, isShowCrewsAndRealDone, shouldGetBoardConfig, dispatch, getInfo]);

  return (
    <>
      {startDate && endDate && (
        <MetricSelectionHeader>
          <DateRangeViewer dateRangeList={descendingSortedDateRanges} />
        </MetricSelectionHeader>
      )}
      {isShowCrewsAndRealDone && (
        <MetricSelectionWrapper>
          {isLoading && <Loading />}
          <MetricsSelectionTitle aria-label='Board configuration title'>Board configuration </MetricsSelectionTitle>

          {isEmpty(errorMessage) ||
          (boardInfoFailedStatus !== MetricsDataFailStatus.AllFailed4xx &&
            boardInfoFailedStatus !== MetricsDataFailStatus.AllFailedTimeout &&
            boardInfoFailedStatus !== MetricsDataFailStatus.AllFailedNoCards) ? (
            <>
              <Crews options={users} title={'Crew settings'} label={'Included Crews'} />

              <CycleTime />

              {isShowRealDone && (
                <RealDone columns={jiraColumns} title={'Real done setting'} label={'Consider as Done'} />
              )}

              {requiredData.includes(RequiredData.Classification) && (
                <Classification
                  targetFields={targetFields}
                  title={'Classification setting'}
                  label={'Distinguished By'}
                />
              )}
              {requiredData.includes(RequiredData.ReworkTimes) && <ReworkSettings />}
              <Advance />
            </>
          ) : (
            <EmptyContent
              title={errorMessage.title}
              message={
                errorMessage.code !== AxiosRequestErrorCode.Timeout ? (
                  errorMessage.message
                ) : (
                  <>
                    <StyledErrorMessage>{errorMessage.message}</StyledErrorMessage>
                    {<StyledRetryButton onClick={getInfo}>try again</StyledRetryButton>}
                  </>
                )
              }
            />
          )}
        </MetricSelectionWrapper>
      )}

      {(requiredData.includes(RequiredData.DeploymentFrequency) ||
        requiredData.includes(RequiredData.PipelineChangeFailureRate) ||
        requiredData.includes(RequiredData.LeadTimeForChanges) ||
        requiredData.includes(RequiredData.PipelineMeanTimeToRecovery)) && (
        <>
          {pipelineTools.type !== PIPELINE_TOOL_OTHER_OPTION && (
            <MetricSelectionWrapper aria-label='Pipeline Configuration Section'>
              <MetricsSelectionTitle aria-label='Pipeline configuration title'>
                Pipeline configuration
              </MetricsSelectionTitle>
              <DeploymentFrequencySettings />
            </MetricSelectionWrapper>
          )}
          <MetricSelectionWrapper aria-label='Source Control Configuration Section'>
            <MetricsSelectionTitle aria-label='Source Control configuration title'>
              Source control configuration {pipelineTools.type !== PIPELINE_TOOL_OTHER_OPTION && '(optional)'}
            </MetricsSelectionTitle>
            <SourceControlConfiguration />
          </MetricSelectionWrapper>
        </>
      )}
    </>
  );
};

export default MetricsStep;
