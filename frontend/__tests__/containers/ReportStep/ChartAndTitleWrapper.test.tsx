import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { ChartType, TrendIcon, TrendType } from '@src/constants/resources';
import { render, screen } from '@testing-library/react';
import { theme } from '@src/theme';

describe('ChartAndTitleWrapper', () => {
  it('should render green up icon given icon is set to up and better', () => {
    const testedTrendInfo = {
      trendType: TrendType.Better,
      icon: TrendIcon.Up,
      trendNumber: 0.83,
      type: ChartType.Velocity,
    };
    render(<ChartAndTitleWrapper trendInfo={testedTrendInfo} isLoading={false} />);
    const icon = screen.getByTestId('TrendingUpSharpIcon');

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement?.parentElement).toHaveStyle({ color: theme.main.chartTrend.betterColor });
  });

  it('should render down icon given icon is set to down and worse', () => {
    const testedTrendInfo = {
      trendType: TrendType.Worse,
      icon: TrendIcon.Down,
      trendNumber: -0.83,
      type: ChartType.Velocity,
    };
    render(<ChartAndTitleWrapper trendInfo={testedTrendInfo} isLoading={false} />);
    const icon = screen.getByTestId('TrendingDownSharpIcon');

    expect(screen.getByTestId('TrendingDownSharpIcon')).toBeInTheDocument();
    expect(icon.parentElement?.parentElement).toHaveStyle({ color: theme.main.chartTrend.worseColor });
  });

  it('should show positive trend number even if the tend number is negative', () => {
    const testedTrendInfo = {
      trendType: TrendType.Worse,
      icon: TrendIcon.Down,
      trendNumber: -0.8372,
      type: ChartType.Velocity,
    };
    render(<ChartAndTitleWrapper trendInfo={testedTrendInfo} isLoading={false} />);

    expect(screen.getByLabelText('trend number')).toHaveTextContent('83.72%');
  });
});
