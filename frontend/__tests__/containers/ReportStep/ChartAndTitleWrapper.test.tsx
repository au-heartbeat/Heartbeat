import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { ChartType, TrendIcon, TrendType } from '@src/constants/resources';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('should show the switch button group when chart type is classification', async () => {
    const testedTrendInfo = {
      type: ChartType.Classification,
    };
    const clickSwitchClassificationModel = jest.fn();
    render(
      <ChartAndTitleWrapper
        trendInfo={testedTrendInfo}
        clickSwitchClassificationModel={clickSwitchClassificationModel}
        isLoading={false}
        subTitle={'test'}
      />,
    );

    expect(screen.getByLabelText('classification test switch model button group')).toBeInTheDocument();

    const cardCountSwitchButton = screen.getByLabelText('classification test switch card count model button');
    const storyPointsSwitchButton = screen.getByLabelText('classification test switch story points model button');

    expect(cardCountSwitchButton).toBeInTheDocument();
    expect(storyPointsSwitchButton).toBeInTheDocument();

    await userEvent.click(cardCountSwitchButton);
    await userEvent.click(storyPointsSwitchButton);

    expect(clickSwitchClassificationModel).toHaveBeenCalledTimes(2);
  });
});
