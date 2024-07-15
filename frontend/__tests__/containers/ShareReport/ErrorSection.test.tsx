import ErrorSection from '@src/containers/ShareReport/ErrorSection';
import { render, screen } from '@testing-library/react';

describe('Error Section', () => {
  const mockErrorMessage = 'mock error message';
  const setup = () => {
    render(<ErrorSection message={mockErrorMessage} />);
  };

  it('should render error section correctly', () => {
    setup();

    expect(screen.getByAltText('error logo')).toBeInTheDocument();
    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText(mockErrorMessage)).toBeInTheDocument();
  });
});
