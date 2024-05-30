import {
  ChartTitle,
  StyledTooltipContent,
  TrendContainer,
  TrendIcon,
  TrendTypeIcon,
} from '@src/containers/ReportStep/ChartAndTitleWrapper/style';
import { CHART_TREND_TIP, CHART_TYPE, TREND_ICON, TREND_TYPE, UP_TREND_IS_BETTER } from '@src/constants/resources';
import TrendingDownSharpIcon from '@mui/icons-material/TrendingDownSharp';
import TrendingUpSharpIcon from '@mui/icons-material/TrendingUpSharp';
import { ChartWrapper } from '@src/containers/MetricsStep/style';
import { convertNumberToPercent } from '@src/utils/util';
import React, { ForwardedRef, forwardRef } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Tooltip } from '@mui/material';
import { theme } from '@src/theme';

export interface ITrendInfo {
  icon?: TREND_ICON;
  trendNumber?: number;
  dateRangeList?: string[];
  type: CHART_TYPE;
  trendType?: TREND_TYPE;
}

const TREND_ICON_MAPPING = {
  [TREND_ICON.UP]: <TrendingUpSharpIcon aria-label={'trend up'} />,
  [TREND_ICON.DOWN]: <TrendingDownSharpIcon aria-label={'trend down'} />,
};

const TREND_COLOR_MAP = {
  [TREND_TYPE.BETTER]: theme.main.chartTrend.betterColor,
  [TREND_TYPE.WORSE]: theme.main.chartTrend.worseColor,
};

const DECREASE = 'decrease';
const INCREASE = 'increase';

const ChartAndTitleWrapper = forwardRef(
  (
    {
      trendInfo,
    }: {
      trendInfo: ITrendInfo;
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
        <TrendTypeIcon color={TREND_COLOR_MAP[trendInfo.trendType!]} reverse={trendInfo.trendType === TREND_TYPE.WORSE}>
          <ThumbUpIcon />
        </TrendTypeIcon>
      </StyledTooltipContent>
    );

    return (
      <div>
        <ChartTitle>
          {trendInfo.type}
          {trendInfo.trendNumber !== undefined && (
            <Tooltip title={tipContent} arrow>
              <TrendContainer
                color={TREND_COLOR_MAP[trendInfo.trendType!]}
                aria-label={trendInfo.type + ' trend container'}
              >
                <TrendIcon>{TREND_ICON_MAPPING[trendInfo.icon!]}</TrendIcon>
                <span aria-label='trend number'>{convertNumberToPercent(trendInfo.trendNumber)}</span>
              </TrendContainer>
            </Tooltip>
          )}
        </ChartTitle>
        <ChartWrapper ref={ref} aria-label={trendInfo.type.toLowerCase() + ' chart'}></ChartWrapper>
      </div>
    );
  },
);
export default ChartAndTitleWrapper;
