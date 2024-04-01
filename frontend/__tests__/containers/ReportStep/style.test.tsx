import { StyledCalendarWrapper } from '@src/containers/ReportStep/style';
import { render, screen } from '@testing-library/react';

describe('Report step styled components', () => {
  it('should render the bottom margin depend on whether StyledCalendarWrapper in summary page', () => {
    render(
      <StyledCalendarWrapper aria-label='test component 1' isSummaryPage={true}>
        test 1
      </StyledCalendarWrapper>,
    );

    render(
      <StyledCalendarWrapper aria-label='test component 2' isSummaryPage={false}>
        test 2
      </StyledCalendarWrapper>,
    );

    const component1 = screen.getByLabelText('test component 1');
    const component2 = screen.getByLabelText('test component 2');

    expect(component1).toHaveStyle({ 'margin-bottom': '-3.5rem' });
    expect(component2).toHaveStyle({ 'margin-bottom': '-2rem' });
  });
});
