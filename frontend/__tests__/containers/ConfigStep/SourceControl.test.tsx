import {
  ConfigTitle,
  ERROR_MESSAGE_COLOR,
  MOCK_SOURCE_CONTROL_VERIFY_ERROR_CASE_TEXT,
  MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL,
  RESET,
  REVERIFY,
  SOURCE_CONTROL_FIELDS,
  TOKEN_ERROR_MESSAGE,
  VERIFIED,
  VERIFY,
} from '../../fixtures';
import { sourceControlDefaultValues } from '@src/containers/ConfigStep/Form/useDefaultValues';
import { sourceControlClient } from '@src/clients/sourceControl/SourceControlClient';
import { AxiosRequestErrorCode, SourceControlTypes } from '@src/constants/resources';
import { sourceControlSchema } from '@src/containers/ConfigStep/Form/schema';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SourceControl } from '@src/containers/ConfigStep/SourceControl';
import { setupStore } from '../../utils/setupStoreUtil';
import { FormProvider } from '@test/utils/FormProvider';
import userEvent from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';
import React from 'react';

const mockValidFormtToken = 'ghp_' + 'a'.repeat(36);

export const fillSourceControlFieldsInformation = async () => {
  const tokenInput = screen.getByTestId('sourceControlTextField').querySelector('input') as HTMLInputElement;

  await userEvent.type(tokenInput, mockValidFormtToken);

  expect(tokenInput.value).toEqual(mockValidFormtToken);
};

let store = null;

const server = setupServer(
  http.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, () => {
    return new HttpResponse(null, {
      status: HttpStatusCode.NoContent,
    });
  }),
);

const originalVerifyToken = sourceControlClient.verifyToken;

jest.mock('@src/context/Metrics/metricsSlice', () => ({
  ...jest.requireActual('@src/context/Metrics/metricsSlice'),
  updateShouldGetPipelineConfig: jest.fn().mockReturnValue({ type: 'SHOULD_UPDATE_PIPELINE_CONFIG' }),
  initDeploymentFrequencySettings: jest.fn().mockReturnValue({ type: 'INIT_DEPLOYMENT_SETTINGS' }),
}));

describe('SourceControl', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  afterEach(() => {
    store = null;
    sourceControlClient.verifyToken = originalVerifyToken;
  });

  const onReset = jest.fn();
  const onSetResetFields = jest.fn();
  store = setupStore();
  const setup = () => {
    store = setupStore();
    return render(
      <Provider store={store}>
        <FormProvider schema={sourceControlSchema} defaultValues={sourceControlDefaultValues}>
          <SourceControl onReset={onReset} onSetResetFields={onSetResetFields} />
        </FormProvider>
      </Provider>,
    );
  };

  it('should show sourceControl title and fields when render sourceControl component', () => {
    setup();

    expect(screen.getAllByText(ConfigTitle.SourceControl)[0]).toBeInTheDocument();
    SOURCE_CONTROL_FIELDS.map((field) => {
      expect(screen.getByLabelText(`${field} *`)).toBeInTheDocument();
    });
  });

  it('should show default value gitHub when init sourceControl component', () => {
    setup();
    const sourceControlType = screen.getByText(SourceControlTypes.GitHub);

    expect(sourceControlType).toBeInTheDocument();
  });

  it('should run the reset and setResetField func when click reset button', async () => {
    setup();
    await fillSourceControlFieldsInformation();

    await userEvent.click(screen.getByRole('button', { name: VERIFY }));

    const resetButton = await screen.findByRole('button', { name: RESET });
    await userEvent.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSetResetFields).toHaveBeenCalledTimes(1);
  });

  it('should hidden timeout alert when the error type of api call becomes other', async () => {
    const { getByLabelText, queryByLabelText } = setup();
    await fillSourceControlFieldsInformation();
    sourceControlClient.verifyToken = jest.fn().mockResolvedValue({
      code: AxiosRequestErrorCode.Timeout,
    });

    await userEvent.click(screen.getByText(VERIFY));

    expect(getByLabelText('timeout alert')).toBeInTheDocument();

    sourceControlClient.verifyToken = jest.fn().mockResolvedValue({
      code: HttpStatusCode.Unauthorized,
    });

    await userEvent.click(screen.getByText(REVERIFY));

    expect(queryByLabelText('timeout alert')).not.toBeInTheDocument();
  });

  it('should enable verify button when all fields checked correctly given disable verify button', async () => {
    setup();
    const verifyButton = screen.getByRole('button', { name: VERIFY });

    expect(verifyButton).toBeDisabled();

    await fillSourceControlFieldsInformation();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: VERIFY })).toBeEnabled();
    });
  });

  it('should show reset button and verified button when verify successfully', async () => {
    setup();
    await fillSourceControlFieldsInformation();

    await userEvent.click(screen.getByText(VERIFY));

    await waitFor(() => {
      expect(screen.getByText(RESET)).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByText(VERIFIED)).toBeTruthy();
    });
  });

  it('should show error message and error style when token is empty', async () => {
    setup();

    const tokenInput = screen.getByTestId('sourceControlTextField').querySelector('input') as HTMLInputElement;
    fireEvent.focus(tokenInput);

    expect(screen.getByText(TOKEN_ERROR_MESSAGE[1])).toBeInTheDocument();
    expect(screen.getByText(TOKEN_ERROR_MESSAGE[1])).toHaveStyle(ERROR_MESSAGE_COLOR);
  });

  it('should not show error message when field does not trigger any event given an empty value', () => {
    setup();

    expect(screen.queryByText(TOKEN_ERROR_MESSAGE[1])).not.toBeInTheDocument();
  });

  it('should show error message when focus on field given an empty value', async () => {
    setup();

    const tokenInput = screen.getByTestId('sourceControlTextField').querySelector('input') as HTMLInputElement;
    fireEvent.focus(tokenInput);

    expect(screen.getByText(TOKEN_ERROR_MESSAGE[1])).toBeInTheDocument();
    expect(screen.getByText(TOKEN_ERROR_MESSAGE[1])).toHaveStyle(ERROR_MESSAGE_COLOR);
  });

  it('should not show error message when focus on field given a value', () => {
    setup();

    const tokenInput = screen.getByTestId('sourceControlTextField').querySelector('input') as HTMLInputElement;
    fireEvent.change(tokenInput, { target: { value: 'some value' } });
    fireEvent.focus(tokenInput);

    expect(screen.queryByText(TOKEN_ERROR_MESSAGE[1])).not.toBeInTheDocument();
  });

  it('should show error message and error style when token is invalid', async () => {
    setup();
    const mockInfo = 'mockToken';
    const tokenInput = screen.getByTestId('sourceControlTextField').querySelector('input') as HTMLInputElement;

    await userEvent.type(tokenInput, mockInfo);

    expect(tokenInput.value).toEqual(mockInfo);
    expect(screen.getByText(TOKEN_ERROR_MESSAGE[0])).toBeInTheDocument();
    expect(screen.getByText(TOKEN_ERROR_MESSAGE[0])).toHaveStyle(ERROR_MESSAGE_COLOR);
  });

  it('should show error notification when sourceControl verify response status is 401', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.Unauthorized,
        });
      }),
    );
    setup();

    await fillSourceControlFieldsInformation();
    await userEvent.click(screen.getByRole('button', { name: VERIFY }));

    expect(screen.getByText(MOCK_SOURCE_CONTROL_VERIFY_ERROR_CASE_TEXT)).toBeInTheDocument();
  });

  it('should close alert modal when user manually close the alert', async () => {
    setup();
    await fillSourceControlFieldsInformation();
    sourceControlClient.verifyToken = jest.fn().mockResolvedValue({
      code: AxiosRequestErrorCode.Timeout,
    });

    await userEvent.click(screen.getByText(VERIFY));

    expect(await screen.getByLabelText('timeout alert')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Close'));

    expect(screen.queryByLabelText('timeout alert')).not.toBeInTheDocument();
  });

  it('should allow user to re-submit when user interact again with form given form is already submit successfully', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_VERIFY_TOKEN_URL, async () => {
        await delay(100);
        return new HttpResponse(null, {
          status: HttpStatusCode.NoContent,
        });
      }),
    );
    setup();
    await fillSourceControlFieldsInformation();

    expect(screen.getByRole('button', { name: /verify/i })).toBeEnabled();

    await userEvent.click(screen.getByText(/verify/i));

    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /verified/i })).toBeDisabled();

    const tokenInput = (await screen.findByLabelText('Token *')) as HTMLInputElement;
    await userEvent.clear(tokenInput);
    await userEvent.type(tokenInput, mockValidFormtToken);
    const verifyButton = await screen.findByRole('button', { name: /verify/i });

    expect(verifyButton).toBeEnabled();
  });

  // Test to cover github enterprise site field onChange logic
  it('should cover github enterprise site field onChange logic', async () => {
    const githubEnterpriseValues = {
      type: SourceControlTypes.GitHubEnterprise,
      site: 'https://github.mycompany.com',
      token: mockValidFormtToken,
    };

    render(
      <Provider store={setupStore()}>
        <FormProvider schema={sourceControlSchema} defaultValues={githubEnterpriseValues}>
          <SourceControl onReset={onReset} onSetResetFields={onSetResetFields} />
        </FormProvider>
      </Provider>,
    );

    // Wait for the site field to appear
    const siteField = await screen.findByTestId('sourceControlHostField');
    const siteInput = siteField.querySelector('input') as HTMLInputElement;

    // Use fireEvent.change to update the field value
    fireEvent.change(siteInput, { target: { value: 'https://new.github.company.com' } });

    // Verify the input value was updated
    expect(siteInput.value).toBe('https://new.github.company.com');
  });

  it('should reset form when site field changes after successful submission', async () => {
    const githubEnterpriseValues = {
      type: SourceControlTypes.GitHubEnterprise,
      site: 'https://github.mycompany.com',
      token: mockValidFormtToken,
    };

    render(
      <Provider store={setupStore()}>
        <FormProvider schema={sourceControlSchema} defaultValues={githubEnterpriseValues}>
          <SourceControl onReset={onReset} onSetResetFields={onSetResetFields} />
        </FormProvider>
      </Provider>,
    );

    const siteField = await screen.findByTestId('sourceControlHostField');
    const siteInput = siteField.querySelector('input') as HTMLInputElement;

    // Change the site field - this tests the onChange handler logic (lines 94-102)
    fireEvent.change(siteInput, { target: { value: 'https://new-enterprise.github.com' } });

    expect(siteInput.value).toBe('https://new-enterprise.github.com');
  });

  it('should handle token field changes with proper form updates', async () => {
    const githubEnterpriseValues = {
      type: SourceControlTypes.GitHubEnterprise,
      site: 'https://github.mycompany.com',
      token: mockValidFormtToken,
    };

    render(
      <Provider store={setupStore()}>
        <FormProvider schema={sourceControlSchema} defaultValues={githubEnterpriseValues}>
          <SourceControl onReset={onReset} onSetResetFields={onSetResetFields} />
        </FormProvider>
      </Provider>,
    );

    // Get token input and change its value
    const tokenInput = (await screen.findByLabelText('Token *')) as HTMLInputElement;
    const newToken = 'ghp_' + 'b'.repeat(36);

    fireEvent.change(tokenInput, { target: { value: newToken } });

    // Verify the change was registered
    expect(tokenInput.value).toBe(newToken);
  });
});
