import { ErrorNotification } from '@src/components/ErrorNotification';
import { BOARD_TYPES, VerifyErrorMessage } from '../../fixtures';
import { render } from '@testing-library/react';

describe('error notification', () => {
  it('should show error message when render error notification', () => {
    const { getByText } = render(
      <ErrorNotification message={`${BOARD_TYPES.JIRA} ${VerifyErrorMessage.BadRequest}`} />,
    );

    expect(getByText(`${BOARD_TYPES.JIRA} ${VerifyErrorMessage.BadRequest}`)).toBeInTheDocument();
  });
});
