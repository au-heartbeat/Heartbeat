import { TokenAccessAlert } from '@src/containers/MetricsStep/TokenAccessAlert';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

describe('TokenAccessAlert', () => {
  it('should render alert when permission is denied', () => {
    render(<TokenAccessAlert isPermissionDeny={true} />);

    const changeTokenText = screen.queryByText('Limited access token:');
    const linkElement = screen.getByRole('link', { name: /correct access permission/i });

    expect(screen.getByLabelText('alert for token access error')).toBeInTheDocument();
    expect(changeTokenText).toBeInTheDocument();
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('target', '_blank');
  });

  it('should not render alert when permission is granted', () => {
    render(<TokenAccessAlert isPermissionDeny={false} />);

    const alertElement = screen.queryByLabelText('alert for token access error');
    expect(alertElement).not.toBeInTheDocument();
  });
});
