import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('ConfigButtonGroup', () => {
  const setup = (isVerified: boolean, isLoading: boolean, isHBTimeOut: boolean, isDisableVerifyButton: boolean) => {
    return render(
      <ConfigButtonGrop
        isHBTimeOut={isHBTimeOut}
        isVerified={isVerified}
        isLoading={isLoading}
        isDisableVerifyButton={isDisableVerifyButton}
      />,
    );
  };

  it('should render a disabled VerifyButton with "Verified" text when isVerified is true and isLoading is false', () => {
    setup(true, false, false, false); // Use a different moduleType for clarity
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeDisabled();
  });
  it('should render a VerifyButton with "Reverify" text when isHBTimeOut is true', () => {
    setup(false, false, true, false); // Use a different moduleType for clarity
    expect(screen.getByText('Reverify')).toBeInTheDocument();
    expect(screen.getByText('Reverify')).toHaveAttribute('type', 'submit');
  });
});
