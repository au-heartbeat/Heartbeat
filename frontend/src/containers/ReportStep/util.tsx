import { ITrendInfo } from '@src/containers/ReportStep/ChartAndTitleWrapper';
import TrendingDownSharpIcon from '@mui/icons-material/TrendingDownSharp';
import TrendingUpSharpIcon from '@mui/icons-material/TrendingUpSharp';
import { covertNumberToPercent } from '@src/utils/util';
import { CHART_TYPE } from '@src/constants/resources';
import { theme } from '@src/theme';
import React from 'react';

export const getColorAndTrendIcon = (trendInfo: Record<string, undefined | number | string[]>, type: CHART_TYPE) => {
  const trendNumber = trendInfo.trend as number;
  if (trendNumber === undefined) return;

  const result: ITrendInfo = {
    trendPercent: covertNumberToPercent(trendNumber),
    dateRangeList: trendInfo.dateRangeList as string[],
  } as ITrendInfo;

  switch (type) {
    case CHART_TYPE.VELOCITY:
    case CHART_TYPE.CYCLE_TIME_ALLOCATION:
    case CHART_TYPE.DEPLOYMENT_FREQUENCY:
      if (trendNumber >= 0) {
        result.color = theme.main.chartTrend.betterColor;
        result.icon = <TrendingUpSharpIcon />;
      } else {
        result.color = theme.main.chartTrend.worseColor;
        result.icon = <TrendingDownSharpIcon />;
      }
      break;
    case CHART_TYPE.REWORK:
    case CHART_TYPE.AVERAGE_CYCLE_TIME:
    case CHART_TYPE.LEAD_TIME_FOR_CHANGES:
    case CHART_TYPE.DEV_MEAN_TIME_TO_RECOVERY:
    case CHART_TYPE.DEV_CHANGE_FAILURE_RATE:
      if (trendNumber <= 0) {
        result.color = theme.main.chartTrend.betterColor;
        result.icon = <TrendingDownSharpIcon />;
      } else {
        result.color = theme.main.chartTrend.worseColor;
        result.icon = <TrendingUpSharpIcon />;
      }
      break;
  }
  return result;
};
