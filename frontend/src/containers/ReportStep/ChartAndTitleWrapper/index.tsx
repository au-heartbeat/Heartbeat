import { ChartTitle, TrendContainer, TrendIcon } from '@src/containers/ReportStep/ChartAndTitleWrapper/style';
import TrendingDownSharpIcon from '@mui/icons-material/TrendingDownSharp';
import TrendingUpSharpIcon from '@mui/icons-material/TrendingUpSharp';
import { CHART_TYPE, TREND_ICON } from '@src/constants/resources';
import { ChartWrapper } from '@src/containers/MetricsStep/style';
import React, { ForwardedRef, forwardRef } from 'react';
import { Tooltip } from '@mui/material';

export interface ITrendInfo {
  color: string;
  icon: TREND_ICON;
  trendPercent: string;
  dateRangeList: string[];
  type: CHART_TYPE;
}

const TREND_ICON_MAPPING = {
  [TREND_ICON.UP]: <TrendingUpSharpIcon />,
  [TREND_ICON.DOWN]: <TrendingDownSharpIcon />,
};

const ChartAndTitleWrapper = forwardRef(
  (
    {
      trendInfo,
    }: {
      trendInfo: ITrendInfo;
    },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const tipContent = (
      <>
        <p>The rate of decrease for Total development time/Total cycle time: </p>
        {trendInfo?.dateRangeList.map((dateRange, index) => <p key={index}>{dateRange}</p>)}
      </>
    );

    return (
      <div>
        <ChartTitle>
          {trendInfo.type}
          {trendInfo && (
            <Tooltip title={tipContent} arrow>
              <TrendContainer color={trendInfo.color}>
                <TrendIcon>{TREND_ICON_MAPPING[trendInfo.icon]}</TrendIcon>
                {trendInfo.trendPercent}
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
