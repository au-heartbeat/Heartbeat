import ChartAndTitleWrapper from '../../../src/containers/ReportStep/ChartAndTitleWrapper';
import { CHART_TYPE, TREND_ICON } from '../../../src/constants/resources';
import { render, screen } from '@testing-library/react';

describe('ChartAndTitleWrapper', () => {
  it('should render green up icon when icon is set to up and green', () => {
    const testedTrendInfo = {
      color: 'green',
      icon: TREND_ICON.UP,
      trendNumber: 83.72,
      type: CHART_TYPE.VELOCITY,
    };
    render(<ChartAndTitleWrapper trendInfo={testedTrendInfo} />);
    const icon = screen.getByTestId('TrendingUpSharpIcon');

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement?.parentElement).toHaveStyle({ color: 'green' });
  });

  it('should render down icon when icon is set to down', () => {
    const testedTrendInfo = {
      color: 'red',
      icon: TREND_ICON.DOWN,
      trendNumber: -83.72,
      type: CHART_TYPE.VELOCITY,
    };
    render(<ChartAndTitleWrapper trendInfo={testedTrendInfo} />);
    const icon = screen.getByTestId('TrendingDownSharpIcon');

    expect(screen.getByTestId('TrendingDownSharpIcon')).toBeInTheDocument();
    expect(icon.parentElement?.parentElement).toHaveStyle({ color: 'red' });
  });
});
