import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

import {
  oneLineOptionMapper,
  Series,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/DoraMetricsChart/ChartOption';
import { CHART_TYPE, EMPTY_DATA_MAPPER_DORA_CHART, METRICS_SUBTITLE, REQUIRED_DATA } from '@src/constants/resources';
import { ReportResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { getColorAndTrendIcon } from '@src/containers/ReportStep/util';
import { ChartContainer } from '@src/containers/MetricsStep/style';
import { reportMapper } from '@src/hooks/reportMapper/report';
import { calculateTrend } from '@src/utils/util';
import { theme } from '@src/theme';

interface DoraMetricsChartProps {
  dateRanges: string[];
  data: (ReportResponseDTO | undefined)[];
}

const NO_LABEL = '';
const LABEL_PERCENT = '%';

function extractedStackedBarData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const extractedName = mappedData?.[0].leadTimeForChangesList?.[0].valuesList.map((item) => item.name);
  const extractedValues = mappedData?.map((data) =>
    data.leadTimeForChangesList?.[0].valuesList.map((item) => {
      return Number(item.value!);
    }),
  );
  const prLeadTimeValues = extractedValues?.map((value) => value![0]);
  const trendInfo = calculateTrend(prLeadTimeValues, allDateRanges);

  return {
    legend: 'Lead Time For Change',
    xAxis: allDateRanges,
    yAxis: {
      name: 'Hours',
      alignTick: false,
      axisLabel: NO_LABEL,
    },

    series: extractedName?.map((name, index) => {
      const series: Series = {
        name: name,
        type: 'bar',
        data: extractedValues!.map((value) => {
          return value![index];
        }),
      };
      return series;
    }),

    color: [theme.main.doraChart.barColorA, theme.main.doraChart.barColorB, theme.main.doraChart.barColorC],
    trendInfo,
  };
}

function extractedDeploymentFrequencyData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const data = mappedData?.map((item) => item.deploymentFrequencyList);
  const value = data?.map((item) => {
    return Number(item?.[0].valueList[0].value) || 0;
  });
  const trendInfo = calculateTrend(value, allDateRanges);
  return {
    legend: REQUIRED_DATA.DEPLOYMENT_FREQUENCY,
    xAxis: allDateRanges,
    yAxis: {
      name: 'Deployments/Days',
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: {
      name: REQUIRED_DATA.DEPLOYMENT_FREQUENCY,
      type: 'line',
      data: value!,
    },
    color: theme.main.doraChart.deploymentFrequencyChartColor,
    trendInfo,
  };
}

function extractedChangeFailureRateData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const data = mappedData?.map((item) => item.devChangeFailureRateList);
  const valueStr = data?.map((item) => {
    return item?.[0].valueList[0].value as string;
  });
  const value = valueStr?.map((item) => Number(item?.split('%', 1)[0]));
  const trendInfo = calculateTrend(value, allDateRanges);
  return {
    legend: REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE,
    xAxis: allDateRanges,
    yAxis: {
      name: METRICS_SUBTITLE.FAILURE_RATE,
      axisLabel: LABEL_PERCENT,
      alignTick: false,
    },
    series: {
      name: REQUIRED_DATA.DEV_CHANGE_FAILURE_RATE,
      type: 'line',
      data: value!,
    },
    color: theme.main.doraChart.devChangeFailureRateColor,
    trendInfo,
  };
}

function extractedMeanTimeToRecoveryDataData(allDateRanges: string[], mappedData: ReportResponse[] | undefined) {
  const data = mappedData?.map((item) => item.devMeanTimeToRecoveryList);
  const value = data?.map((item) => {
    return Number(item?.[0].valueList[0].value) || 0;
  });
  const trendInfo = calculateTrend(value, allDateRanges);
  return {
    legend: REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY,
    xAxis: allDateRanges,
    yAxis: {
      name: 'Hours',
      alignTick: false,
      axisLabel: NO_LABEL,
    },
    series: {
      name: REQUIRED_DATA.DEV_MEAN_TIME_TO_RECOVERY,
      type: 'line',
      data: value!,
    },
    color: theme.main.doraChart.devMeanTimeToRecoveryColor,
    trendInfo,
  };
}

export const DoraMetricsChart = ({ data, dateRanges }: DoraMetricsChartProps) => {
  const LeadTimeForChange = useRef<HTMLDivElement>(null);
  const deploymentFrequency = useRef<HTMLDivElement>(null);
  const changeFailureRate = useRef<HTMLDivElement>(null);
  const MeanTimeToRecovery = useRef<HTMLDivElement>(null);

  const mappedData = data.map((currentData) => {
    if (!currentData?.doraMetricsCompleted) {
      return EMPTY_DATA_MAPPER_DORA_CHART('');
    } else {
      return reportMapper(currentData);
    }
  });

  const LeadTimeForChangeData = extractedStackedBarData(dateRanges, mappedData);
  const deploymentFrequencyData = extractedDeploymentFrequencyData(dateRanges, mappedData);
  const changeFailureRateData = extractedChangeFailureRateData(dateRanges, mappedData);
  const meanTimeToRecoveryData = extractedMeanTimeToRecoveryDataData(dateRanges, mappedData);
  useEffect(() => {
    const LeadTimeForChangeChart = echarts.init(LeadTimeForChange.current);

    const option = LeadTimeForChangeData && stackedBarOptionMapper(LeadTimeForChangeData);
    LeadTimeForChangeChart.setOption(option);
    return () => {
      LeadTimeForChangeChart.dispose();
    };
  }, [LeadTimeForChange, LeadTimeForChangeData, dateRanges, mappedData]);

  useEffect(() => {
    const deploymentFrequencyChart = echarts.init(deploymentFrequency.current);
    const option = deploymentFrequencyData && oneLineOptionMapper(deploymentFrequencyData);
    deploymentFrequencyChart.setOption(option);
    return () => {
      deploymentFrequencyChart.dispose();
    };
  }, [deploymentFrequency, dateRanges, mappedData, deploymentFrequencyData]);

  useEffect(() => {
    const changeFailureRateChart = echarts.init(changeFailureRate.current);
    const option = changeFailureRateData && oneLineOptionMapper(changeFailureRateData);
    changeFailureRateChart.setOption(option);
    return () => {
      changeFailureRateChart.dispose();
    };
  }, [changeFailureRate, changeFailureRateData, dateRanges, mappedData]);

  useEffect(() => {
    const MeanTimeToRecoveryChart = echarts.init(MeanTimeToRecovery.current);
    const option = meanTimeToRecoveryData && oneLineOptionMapper(meanTimeToRecoveryData);
    MeanTimeToRecoveryChart.setOption(option);
    return () => {
      MeanTimeToRecoveryChart.dispose();
    };
  }, [MeanTimeToRecovery, dateRanges, mappedData, meanTimeToRecoveryData]);

  const leadTimeForChangeColorAndTrendIcon = getColorAndTrendIcon(
    LeadTimeForChangeData.trendInfo,
    CHART_TYPE.LEAD_TIME_FOR_CHANGES,
  );
  const deploymentFrequencyColorAndTrendIcon = getColorAndTrendIcon(
    deploymentFrequencyData.trendInfo,
    CHART_TYPE.DEPLOYMENT_FREQUENCY,
  );
  const changeFailureRateColorAndTrendIcon = getColorAndTrendIcon(
    changeFailureRateData.trendInfo,
    CHART_TYPE.DEV_CHANGE_FAILURE_RATE,
  );
  const meanTimeToRecoveryColorAndTrendIcon = getColorAndTrendIcon(
    meanTimeToRecoveryData.trendInfo,
    CHART_TYPE.DEV_MEAN_TIME_TO_RECOVERY,
  );

  return (
    <ChartContainer>
      <ChartAndTitleWrapper
        trendInfo={leadTimeForChangeColorAndTrendIcon}
        ref={LeadTimeForChange}
        type={CHART_TYPE.LEAD_TIME_FOR_CHANGES}
      />
      <ChartAndTitleWrapper
        trendInfo={deploymentFrequencyColorAndTrendIcon}
        ref={deploymentFrequency}
        type={CHART_TYPE.DEPLOYMENT_FREQUENCY}
      />
      <ChartAndTitleWrapper
        trendInfo={changeFailureRateColorAndTrendIcon}
        ref={changeFailureRate}
        type={CHART_TYPE.DEV_CHANGE_FAILURE_RATE}
      />
      <ChartAndTitleWrapper
        trendInfo={meanTimeToRecoveryColorAndTrendIcon}
        ref={MeanTimeToRecovery}
        type={CHART_TYPE.DEV_MEAN_TIME_TO_RECOVERY}
      />
    </ChartContainer>
  );
};
