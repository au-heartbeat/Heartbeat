import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { CHART_TYPE, TREND_ICON, TREND_TYPE } from '@src/constants/resources';
import { render, screen } from '@testing-library/react';
import { theme } from '@src/theme';

describe('ChartAndTitleWrapper', () => {
  it('should render green up icon given icon is set to up and better', () => {
    const testedTrendInfo = {
      trendType: TREND_TYPE.BETTER,
      icon: TREND_ICON.UP,
      trendNumber: 0.83,
      type: CHART_TYPE.VELOCITY,
    };
    render(<ChartAndTitleWrapper trendInfo={testedTrendInfo} />);
    const icon = screen.getByTestId('TrendingUpSharpIcon');

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement?.parentElement).toHaveStyle({ color: theme.main.chartTrend.betterColor });
  });

  it('should render down icon given icon is set to down and worse', () => {
    const testedTrendInfo = {
      trendType: TREND_TYPE.WORSE,
      icon: TREND_ICON.DOWN,
      trendNumber: -0.83,
      type: CHART_TYPE.VELOCITY,
    };
    render(<ChartAndTitleWrapper trendInfo={testedTrendInfo} />);
    const icon = screen.getByTestId('TrendingDownSharpIcon');

    expect(screen.getByTestId('TrendingDownSharpIcon')).toBeInTheDocument();
    expect(icon.parentElement?.parentElement).toHaveStyle({ color: theme.main.chartTrend.worseColor });
  });

  it('should show positive trend number even if the tend number is negative', () => {
    const testedTrendInfo = {
      trendType: TREND_TYPE.WORSE,
      icon: TREND_ICON.DOWN,
      trendNumber: -0.8372,
      type: CHART_TYPE.VELOCITY,
    };
    render(<ChartAndTitleWrapper trendInfo={testedTrendInfo} />);

    expect(screen.getByLabelText('trend number')).toHaveTextContent('83.72%');
  });
});
