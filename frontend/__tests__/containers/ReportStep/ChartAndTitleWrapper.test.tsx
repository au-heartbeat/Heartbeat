import ChartAndTitleWrapper from '@src/containers/ReportStep/ChartAndTitleWrapper';
import { ChartType, TrendIcon, TrendType } from '@src/constants/resources';
import { saveVersion } from '@src/context/meta/metaSlice';
import { setupStore } from '@test/utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
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
    const newLabel = screen.queryByLabelText('new label');

    expect(newLabel).not.toBeInTheDocument();
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
    const newLabel = screen.queryByLabelText('new label');

    expect(newLabel).not.toBeInTheDocument();
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

    const newLabel = screen.queryByLabelText('new label');

    expect(screen.getByLabelText('trend number')).toHaveTextContent('83.72%');
    expect(newLabel).not.toBeInTheDocument();
  });

  it('should show the switch button group and show new label when chart type is classification and version is less than 1.3.0', async () => {
    const store = setupStore();
    store.dispatch(saveVersion('1.2.1'));
    const testedTrendInfo = {
      type: ChartType.Classification,
    };
    const clickSwitchClassificationModel = jest.fn();
    render(
      <Provider store={store}>
        <ChartAndTitleWrapper
          trendInfo={testedTrendInfo}
          clickSwitchClassificationModel={clickSwitchClassificationModel}
          isLoading={false}
          subTitle={'test'}
        />
      </Provider>,
    );

    expect(screen.getByLabelText('classification test switch model button group')).toBeInTheDocument();

    const cardCountSwitchButton = screen.getByLabelText('classification test switch card count model button');
    const storyPointsSwitchButton = screen.getByLabelText('classification test switch story points model button');
    const newLabel = screen.getByLabelText('new label');

    expect(cardCountSwitchButton).toBeInTheDocument();
    expect(storyPointsSwitchButton).toBeInTheDocument();
    expect(newLabel).toBeInTheDocument();

    await userEvent.click(cardCountSwitchButton);
    await userEvent.click(storyPointsSwitchButton);

    expect(clickSwitchClassificationModel).toHaveBeenCalledTimes(2);
  });

  it('should show new label when version is equal to 1.3.0', () => {
    const store = setupStore();
    store.dispatch(saveVersion('1.3.0'));
    const testedTrendInfo = {
      type: ChartType.Classification,
    };
    const clickSwitchClassificationModel = jest.fn();
    render(
      <Provider store={store}>
        <ChartAndTitleWrapper
          trendInfo={testedTrendInfo}
          clickSwitchClassificationModel={clickSwitchClassificationModel}
          isLoading={false}
          subTitle={'test'}
        />
      </Provider>,
    );

    const newLabel = screen.getByLabelText('new label');

    expect(newLabel).toBeInTheDocument();
  });

  it('should not show new label when version is more than 1.3.0', () => {
    const store = setupStore();
    store.dispatch(saveVersion('2.3.0'));
    const testedTrendInfo = {
      type: ChartType.Classification,
    };
    const clickSwitchClassificationModel = jest.fn();
    render(
      <Provider store={store}>
        <ChartAndTitleWrapper
          trendInfo={testedTrendInfo}
          clickSwitchClassificationModel={clickSwitchClassificationModel}
          isLoading={false}
          subTitle={'test'}
        />
      </Provider>,
    );

    const newLabel = screen.queryByLabelText('new label');

    expect(newLabel).not.toBeInTheDocument();
  });
});
