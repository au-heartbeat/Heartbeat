import { MOCK_SOURCE_CONTROL_VERIFY_BRANCH_URL, MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS } from '@test/fixtures';
import { updatePipelineToolVerifyResponse, updateSourceControl } from '@src/context/config/configSlice';
import { BranchSelection } from '@src/containers/MetricsStep/PipelineConfiguration/BranchSelection';
import { render, screen, waitFor } from '@testing-library/react';
import { setupStore } from '@test/utils/setupStoreUtil';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { HttpStatusCode } from 'axios';
import React from 'react';

const server = setupServer(
  http.post(MOCK_SOURCE_CONTROL_VERIFY_BRANCH_URL, () => {
    return new HttpResponse(null, {
      status: HttpStatusCode.NoContent,
    });
  }),
);

export const MOCK_SOURCE_CONTROL_BRANCHES_SELECTED = ['OPT-1', 'OPT-2', 'OPT-3'];

export const MOCK_SOURCE_CONTROL_BRANCHES_FULL = [...MOCK_SOURCE_CONTROL_BRANCHES_SELECTED, 'OPT-4', 'OPT-5', 'OPT-6'];

const MOCK_PIPElINE_TOOL_VERIFY_RESPONSE = {
  pipelineList: [
    {
      id: 'mockId',
      name: 'mockName',
      orgId: 'mockOrgId',
      orgName: 'mockOrgName',
      repository: 'mockRepository',
      branches: MOCK_SOURCE_CONTROL_BRANCHES_FULL,
    },
  ],
};

const PIPELINE_SETTING = {
  id: 0,
  organization: 'mockOrgName',
  pipelineName: 'mockName',
  branches: MOCK_SOURCE_CONTROL_BRANCHES_SELECTED,
};

describe('BranchSelection', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  let store = null;
  const onUpdatePipeline = jest.fn();
  const setup = () => {
    store = setupStore();
    store.dispatch(updatePipelineToolVerifyResponse(MOCK_PIPElINE_TOOL_VERIFY_RESPONSE));
    store.dispatch(updateSourceControl(MOCK_SOURCE_CONTROL_VERIFY_REQUEST_PARAMS));

    return render(
      <Provider store={store}>
        <BranchSelection {...PIPELINE_SETTING} onUpdate={onUpdatePipeline} isStepLoading={false} />
      </Provider>,
    );
  };

  it('should show Branches title when render BranchSelection component', () => {
    setup();

    expect(screen.getByText('Branches')).toBeInTheDocument();
  });

  it('should show selected option when render BranchSelection component', async () => {
    setup();

    expect(screen.getByRole('button', { name: 'OPT-1' })).toBeVisible();
  });

  it('should reflect option change when choose new option', async () => {
    setup();

    await userEvent.click(screen.getByRole('combobox', { name: 'Branches' }));
    const optionSelector = await screen.findByRole('option', { name: 'OPT-4' });
    await userEvent.click(optionSelector);

    expect(onUpdatePipeline).toBeCalledWith(0, 'Branches', [...MOCK_SOURCE_CONTROL_BRANCHES_SELECTED, 'OPT-4']);
  });

  it('should return remaining items when click remove icon', async () => {
    setup();
    const cancelButtons = await screen.findAllByTestId('CancelIcon');

    await userEvent.click(cancelButtons[0]);

    expect(onUpdatePipeline).toBeCalledWith(0, 'Branches', ['OPT-2', 'OPT-3']);
  });

  it('should show error text when API return 400 error', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_VERIFY_BRANCH_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.BadRequest,
        });
      }),
    );
    setup();

    await waitFor(() => {
      expect(screen.getByText('The codebase branch marked in red is invalid!')).toBeInTheDocument();
    });
  });

  it('should show cancel button when retry successfully', async () => {
    server.use(
      http.post(MOCK_SOURCE_CONTROL_VERIFY_BRANCH_URL, () => {
        return HttpResponse.error();
      }),
    );
    setup();
    const retryButtons = await screen.findAllByTestId('ReplayIcon');
    server.use(
      http.post(MOCK_SOURCE_CONTROL_VERIFY_BRANCH_URL, () => {
        return new HttpResponse(null, {
          status: HttpStatusCode.NoContent,
        });
      }),
    );

    await userEvent.click(retryButtons[0]);

    const cancelButton = await screen.findByTestId('CancelIcon');
    expect(cancelButton).toBeInTheDocument();
  });
});
