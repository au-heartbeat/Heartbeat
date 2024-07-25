import {
  pieOptionMapper,
  stackedAreaOptionMapper,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/ChartOption';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { LABEL_PERCENT } from '@src/containers/ReportStep/BoardMetricsChart';
import { ReportResponse } from '@src/clients/report/dto/response';
import React, { useEffect, useRef, useState } from 'react';
import { AnimationSeconds } from '@src/constants/commons';
import { showChart } from '@src/containers/ReportStep';
import { ChartType } from '@src/constants/resources';
import { theme } from '@src/theme';

enum ClassificationChartType {
  Pie = 'pie',
  Bar = 'bar',
}

enum ClassificationChartAnimationType {
  Start = 0,
  Mid = 1,
}

function extractClassificationData(classification: string, dateRanges: string[], mappedData: ReportResponse[]) {
  const data = mappedData.flatMap((item) => item.classification?.filter((it) => it.name === classification));
  const allSubtitle = [
    ...new Set(
      data
        .filter((it) => it !== undefined)
        .flatMap((it) => it!.valueList)
        .map((it) => it.name),
    ),
  ];
  const indicators: { data: number[]; name: string; type: string }[] = [];

  data
    .filter((it) => it !== undefined)
    .map((it) => it!.valueList)
    .forEach((it) => {
      allSubtitle.map((subtitle) => {
        if (it.every((item) => item.name !== subtitle)) {
          it.push({ name: subtitle, value: '0.00%' });
        }
      });
    });

  allSubtitle.forEach((item) => {
    const classificationValue: number[] = data
      .filter((it) => it !== undefined)
      .flatMap((it) => it!.valueList)
      .filter((it) => it.name === item)
      .map((it) => parseFloat(it.value));
    indicators.push({ data: classificationValue, name: item, type: 'bar' });
  });

  const trendInfo = { type: ChartType.Classification };

  return {
    xAxis: dateRanges,
    yAxis: {
      name: 'Value/Total cards',
      alignTick: false,
      axisLabel: LABEL_PERCENT,
    },
    series: indicators,
    color: [
      theme.main.boardChart.barColorA,
      theme.main.boardChart.barColorB,
      theme.main.boardChart.barColorC,
      theme.main.boardChart.barColorD,
      theme.main.boardChart.barColorE,
      theme.main.boardChart.barColorF,
      theme.main.boardChart.barColorG,
      theme.main.boardChart.barColorH,
      theme.main.boardChart.barColorI,
      theme.main.boardChart.barColorJ,
    ],
    trendInfo,
  };
}

function getTotalCardCounts(mappedData: ReportResponse[], classification: string) {
  return mappedData
    .flatMap((it) => it.classificationCardCount)
    .filter((it) => it?.name === classification)
    .map((it) => it!.totalCounts!)
    .reduce((res, it) => res + it, 0);
}

function extractedValueList(mappedData: ReportResponse[], classification: string) {
  return mappedData
    .flatMap((it) => it.classificationCardCount)
    .filter((it) => it?.name === classification)
    .flatMap((it) => it?.valueList);
}

function getAllSubtitles(mappedData: ReportResponse[], classification: string) {
  const data = extractedValueList(mappedData, classification);
  return [...new Set(data.filter((it) => it !== undefined).map((it) => it!.name))];
}

function getCardCountForSubtitle(data: ({ name: string; value: string } | undefined)[], subtitle: string) {
  return data
    .filter((it) => it !== undefined)
    .filter((it) => it!.name === subtitle)
    .reduce((res, cardInfo) => {
      return res + Number(cardInfo!.value);
    }, 0);
}

function checkClassificationChartType(classification: string, mappedData: ReportResponse[]) {
  const totalCardCounts = getTotalCardCounts(mappedData, classification);

  const data = extractedValueList(mappedData, classification);

  const totalCounts = data.filter((it) => it !== undefined).reduce((res, cardInfo) => res + Number(cardInfo?.value), 0);
  return totalCounts === totalCardCounts ? ClassificationChartType.Pie : ClassificationChartType.Bar;
}

function extractClassificationCardCountsPieData(classification: string, mappedData: ReportResponse[]) {
  const totalCardCounts = getTotalCardCounts(mappedData, classification);

  const data = extractedValueList(mappedData, classification);

  const allSubtitle = getAllSubtitles(mappedData, classification);
  const indicators: { value: string; name: string }[] = allSubtitle.map((subtitle) => {
    const cardCount = getCardCountForSubtitle(data, subtitle);
    return {
      name: subtitle,
      value: `${((cardCount * 100) / totalCardCounts).toFixed(2)}`,
    };
  });

  const trendInfo = { type: ChartType.Classification };

  return {
    series: indicators,
    color: [
      theme.main.boardChart.barColorA,
      theme.main.boardChart.barColorB,
      theme.main.boardChart.barColorC,
      theme.main.boardChart.barColorD,
      theme.main.boardChart.barColorE,
      theme.main.boardChart.barColorF,
      theme.main.boardChart.barColorG,
      theme.main.boardChart.barColorH,
      theme.main.boardChart.barColorI,
      theme.main.boardChart.barColorJ,
    ],
    trendInfo,
  };
}

function extractClassificationCardCountsBarData(classification: string, mappedData: ReportResponse[]) {
  const totalCardCounts = getTotalCardCounts(mappedData, classification);

  const data = extractedValueList(mappedData, classification);

  const allSubtitle = getAllSubtitles(mappedData, classification);
  const indicators = allSubtitle.map((subtitle) => {
    const cardCount = getCardCountForSubtitle(data, subtitle);
    return Number(((cardCount * 100) / totalCardCounts).toFixed(2));
  });

  const trendInfo = { type: ChartType.Classification };

  return {
    xAxis: {
      data: allSubtitle,
      boundaryGap: true,
      axisLabel: {
        color: 'black',
        alignMaxLabel: 'center',
        alignMinLabel: 'center',
      },
    },
    yAxis: [
      {
        name: '',
        alignTick: false,
        axisLabel: LABEL_PERCENT,
      },
    ],
    series: [
      {
        name: 'reverse',
        type: 'bar',
        data: indicators!,
        yAxisIndex: 0,
        setAreaStyle: false,
        smooth: false,
      },
    ],
    color: [
      theme.main.boardChart.barColorA,
      theme.main.boardChart.barColorB,
      theme.main.boardChart.barColorC,
      theme.main.boardChart.barColorD,
      theme.main.boardChart.barColorE,
      theme.main.boardChart.barColorF,
      theme.main.boardChart.barColorG,
      theme.main.boardChart.barColorH,
      theme.main.boardChart.barColorI,
      theme.main.boardChart.barColorJ,
    ],
    trendInfo,
  };
}

export const ClassificationChart = ({
  classification,
  mappedData,
  dateRanges,
}: {
  classification: string;
  mappedData: ReportResponse[];
  dateRanges: string[];
}) => {
  const [isFirstIntoClassification, setIsFirstIntoClassification] = useState<boolean>(true);
  const [isShowTimePeriodChart, setIsShowTimePeriodChart] = useState<boolean>(true);
  const [animationType, setAnimationType] = useState<ClassificationChartAnimationType>(
    ClassificationChartAnimationType.Start,
  );
  const [canSwitchChart, setCanSwitchChart] = useState<boolean>(true);
  const classificationRef = useRef<HTMLDivElement>(null);
  let classificationData;
  let classificationDataOption;
  if (isShowTimePeriodChart) {
    classificationData = extractClassificationData(classification, dateRanges, mappedData);
    classificationDataOption =
      classificationData && stackedBarOptionMapper(classificationData, true, isFirstIntoClassification);
  } else {
    const chartType = checkClassificationChartType(classification, mappedData);
    if (chartType === ClassificationChartType.Pie) {
      classificationData = extractClassificationCardCountsPieData(classification, mappedData);
      classificationDataOption = classificationData && pieOptionMapper(classificationData);
    } else {
      classificationData = extractClassificationCardCountsBarData(classification, mappedData);
      classificationDataOption =
        classificationData && stackedAreaOptionMapper(classificationData, true, isFirstIntoClassification);
    }
  }
  const isClassificationFinished =
    mappedData.flatMap((value) => value.classification).filter((it) => it?.name === classification)?.length ===
    dateRanges.length;
  const isOnlyOneLegend = classificationDataOption.legend.data?.length === 0;

  const switchChart = () => {
    if (canSwitchChart) {
      setIsFirstIntoClassification(false);
      setCanSwitchChart(false);
      setAnimationType(ClassificationChartAnimationType.Mid);
      const animationTimeout = setTimeout(
        () => {
          setIsShowTimePeriodChart(!isShowTimePeriodChart);
          setAnimationType(ClassificationChartAnimationType.Start);
          clearTimeout(animationTimeout);
        },
        (AnimationSeconds * 1000) / 2,
      );
      const canSwitchChartTimeout = setTimeout(() => {
        setCanSwitchChart(true);
        clearTimeout(canSwitchChartTimeout);
      }, AnimationSeconds * 1000);
    }
  };

  useEffect(() => {
    showChart(classificationRef.current, classificationDataOption);
  }, [classificationRef, classificationDataOption]);

  const transition = {
    transform: 'rotateY(0deg)',
    transition: `transform ${AnimationSeconds / 2}s linear`,
  };
  if (animationType === ClassificationChartAnimationType.Start) {
    transition.transform = 'rotateY(0deg)';
  } else {
    transition.transform = 'rotateY(90deg)';
  }

  return (
    <ChartAndTitleWrapper
      subTitle={classification}
      isLoading={!isClassificationFinished}
      trendInfo={classificationData.trendInfo}
      ref={classificationRef}
      isShowRepeat={!isOnlyOneLegend || !isShowTimePeriodChart}
      clickRepeat={switchChart}
      animationStyle={transition}
      disabledClickRepeatButton={!canSwitchChart}
    />
  );
};
