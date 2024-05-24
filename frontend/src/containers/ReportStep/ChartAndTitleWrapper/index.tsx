import { ChartTitle, TrendContainer, TrendIcon } from '@src/containers/ReportStep/ChartAndTitleWrapper/style';
import React, { ForwardedRef, forwardRef, ReactNode } from 'react';
import { ChartWrapper } from '@src/containers/MetricsStep/style';
import { CHART_TYPE } from '@src/constants/resources';
import { Tooltip } from '@mui/material';

export interface ITrendInfo {
  color: string;
  icon: ReactNode;
  trendPercent: string;
  dateRangeList: string[];
}

const ChartAndTitleWrapper = forwardRef(
  (
    {
      trendInfo,
      type,
    }: {
      trendInfo: ITrendInfo | undefined;
      type: CHART_TYPE;
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
          {type}
          {trendInfo && (
            <Tooltip title={tipContent} arrow>
              <TrendContainer color={trendInfo.color}>
                <TrendIcon>{trendInfo.icon}</TrendIcon>
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
