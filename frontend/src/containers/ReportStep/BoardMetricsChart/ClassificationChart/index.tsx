import { pieOptionMapper, stackedBarOptionMapper } from '@src/containers/ReportStep/ChartOption';
import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { LABEL_PERCENT } from '@src/containers/ReportStep/BoardMetricsChart';
import { ReportResponse } from '@src/clients/report/dto/response';
import React, { useEffect, useRef, useState } from 'react';
import { showChart } from '@src/containers/ReportStep';
import { ChartType } from '@src/constants/resources';
import { theme } from '@src/theme';

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

function extractClassificationCardCountsData(
  classification: string,
  dateRanges: string[],
  mappedData: ReportResponse[],
) {
  const data = mappedData
    .flatMap((it) => it.classificationCardCount)
    .filter((it) => it?.name === classification)
    .flatMap((it) => it?.valueList);
  console.log('extractClassificationCardCountsData');
  console.log(data);

  const allSubtitle = [...new Set(data.filter((it) => it !== undefined).map((it) => it!.name))];
  const totalCardCounts = data
    .filter((it) => it !== undefined)
    .reduce((res, cardInfo) => res + Number(cardInfo?.value), 0);

  const indicators: { value: string; name: string }[] = allSubtitle.map((subtitle) => {
    const cardCount = data
      .filter((it) => it !== undefined)
      .filter((it) => it!.name === subtitle)
      .reduce((res, cardInfo) => {
        return res + Number(cardInfo!.value);
      }, 0);
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

export const ClassificationChart = ({
  classification,
  mappedData,
  dateRanges,
}: {
  classification: string;
  mappedData: ReportResponse[];
  dateRanges: string[];
}) => {
  const [isShowTimePeriodChart, setIsShowTimePeriodChart] = useState<boolean>(true);
  const classificationRef = useRef<HTMLDivElement>(null);
  let classificationData;
  let classificationDataOption;
  if (isShowTimePeriodChart) {
    classificationData = extractClassificationData(classification, dateRanges, mappedData);
    classificationDataOption = classificationData && stackedBarOptionMapper(classificationData);
  } else {
    classificationData = extractClassificationCardCountsData(classification, dateRanges, mappedData);
    classificationDataOption = classificationData && pieOptionMapper(classificationData);
  }
  const isClassificationFinished =
    mappedData.flatMap((value) => value.classification).filter((it) => it?.name === classification)?.length ===
    dateRanges.length;

  const switchChart = () => {
    setIsShowTimePeriodChart(!isShowTimePeriodChart);
  };

  useEffect(() => {
    showChart(classificationRef.current, classificationDataOption);
  }, [classificationRef, classificationDataOption]);

  return (
    <ChartAndTitleWrapper
      subTitle={classification}
      isLoading={!isClassificationFinished}
      trendInfo={classificationData.trendInfo}
      ref={classificationRef}
      isShowRepeat
      clickRepeat={switchChart}
    />
  );
};
