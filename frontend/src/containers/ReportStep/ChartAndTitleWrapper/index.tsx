import { ChartTitle, TrendContainer, TrendIcon } from '@src/containers/ReportStep/ChartAndTitleWrapper/style';
import React, { ForwardedRef, forwardRef, ReactNode } from 'react';
import { ChartWrapper } from '@src/containers/MetricsStep/style';
import { CHART_TYPE } from '@src/constants/resources';

export interface ITrendInfo {
  color: string;
  icon: ReactNode;
  trendPercent: string;
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
    return (
      <div>
        <ChartTitle>
          {type}
          {trendInfo && (
            <TrendContainer color={trendInfo.color}>
              <TrendIcon>{trendInfo.icon}</TrendIcon>
              {trendInfo.trendPercent}
            </TrendContainer>
          )}
        </ChartTitle>
        <ChartWrapper ref={ref}></ChartWrapper>
      </div>
    );
  },
);
export default ChartAndTitleWrapper;
