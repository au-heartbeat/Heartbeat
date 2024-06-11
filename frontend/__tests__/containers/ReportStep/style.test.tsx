import { TrendTypeIcon } from '@src/containers/ReportStep/ChartAndTitleWrapper/style';
import { StyledCalendarWrapper } from '@src/containers/ReportStep/style';
import { render, screen } from '@testing-library/react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

describe('Report step styled components', () => {
  it('should render the bottom margin depend on whether StyledCalendarWrapper in summary page', () => {
    const wrapper = render(
      <StyledCalendarWrapper aria-label='test component 1' isSummaryPage={true}>
        test
      </StyledCalendarWrapper>,
    );

    const component1 = screen.getByLabelText('test component 1');

    expect(component1).toHaveStyle({ 'margin-bottom': '0rem' });

    wrapper.rerender(<StyledCalendarWrapper aria-label='test component 2' isSummaryPage={false} />);

    const component2 = screen.getByLabelText('test component 2');

    expect(component2).toHaveStyle({ 'margin-bottom': '2rem' });
  });
});

describe('ChartAndTitleWrapper styled component', () => {
  it('should render the TrendTypeIcon with the given color', () => {
    render(
      <TrendTypeIcon aria-label='test component 1' color='red'>
        <ThumbUpIcon />
      </TrendTypeIcon>,
    );
    expect(screen.getByLabelText('test component 1').children[0]).toHaveStyle({ color: 'red' });
  });

  it('should render the TrendTypeIcon with the reverse style', () => {
    render(
      <TrendTypeIcon aria-label='test component 2' color='red' reverse>
        <ThumbUpIcon />
      </TrendTypeIcon>,
    );
    expect(screen.getByLabelText('test component 2').children[0]).toHaveStyle({ transform: 'scaleY(-1)' });
  });
});
