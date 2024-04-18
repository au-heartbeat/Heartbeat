import { TimeoutAlert } from '@src/containers/ConfigStep/TimeoutAlert';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

describe('TimeoutAlert', () => {
  const setIsShowAlert = jest.fn();
  const setup = (onClose: () => void, showAlert: boolean, moduleType: string) => {
    return render(<TimeoutAlert showAlert={showAlert} onClose={onClose} moduleType={moduleType} />);
  };

  it('should render board message given moduleType is board', () => {
    setup(setIsShowAlert, true, 'Board');
    const message = screen.getByText('Board');

    expect(message).toBeInTheDocument();
  });

  it('should call setIsShowAlert with false when click the close icon given init value', async () => {
    setup(setIsShowAlert, true, 'any');
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
