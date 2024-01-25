import { BASE_PAGE_ROUTE, ERROR_PAGE_MESSAGE, RETRY_BUTTON } from '../../fixtures';
import { headerClient } from '@src/clients/header/HeaderClient';
import { ErrorContent } from '@src/components/ErrorContent';
import { setupStore } from '../../utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { navigateMock } from '../../setupTests';
import ErrorPage from '@src/pages/ErrorPage';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import React from 'react';

describe('error content', () => {
  it('should show error message when render error page', () => {
    act(() => {
      render(
        <BrowserRouter>
          <ErrorContent />
        </BrowserRouter>,
      );
    });

    expect(screen.getByText(ERROR_PAGE_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(RETRY_BUTTON)).toBeInTheDocument();
  });

  it('should go to home page when click button', async () => {
    headerClient.getVersion = jest.fn().mockResolvedValue('');
    act(() => {
      render(
        <Provider store={setupStore()}>
          <BrowserRouter>
            <ErrorPage />
          </BrowserRouter>
        </Provider>,
      );
    });

    await act(async () => {
      await userEvent.click(screen.getByText(RETRY_BUTTON));
    });

    expect(navigateMock).toHaveBeenCalledWith(BASE_PAGE_ROUTE);
  });
});
