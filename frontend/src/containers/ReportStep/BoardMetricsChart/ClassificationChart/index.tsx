import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { stackedBarOptionMapper } from '@src/containers/ReportStep/ChartOption';
import { LABEL_PERCENT } from '@src/containers/ReportStep/BoardMetricsChart';
import { ReportResponse } from '@src/clients/report/dto/response';
import { showChart } from '@src/containers/ReportStep';
import { ChartType } from '@src/constants/resources';
import React, { useEffect, useRef } from 'react';
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
        if (it!.every((item) => item.name !== subtitle)) {
          it!.push({ name: subtitle, value: '0.00%' });
        }
      });
    });

  allSubtitle.forEach((item) => {
    const classificationValue: number[] = data
      .filter((it) => it !== undefined)
      .flatMap((it) => it!.valueList)
      .filter((it) => it.name === item)
      .map((it) => it.value)
      .map((it) => parseFloat(it));
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
    ],
    trendInfo,
  };
}

export const ClassificationChart = ({
  key,
  classification,
  mappedData,
  dateRanges,
}: {
  key: number;
  classification: string;
  mappedData: ReportResponse[];
  dateRanges: string[];
}) => {
  const classificationRef = useRef<HTMLDivElement>(null);

  const classificationData = extractClassificationData(classification, dateRanges, mappedData);
  const classificationDataOption = classificationData && stackedBarOptionMapper(classificationData);
  const isClassificationFinished =
    mappedData.flatMap((value) => value.classification).filter((it) => it?.name === classification)?.length ===
    dateRanges.length;

  useEffect(() => {
    showChart(classificationRef.current, classificationDataOption);
  }, [classificationRef, classificationDataOption]);

  return (
    <>
      <ChartAndTitleWrapper
        subTitle={classification}
        isLoading={!isClassificationFinished}
        trendInfo={classificationData.trendInfo}
        key={key}
        ref={classificationRef}
        isShowRepeat
      />
    </>
  );
};
