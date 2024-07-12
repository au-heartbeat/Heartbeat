import {
  GridContainer,
  StyledLoading,
  StyledMetricsSection,
  StyledRetry,
  StyledShowMore,
  StyledTitleWrapper,
} from '@src/containers/ReportStep/BoardMetrics/style';
import {
  BOARD_METRICS,
  BOARD_METRICS_MAPPING,
  MetricsSubtitle,
  MetricsTitle,
  REPORT_PAGE,
  RequiredData,
  RETRY,
  SHOW_MORE,
} from '@src/constants/resources';
import { ReportTitle } from '@src/components/Common/ReportGrid/ReportTitle';
import { selectMetricsContent } from '@src/context/Metrics/metricsSlice';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { ReportGrid } from '@src/components/Common/ReportGrid';
import { onlyEmptyAndDoneState } from '@src/utils/util';
import { Loading } from '@src/components/Loading';
import { useAppSelector } from '@src/hooks';
import React from 'react';

interface BoardMetricsProps {
  startToRequestBoardData: () => void;
  onShowDetail: () => void;
  boardReport: ReportResponseDTO | undefined;
  errorMessage: string;
  metrics: string[];
}

const BoardMetrics = ({
  startToRequestBoardData,
  onShowDetail,
  boardReport,
  errorMessage,
  metrics,
}: BoardMetricsProps) => {
  const { cycleTimeSettings } = useAppSelector(selectMetricsContent);

  const boardMetrics = metrics.filter((metric) => BOARD_METRICS.includes(metric));
  const boardingMappingStates = [...new Set(cycleTimeSettings.map((item) => item.value))];
  const isOnlyEmptyAndDoneState = onlyEmptyAndDoneState(boardingMappingStates);
  const boardMetricsCompleted = (
    isOnlyEmptyAndDoneState ? boardMetrics.filter((metric) => metric !== RequiredData.ReworkTimes) : boardMetrics
  )
    .map((metric) => BOARD_METRICS_MAPPING[metric])
    .every((metric) => boardReport?.[metric] ?? false);

  const getBoardItems = () => {
    const velocity = boardReport?.velocity;
    const cycleTime = boardReport?.cycleTime;

    const velocityItems = boardMetrics.includes(RequiredData.Velocity)
      ? [
          {
            title: MetricsTitle.Velocity,
            items: velocity && [
              {
                value: velocity.velocityForSP,
                subtitle: MetricsSubtitle.Velocity,
                isToFixed: false,
              },
              {
                value: velocity.velocityForCards,
                subtitle: MetricsSubtitle.Throughput,
                isToFixed: false,
              },
            ],
          },
        ]
      : [];

    const cycleTimeItems = boardMetrics.includes(RequiredData.CycleTime)
      ? [
          {
            title: MetricsTitle.CycleTime,
            items: cycleTime && [
              {
                value: cycleTime.averageCycleTimePerSP,
                subtitle: MetricsSubtitle.AverageCycleTimePerSP,
              },
              {
                value: cycleTime.averageCycleTimePerCard,
                subtitle: MetricsSubtitle.AverageCycleTimePerCard,
              },
            ],
          },
        ]
      : [];

    return [...velocityItems, ...cycleTimeItems];
  };

  const getReworkBoardItem = () => {
    const rework = boardReport?.rework;

    const reworkItems = boardMetrics.includes(RequiredData.ReworkTimes)
      ? [
          {
            title: MetricsTitle.Rework,
            items: rework && [
              {
                value: rework.totalReworkTimes,
                subtitle: MetricsSubtitle.TotalReworkTimes,
                isToFixed: false,
              },
              {
                value: rework.totalReworkCards,
                subtitle: MetricsSubtitle.TotalReworkCards,
                isToFixed: false,
              },
              {
                value: Number(rework.reworkCardsRatio) * 100,
                extraValue: `% (${rework.totalReworkCards}/${rework.throughput})`,
                subtitle: MetricsSubtitle.ReworkCardsRatio,
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
    boardMetrics[0] === RequiredData.Classification &&
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
