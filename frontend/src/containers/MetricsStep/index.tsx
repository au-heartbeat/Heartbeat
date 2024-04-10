import {
  selectDateRange,
  selectIsProjectCreated,
  selectMetrics,
  updateBoardVerifyState,
  selectBoard,
  updateJiraVerifyResponse,
  selectUsers,
  selectJiraColumns,
} from '@src/context/config/configSlice';
import {
  selectMetricsContent,
  updateMetricsState,
  selectShouldGetBoardConfig,
  updateShouldGetBoardConfig,
  updateFirstTimeRoadMetricsBoardData,
} from '@src/context/Metrics/metricsSlice';
import {
  MetricSelectionHeader,
  MetricSelectionWrapper,
  MetricsSelectionTitle,
} from '@src/containers/MetricsStep/style';
import { CYCLE_TIME_SETTINGS_TYPES, DONE, REQUIRED_DATA, AXIOS_REQUEST_ERROR_CODE } from '@src/constants/resources';
import { DeploymentFrequencySettings } from '@src/containers/MetricsStep/DeploymentFrequencySettings';
import { StyledRetryButton, StyledErrorMessage } from '@src/containers/MetricsStep/style';
import { closeAllNotifications } from '@src/context/notification/NotificationSlice';
import { Classification } from '@src/containers/MetricsStep/Classification';
import { shouldMetricsLoad } from '@src/context/stepper/StepperSlice';
import DateRangeViewer from '@src/components/Common/DateRangeViewer';
import { useGetBoardInfoEffect } from '@src/hooks/useGetBoardInfo';
import { CycleTime } from '@src/containers/MetricsStep/CycleTime';
import { RealDone } from '@src/containers/MetricsStep/RealDone';
import EmptyContent from '@src/components/Common/EmptyContent';
import { useAppSelector, useAppDispatch } from '@src/hooks';
import { Crews } from '@src/containers/MetricsStep/Crews';
import { useCallback, useLayoutEffect } from 'react';
import { Loading } from '@src/components/Loading';
import { sortDateRanges } from '@src/utils/util';
import ReworkSettings from './ReworkSettings';
import { Advance } from './Advance/Advance';
import isEmpty from 'lodash/isEmpty';
import { theme } from '@src/theme';
import merge from 'lodash/merge';
import { uniqBy } from 'lodash';
import dayjs from 'dayjs';

const MetricsStep = () => {
  const boardConfig = useAppSelector(selectBoard);
  const isProjectCreated = useAppSelector(selectIsProjectCreated);
  const dispatch = useAppDispatch();
  const requiredData = useAppSelector(selectMetrics);
  const users = useAppSelector(selectUsers);
  const jiraColumns = useAppSelector(selectJiraColumns);
  const targetFields = useAppSelector(selectMetricsContent).targetFields;
  const { cycleTimeSettings, cycleTimeSettingsType } = useAppSelector(selectMetricsContent);
  const dateRanges = useAppSelector(selectDateRange);
  const descendingSortedDateRanges = sortDateRanges(dateRanges);
  const { startDate, endDate } = descendingSortedDateRanges[0];
  const isShowCrewsAndRealDone =
    requiredData.includes(REQUIRED_DATA.VELOCITY) ||
    requiredData.includes(REQUIRED_DATA.CYCLE_TIME) ||
    requiredData.includes(REQUIRED_DATA.CLASSIFICATION) ||
    requiredData.includes(REQUIRED_DATA.REWORK_TIMES);
  const isShowRealDone =
    cycleTimeSettingsType === CYCLE_TIME_SETTINGS_TYPES.BY_COLUMN &&
    cycleTimeSettings.filter((e) => e.value === DONE).length > 1;
  const { getBoardInfo, isLoading, errorMessage } = useGetBoardInfoEffect();
  const shouldLoad = useAppSelector(shouldMetricsLoad);
  const shouldGetBoardConfig = useAppSelector(selectShouldGetBoardConfig);

  const getInfo = useCallback(
    () => {
      const fetchData = async (range: { startDate: string | null; endDate: string | null }) => {
        const startTime = dayjs(range.startDate).valueOf().toString();
        const endTime = dayjs(range.endDate).valueOf().toString();

        const res = await getBoardInfo({
          ...boardConfig,
          startTime,
          endTime,
        });
        return res.data;
      };

      return Promise.all(dateRange.map(fetchData));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useLayoutEffect(() => {
    if (!shouldLoad) return;
    dispatch(closeAllNotifications());
    if (!isShowCrewsAndRealDone || !shouldGetBoardConfig) return;
    getInfo().then((results) => {
      if (results) {
        const allUsers = [...new Set(results.flatMap((result) => result.users))];
        const allTargetFields = uniqBy(
          results.flatMap((result) => result.targetFields),
          (elem) => [elem.key, elem.name, elem.flag].join(),
        );
        const allJiraColumns = uniqBy(
          results.flatMap((result) => result.jiraColumns),
          // @ts-ignore: ignore the lodash handle javascript object property name error
          (elem) => [elem.key, elem.value.name, ...elem.value.statuses].join(),
        );
        const allIgnoredTargetFields = uniqBy(
          results.flatMap((result) => result.ignoredTargetFields),
          (elem) => [elem.key, elem.name, elem.flag].join(),
        );
        const commonPayload = {
          users: allUsers,
          targetFields: allTargetFields,
          ignoredTargetFields: allIgnoredTargetFields,
          jiraColumns: allJiraColumns,
        };
        dispatch(updateBoardVerifyState(true));
        dispatch(updateJiraVerifyResponse(commonPayload));
        dispatch(updateMetricsState(merge(commonPayload, { isProjectCreated: isProjectCreated })));
        dispatch(updateShouldGetBoardConfig(false));
        dispatch(updateFirstTimeRoadMetricsBoardData(false));
      }
    });
  }, [shouldLoad, isShowCrewsAndRealDone, shouldGetBoardConfig, dispatch, getInfo]);

  return (
    <>
      {startDate && endDate && (
        <MetricSelectionHeader>
          <DateRangeViewer
            dateRanges={descendingSortedDateRanges}
            expandColor={theme.palette.text.disabled}
            expandBackgroundColor={theme.palette.secondary.dark}
          />
        </MetricSelectionHeader>
      )}

      {isShowCrewsAndRealDone && (
        <MetricSelectionWrapper>
          {isLoading && <Loading />}
          <MetricsSelectionTitle>Board configuration</MetricsSelectionTitle>
          {isEmpty(errorMessage) ? (
            <>
              <Crews options={users} title={'Crew settings'} label={'Included Crews'} />

              <CycleTime />

              {isShowRealDone && (
                <RealDone columns={jiraColumns} title={'Real done setting'} label={'Consider as Done'} />
              )}

              {requiredData.includes(REQUIRED_DATA.CLASSIFICATION) && (
                <Classification
                  targetFields={targetFields}
                  title={'Classification setting'}
                  label={'Distinguished By'}
                />
              )}
              {requiredData.includes(REQUIRED_DATA.REWORK_TIMES) && <ReworkSettings />}
              <Advance />
            </>
          ) : (
            <EmptyContent
              title={errorMessage.title}
              message={
                errorMessage.code !== AXIOS_REQUEST_ERROR_CODE.TIMEOUT ? (
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

      {(requiredData.includes(REQUIRED_DATA.DEPLOYMENT_FREQUENCY) ||
        requiredData.includes(REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE) ||
        requiredData.includes(REQUIRED_DATA.LEAD_TIME_FOR_CHANGES) ||
        requiredData.includes(REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY)) && (
        <MetricSelectionWrapper aria-label='Pipeline Configuration Section'>
          <MetricsSelectionTitle>Pipeline configuration</MetricsSelectionTitle>
          <DeploymentFrequencySettings />
        </MetricSelectionWrapper>
      )}
    </>
  );
};

export default MetricsStep;
