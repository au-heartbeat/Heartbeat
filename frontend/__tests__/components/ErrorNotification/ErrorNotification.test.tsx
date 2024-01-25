import { ErrorNotification } from '@src/components/ErrorNotification';
import { BOARD_TYPES, VERIFY_ERROR_MESSAGE } from '../../fixtures';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('error notification', () => {
  it('should show error message when render error notification', () => {
    act(() => {
      render(<ErrorNotification message={`${BOARD_TYPES.JIRA} ${VERIFY_ERROR_MESSAGE.BAD_REQUEST}`} />);
    });

    expect(screen.getByText(`${BOARD_TYPES.JIRA} ${VERIFY_ERROR_MESSAGE.BAD_REQUEST}`)).toBeInTheDocument();
  });
});
