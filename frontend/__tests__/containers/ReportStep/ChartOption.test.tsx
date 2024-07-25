import { getEchartsLegendType } from '@src/containers/ReportStep/ChartOption';

describe('Chart option', () => {
  describe('Get echarts legend type', () => {
    it('should return plain type when series is undefined', () => {
      const series = undefined;
      const echartsLegendType = getEchartsLegendType(series);
      expect(echartsLegendType).toEqual('plain');
    });

    it('should return plain type when series length is not more than 10', () => {
      const series = [
        {
          name: '1',
          type: '1',
          data: [1, 2],
        },
        {
          name: '2',
          type: '2',
          data: [1, 2],
        },
        {
          name: '3',
          type: '3',
          data: [1, 2],
        },
        {
          name: '4',
          type: '4',
          data: [1, 2],
        },
        {
          name: '5',
          type: '5',
          data: [1, 2],
        },
        {
          name: '6',
          type: '6',
          data: [1, 2],
        },
        {
          name: '7',
          type: '7',
          data: [1, 2],
        },
        {
          name: '8',
          type: '8',
          data: [1, 2],
        },
        {
          name: '9',
          type: '9',
          data: [1, 2],
        },
        {
          name: '10',
          type: '10',
          data: [1, 2],
        },
      ];

      const echartsLegendType = getEchartsLegendType(series);
      expect(echartsLegendType).toEqual('plain');
    });

    it('should return scroll type when series length is more than 10', () => {
      const series = [
        {
          name: '1',
          type: '1',
          data: [1, 2],
        },
        {
          name: '2',
          type: '2',
          data: [1, 2],
        },
        {
          name: '3',
          type: '3',
          data: [1, 2],
        },
        {
          name: '4',
          type: '4',
          data: [1, 2],
        },
        {
          name: '5',
          type: '5',
          data: [1, 2],
        },
        {
          name: '6',
          type: '6',
          data: [1, 2],
        },
        {
          name: '7',
          type: '7',
          data: [1, 2],
        },
        {
          name: '8',
          type: '8',
          data: [1, 2],
        },
        {
          name: '9',
          type: '9',
          data: [1, 2],
        },
        {
          name: '10',
          type: '10',
          data: [1, 2],
        },
        {
          name: '11',
          type: '11',
          data: [1, 2],
        },
      ];
      const echartsLegendType = getEchartsLegendType(series);
      expect(echartsLegendType).toEqual('scroll');
    });
  });
});
