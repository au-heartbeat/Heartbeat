import { TimeoutAlert } from '@src/containers/ConfigStep/TimeoutAlert';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

describe('TimeoutAlert', () => {
  const setIsShowAlert = jest.fn();
  const setup = (
    setIsShowAlert: (value: boolean) => void,
    isShowAlert: boolean,
    isHBTimeOut: boolean,
    moduleType: string,
  ) => {
    return render(
      <TimeoutAlert
        setIsShowAlert={setIsShowAlert}
        isShowAlert={isShowAlert}
        isHBTimeOut={isHBTimeOut}
        moduleType={moduleType}
      />,
    );
  };

  it('should render the correct message when given the moduleType', () => {
    setup(setIsShowAlert, true, true, 'Board'); // Use a different moduleType for clarity
    const message = screen.getByText('Board'); // Use a regex for flexibility
    expect(message).toBeInTheDocument();
  });
  it('should not render the alert when isHBTimeOut or isShowAlert is false', () => {
    setup(setIsShowAlert, false, true, 'Board');
    expect(screen.queryByText('Board')).not.toBeInTheDocument();

    setup(setIsShowAlert, true, false, 'Board');
    expect(screen.queryByText('Board')).not.toBeInTheDocument();
  });

  it('should call setIsShowAlert with false and hides the alert when click the close icon', async () => {
    setup(setIsShowAlert, true, true, 'any'); // Ensure alert is visible
    const closeIcon = screen.getByTestId('CloseIcon');
    act(() => {
      userEvent.click(closeIcon);
    });
    await waitFor(() => {
      expect(setIsShowAlert).toHaveBeenCalledTimes(1);
      expect(setIsShowAlert).toHaveBeenCalledWith(false);
    });
  });
});
