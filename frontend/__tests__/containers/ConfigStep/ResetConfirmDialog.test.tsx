import { ResetConfirmDialog } from '@src/containers/ConfigStep/ResetConfirmDialog';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Reset Confirm Dialog', () => {
  const onConfirmMock = jest.fn();
  const onCloseMock = jest.fn();
  const setup = (isShow: boolean) => {
    return render(<ResetConfirmDialog isShowDialog={isShow} onConfirm={onConfirmMock} onClose={onCloseMock} />);
  };

  it('should show the reset dialog when isShowDialog is true', () => {
    setup(true);

    expect(screen.queryByLabelText('reset confirm dialog')).toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog title')).toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog close')).toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog content')).toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog cancel button')).toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog confirm button')).toBeInTheDocument();
  });

  it('should not show the reset dialog when isShowDialog is false', () => {
    setup(false);

    expect(screen.queryByLabelText('reset confirm dialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog title')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog close')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog content')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog cancel button')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reset confirm dialog confirm button')).not.toBeInTheDocument();
  });

  it('should run the onConfirm function when dialog exists and click confirm button', async () => {
    setup(true);

    await userEvent.click(screen.getByLabelText('reset confirm dialog confirm button'));

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('should run the onClose function when dialog exists and click close button or click cancel button', async () => {
    setup(true);

    await userEvent.click(screen.getByLabelText('reset confirm dialog cancel button'));
    await userEvent.click(screen.getByLabelText('reset confirm dialog close'));

    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });
});
