import {
  ChartDiv,
  ChartTitle,
  StyledTooltipContent,
  TrendContainer,
  TrendIconSpan,
  TrendTypeIcon,
} from '@src/containers/ReportStep/ChartAndTitleWrapper/style';
import { CHART_TREND_TIP, ChartType, TrendIcon, TrendType, UP_TREND_IS_BETTER } from '@src/constants/resources';
import TrendingDownSharpIcon from '@mui/icons-material/TrendingDownSharp';
import TrendingUpSharpIcon from '@mui/icons-material/TrendingUpSharp';
import { ChartWrapper } from '@src/containers/MetricsStep/style';
import { convertNumberToPercent } from '@src/utils/util';
import React, { ForwardedRef, forwardRef } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Loading } from '@src/components/Loading';
import { Tooltip } from '@mui/material';
import { theme } from '@src/theme';

export interface ITrendInfo {
  icon?: TrendIcon;
  trendNumber?: number;
  dateRangeList?: string[];
  type: ChartType;
  trendType?: TrendType;
}

const TREND_ICON_MAPPING = {
  [TrendIcon.Up]: <TrendingUpSharpIcon aria-label={'trend up'} />,
  [TrendIcon.Down]: <TrendingDownSharpIcon aria-label={'trend down'} />,
};

const TREND_COLOR_MAP = {
  [TrendType.Better]: theme.main.chartTrend.betterColor,
  [TrendType.Worse]: theme.main.chartTrend.worseColor,
};

const DECREASE = 'decrease';
const INCREASE = 'increase';

const ChartAndTitleWrapper = forwardRef(
  (
    {
      trendInfo,
      isLoading,
    }: {
      trendInfo: ITrendInfo;
      isLoading: boolean;
    },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const trendDescribe = () => {
      if (trendInfo.trendNumber === undefined) return '';
      if (trendInfo.trendNumber > 0) {
        return INCREASE;
      } else if (trendInfo.trendNumber < 0) {
        return DECREASE;
      } else if (UP_TREND_IS_BETTER.includes(trendInfo.type)) {
        return INCREASE;
      } else {
        return DECREASE;
      }
    };
    const tipContent = (
      <StyledTooltipContent>
        <p>{`The rate of ${trendDescribe()} for ${CHART_TREND_TIP[trendInfo.type]}: `}</p>
        {trendInfo.dateRangeList?.map((dateRange) => <p key={dateRange}>{dateRange}</p>)}
        <TrendTypeIcon color={TREND_COLOR_MAP[trendInfo.trendType!]} reverse={trendInfo.trendType === TrendType.Worse}>
          <ThumbUpIcon />
        </TrendTypeIcon>
      </StyledTooltipContent>
    );

    return (
      <ChartDiv>
        {isLoading && (
          <Loading size='1.5rem' backgroundColor='transparent' aria-label={trendInfo.type.toLowerCase() + ' loading'} />
        )}
        <ChartTitle>
          {trendInfo.type}
          {trendInfo.trendNumber !== undefined && !isLoading && (
            <Tooltip title={tipContent} arrow>
              <TrendContainer
                color={TREND_COLOR_MAP[trendInfo.trendType!]}
                aria-label={trendInfo.type + ' trend container'}
              >
                <TrendIconSpan>{TREND_ICON_MAPPING[trendInfo.icon!]}</TrendIconSpan>
                <span aria-label='trend number'>{convertNumberToPercent(trendInfo.trendNumber)}</span>
              </TrendContainer>
            </Tooltip>
          )}
        </ChartTitle>
        <ChartWrapper ref={ref} aria-label={trendInfo.type.toLowerCase() + ' chart'}></ChartWrapper>
      </ChartDiv>
    );
  },
);
export default ChartAndTitleWrapper;
