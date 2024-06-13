import { BarOptionProps, stackedBarOptionMapper } from '@src/containers/ReportStep/BoardMetricsChart/ChartOption';

describe('stackedBarOptionMapper function', () => {
  const props: BarOptionProps = {
    xAxis: ['1', '2'],
    yAxis: {
      name: 'yAxis',
      alignTick: true,
      axisLabel: 'yLable',
    },
    series: [
      {
        name: 'series 1',
        type: 'bar',
        data: [1, 2, 3],
      },
      {
        name: 'series 2',
        type: 'line',
        data: [10, 20, 30],
      },
    ],
    color: ['red', 'green'],
  };

  it('should get prop series when first legend is undefined', () => {
    const result = stackedBarOptionMapper(props);

    expect(result.legend).not.toBeUndefined();
    expect(result.legend?.data).toEqual(['series 1', 'series 2']);
  });

  it('should get prop series when first legend is not undefined', () => {
    const firstLegend = 'first legend';
    const result = stackedBarOptionMapper(props, firstLegend);

    expect(result.legend).not.toBeUndefined();
    expect(result.legend?.data).toEqual([firstLegend, 'series 1', 'series 2']);
  });
});
