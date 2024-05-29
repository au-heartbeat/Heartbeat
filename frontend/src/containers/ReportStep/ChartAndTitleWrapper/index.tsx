import {
  ChartTitle,
  StyledToolTipContent,
  TrendContainer,
  TrendIcon,
} from '@src/containers/ReportStep/ChartAndTitleWrapper/style';
import { CHART_TREND_TIP, CHART_TYPE, TREND_ICON, UP_TREND_IS_BETTER } from '@src/constants/resources';
import TrendingDownSharpIcon from '@mui/icons-material/TrendingDownSharp';
import TrendingUpSharpIcon from '@mui/icons-material/TrendingUpSharp';
import { ChartWrapper } from '@src/containers/MetricsStep/style';
import { convertNumberToPercent } from '@src/utils/util';
import React, { ForwardedRef, forwardRef } from 'react';
import { Tooltip } from '@mui/material';

export interface ITrendInfo {
  color?: string;
  icon?: TREND_ICON;
  trendNumber?: number;
  dateRangeList?: string[];
  type: CHART_TYPE;
}

const TREND_ICON_MAPPING = {
  [TREND_ICON.UP]: <TrendingUpSharpIcon />,
  [TREND_ICON.DOWN]: <TrendingDownSharpIcon />,
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
      } else if (UP_TREND_IS_BETTER.includes(trendInfo.type)){
        return INCREASE;
      } else {
        return DECREASE;
      }
    };
    const tipContent = (
      <StyledToolTipContent>
        <p>{`The rate of ${trendDescribe()} for ${CHART_TREND_TIP[trendInfo.type]}: `}</p>
        {trendInfo.dateRangeList?.map((dateRange) => <p key={dateRange}>{dateRange}</p>)}
      </StyledToolTipContent>
    );

    return (
      <div>
        <ChartTitle>
          {trendInfo.type}
          {trendInfo.trendNumber !== undefined && (
            <Tooltip title={tipContent} arrow>
              <TrendContainer color={trendInfo.color!}>
                <TrendIcon>{TREND_ICON_MAPPING[trendInfo.icon!]}</TrendIcon>
                {convertNumberToPercent(trendInfo.trendNumber)}
              </TrendContainer>
            </Tooltip>
          )}
        </ChartTitle>
        <ChartWrapper ref={ref}></ChartWrapper>
      </div>
    );
  },
);
export default ChartAndTitleWrapper;
