import {
  BOARD_METRICS,
  BOARD_METRICS_MAPPING,
  METRICS_SUBTITLE,
  METRICS_TITLE,
  REPORT_PAGE,
  REQUIRED_DATA,
  RETRY,
  SHOW_MORE,
} from '@src/constants/resources';
import {
  filterAndMapCycleTimeSettings,
  formatDuplicatedNameWithSuffix,
  getJiraBoardToken,
  getRealDoneStatus,
  onlyEmptyAndDoneState,
} from '@src/utils/util';
import {
  StyledLoading,
  StyledMetricsSection,
  StyledRetry,
  StyledShowMore,
  StyledTitleWrapper,
} from '@src/containers/ReportStep/BoardMetrics/BoardMetrics';
<<<<<<< HEAD
import { IBasicReportRequestDTO, ReportRequestDTO } from '@src/clients/report/dto/request';
=======
>>>>>>> cbcfdc9c5 (ADM-873: [frontend]refactor: extract getReportRequestBody from BoardMetrics and DoraMetrics)
import { GridContainer } from '@src/containers/ReportStep/BoardMetrics/style';
import { ReportTitle } from '@src/components/Common/ReportGrid/ReportTitle';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { ReportGrid } from '@src/components/Common/ReportGrid';
import { selectConfig } from '@src/context/config/configSlice';
import { Loading } from '@src/components/Loading';
import { useAppSelector } from '@src/hooks';
import React from 'react';

interface BoardMetricsProps {
  startToRequestBoardData: () => void;
  onShowDetail: () => void;
  boardReport?: ReportResponseDTO;
  errorMessage: string;
}

const BoardMetrics = ({ startToRequestBoardData, onShowDetail, boardReport, errorMessage }: BoardMetricsProps) => {
  const configData = useAppSelector(selectConfig);

  const { metrics } = configData.basic;
  const boardMetrics = metrics.filter((metric) => BOARD_METRICS.includes(metric));
<<<<<<< HEAD
  const boardingMappingStates = [...new Set(cycleTimeSettings.map((item) => item.value))];
  const isOnlyEmptyAndDoneState = onlyEmptyAndDoneState(boardingMappingStates);
  const includeRework = boardMetrics.includes(REQUIRED_DATA.REWORK_TIMES);
=======
>>>>>>> cbcfdc9c5 (ADM-873: [frontend]refactor: extract getReportRequestBody from BoardMetrics and DoraMetrics)
  const boardMetricsCompleted = boardMetrics
    .map((metric) => BOARD_METRICS_MAPPING[metric])
    .every((metric) => boardReport?.[metric] ?? false);

<<<<<<< HEAD
  const getBoardReportRequestBody = (): IBasicReportRequestDTO => {
    return {
      metrics: boardMetrics,
      startTime: dayjs(startDate).valueOf().toString(),
      endTime: dayjs(endDate).valueOf().toString(),
      considerHoliday: calendarType === CALENDAR.CHINA,
      jiraBoardSetting: {
        token: jiraToken,
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
      },
      csvTimeStamp: csvTimeStamp,
      metricTypes: ['board'],
    };
  };

=======
>>>>>>> cbcfdc9c5 (ADM-873: [frontend]refactor: extract getReportRequestBody from BoardMetrics and DoraMetrics)
  const getBoardItems = () => {
    const velocity = boardReport?.velocity;
    const cycleTime = boardReport?.cycleTime;

    const velocityItems = boardMetrics.includes(REQUIRED_DATA.VELOCITY)
      ? [
          {
            title: METRICS_TITLE.VELOCITY,
            items: velocity && [
              {
                value: velocity.velocityForSP,
                subtitle: METRICS_SUBTITLE.VELOCITY,
                isToFixed: false,
              },
              {
                value: velocity.velocityForCards,
                subtitle: METRICS_SUBTITLE.THROUGHPUT,
                isToFixed: false,
              },
            ],
          },
        ]
      : [];

    const cycleTimeItems = boardMetrics.includes(REQUIRED_DATA.CYCLE_TIME)
      ? [
          {
            title: METRICS_TITLE.CYCLE_TIME,
            items: cycleTime && [
              {
                value: cycleTime.averageCycleTimePerSP,
                subtitle: METRICS_SUBTITLE.AVERAGE_CYCLE_TIME_PRE_SP,
              },
              {
                value: cycleTime.averageCycleTimePerCard,
                subtitle: METRICS_SUBTITLE.AVERAGE_CYCLE_TIME_PRE_CARD,
              },
            ],
          },
        ]
      : [];

    return [...velocityItems, ...cycleTimeItems];
  };

  const getReworkBoardItem = () => {
    const rework = boardReport?.rework;

    const reworkItems = boardMetrics.includes(REQUIRED_DATA.REWORK_TIMES)
      ? [
          {
            title: METRICS_TITLE.REWORK,
            items: rework && [
              {
                value: rework.totalReworkTimes,
                subtitle: METRICS_SUBTITLE.TOTAL_REWORK_TIMES,
                isToFixed: false,
              },
              {
                value: rework.totalReworkCards,
                subtitle: METRICS_SUBTITLE.TOTAL_REWORK_CARDS,
                isToFixed: false,
              },
              {
                value: Number(rework.reworkCardsRatio) * 100,
                extraValue: `% (${rework.totalReworkCards}/${rework.throughput})`,
                subtitle: METRICS_SUBTITLE.REWORK_CARDS_RATIO,
              },
            ],
          },
        ]
      : [];
    return [...reworkItems];
  };

  const handleRetry = () => {
    startToRequestBoardData();
  };

  const isShowMoreLoadingDisplay = () =>
    boardMetrics.length === 1 &&
    boardMetrics[0] === REQUIRED_DATA.CLASSIFICATION &&
    !errorMessage &&
    !boardReport?.boardMetricsCompleted;

  return (
    <>
      <StyledMetricsSection>
        <StyledTitleWrapper>
          <ReportTitle title={REPORT_PAGE.BOARD.TITLE} />
          {!errorMessage && boardMetricsCompleted && (
            <StyledShowMore onClick={onShowDetail}>{SHOW_MORE}</StyledShowMore>
          )}
          {isShowMoreLoadingDisplay() && (
            <StyledLoading>
              <Loading placement='left' size='0.8rem' backgroundColor='transparent' />
            </StyledLoading>
          )}
          {errorMessage && <StyledRetry onClick={handleRetry}>{RETRY}</StyledRetry>}
        </StyledTitleWrapper>
        <GridContainer>
          <ReportGrid reportDetails={getBoardItems()} errorMessage={errorMessage} lastGrid={true} />
          {!isOnlyEmptyAndDoneState && (
            <ReportGrid reportDetails={getReworkBoardItem()} errorMessage={errorMessage} lastGrid={true} />
          )}
        </GridContainer>
      </StyledMetricsSection>
    </>
  );
};

export default BoardMetrics;
