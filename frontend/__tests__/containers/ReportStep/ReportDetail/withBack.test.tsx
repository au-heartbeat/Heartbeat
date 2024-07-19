import { withGoBack } from '@src/containers/ReportStep/ReportDetail/withBack';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

describe('withGoBack', () => {
  const onBack = jest.fn();

  afterEach(jest.clearAllMocks);

  it('should render a link with back', () => {
    const Component = withGoBack(() => <div>{'test1'}</div>);
    render(<Component onBack={onBack} isShowBack />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should render the icon', () => {
    const Component = withGoBack(() => <div>{'test2'}</div>);
    render(<Component onBack={onBack} isShowBack />);
    expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
  });

  it('should not render the icon and back link when isShowBack is false', () => {
    const Component = withGoBack(() => <div>{'test2'}</div>);
    render(<Component onBack={onBack} isShowBack={false} />);
    expect(screen.queryByTestId('ArrowBackIcon')).toBeNull();
    expect(screen.queryByText('Back')).toBeNull();
  });

  it('should call onBack when the back is clicked', () => {
    const Component = withGoBack(() => <div>{'test3'}</div>);
    render(<Component onBack={onBack} isShowBack />);
    fireEvent.click(screen.getByText('Back'));
    expect(onBack).toBeCalled();
  });
});
