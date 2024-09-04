import { SourceControlBranch } from '@src/containers/MetricsStep/SouceControlConfiguration/SourceControlBranch';
import { MOCK_SOURCE_CONTROL_VERIFY_BRANCH_URL } from '@test/fixtures';
import { setupStore } from '@test/utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
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
const mockInitSourceControlSettings = [
  { id: 0, organization: 'mockOrgName', repo: 'mockRepoName', branches: ['OPT-1'] },
  { id: 1, organization: '', repo: '', steps: '', branches: MOCK_SOURCE_CONTROL_BRANCHES_SELECTED },
];
jest.mock('@src/hooks', () => ({
  ...jest.requireActual('@src/hooks'),
  useAppDispatch: () => jest.fn(),
}));
jest.mock('@src/context/Metrics/metricsSlice', () => ({
  ...jest.requireActual('@src/context/Metrics/metricsSlice'),
  selectSourceControlConfigurationSettings: jest.fn().mockImplementation(() => mockInitSourceControlSettings),
}));

const BRANCH_SETTINGS = {
  id: 0,
  branches: MOCK_SOURCE_CONTROL_BRANCHES_SELECTED,
};

describe('BranchSelection', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  let store = null;
  const onUpdatePipeline = jest.fn();
  const setup = () => {
    store = setupStore();

    return render(
      <Provider store={store}>
        <SourceControlBranch {...BRANCH_SETTINGS} onUpdate={onUpdatePipeline} />
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
    const optionSelector = await screen.findByRole('option', { name: 'OPT-3' });
    await userEvent.click(optionSelector);

    expect(onUpdatePipeline).toBeCalledWith(0, 'Branches', ['OPT-1', 'OPT-3']);
  });

  it('should return remaining items when click remove icon', async () => {
    setup();
    const cancelButtons = await screen.findAllByTestId('CancelIcon');

    await userEvent.click(cancelButtons[0]);

    expect(onUpdatePipeline).toBeCalledWith(0, 'Branches', []);
  });
});
