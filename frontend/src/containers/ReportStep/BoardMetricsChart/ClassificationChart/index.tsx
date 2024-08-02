import {
  pieOptionMapper,
  stackedAreaOptionMapper,
  stackedBarOptionMapper,
} from '@src/containers/ReportStep/ChartOption';
import { ANIMATION_SECONDS, EVERY_FRAME_MILLISECOND, MILLISECONDS_PER_SECOND } from '@src/constants/commons';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { LABEL_PERCENT } from '@src/containers/ReportStep/BoardMetricsChart';
import { ReportResponse } from '@src/clients/report/dto/response';
import React, { useEffect, useRef, useState } from 'react';
import { showChart } from '@src/containers/ReportStep';
import { ChartType } from '@src/constants/resources';
import { theme } from '@src/theme';

enum ClassificationChartType {
  Pie = 'pie',
  Bar = 'bar',
}

const PERCENTAGE_NUMBER = 100;

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
    .map((it) => it!.totalCount!)
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
      name: `${subtitle}: ${cardCount}`,
      value: `${((cardCount * PERCENTAGE_NUMBER) / totalCardCounts).toFixed(2)}`,
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
    return Number(((cardCount * PERCENTAGE_NUMBER) / totalCardCounts).toFixed(2));
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
        name: 'Value/Total cards',
        alignTick: false,
        axisLabel: LABEL_PERCENT,
      },
    ],
    series: [
      {
        name: classification,
        type: 'bar',
        data: indicators,
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
  allDateRangeLoadingFinished,
}: {
  classification: string;
  mappedData: ReportResponse[];
  dateRanges: string[];
  allDateRangeLoadingFinished: boolean;
}) => {
  const [isFirstIntoClassification, setIsFirstIntoClassification] = useState<boolean>(true);
  const [isShowTimePeriodChart, setIsShowTimePeriodChart] = useState<boolean>(true);
  const [canSwitchChart, setCanSwitchChart] = useState<boolean>(true);
  const [rotate, setRotate] = useState<number>(0);
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

  const transition = {
    transform: `rotateY(${rotate}deg)`,
  };
  const maxRotateDeg = 90;

  const getAccelerate = (maxRotation: number, seconds: number) => {
    return maxRotation / Math.pow(seconds / 2, 2);
  };
  const accelerate = getAccelerate(maxRotateDeg, ANIMATION_SECONDS);

  let id: number;
  let start: number = 0;
  function animationStep(timestamp: number) {
    if (start === 0) {
      start = timestamp;
    }
    const elapsed = timestamp - start;

    const newRotate = accelerate * Math.pow(elapsed / 1000, 2);
    if (elapsed < (ANIMATION_SECONDS * MILLISECONDS_PER_SECOND) / 2) {
      setRotate(newRotate);
    } else {
      setRotate(maxRotateDeg);
      const newRotate =
        maxRotateDeg - accelerate * Math.pow((elapsed - (ANIMATION_SECONDS * MILLISECONDS_PER_SECOND) / 2) / 1000, 2);
      setRotate(newRotate < 0 ? 0 : newRotate);
    }

    if (Math.abs(elapsed - (ANIMATION_SECONDS * MILLISECONDS_PER_SECOND) / 2) < EVERY_FRAME_MILLISECOND) {
      setIsShowTimePeriodChart(!isShowTimePeriodChart);
    }

    if (elapsed < ANIMATION_SECONDS * MILLISECONDS_PER_SECOND + EVERY_FRAME_MILLISECOND) {
      id = window.requestAnimationFrame(animationStep);
    } else {
      setRotate(0);
      window.cancelAnimationFrame(id);
      setCanSwitchChart(true);
    }
  }
  const switchChart = () => {
    if (canSwitchChart) {
      setIsFirstIntoClassification(false);
      setCanSwitchChart(false);
      id = window.requestAnimationFrame(animationStep);
    }
  };

  useEffect(() => {
    showChart(classificationRef.current, classificationDataOption);
  }, [classificationRef, classificationDataOption]);

  return (
    <ChartAndTitleWrapper
      subTitle={classification}
      isLoading={!isClassificationFinished && !allDateRangeLoadingFinished}
      trendInfo={classificationData.trendInfo}
      ref={classificationRef}
      clickSwitch={switchChart}
      animationStyle={transition}
      disabledClickRepeatButton={!canSwitchChart}
      isShowSwitch
    />
  );
};
