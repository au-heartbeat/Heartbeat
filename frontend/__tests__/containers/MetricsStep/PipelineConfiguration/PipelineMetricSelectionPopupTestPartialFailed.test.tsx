import { render, waitFor } from '@testing-library/react';
import { setupStore } from '@test/utils/setupStoreUtil';
import { Provider } from 'react-redux';

import { PipelineMetricSelection } from '@src/containers/MetricsStep/PipelineConfiguration/PipelineMetricSelection';
import { IPipelineConfig, updateShouldGetPipelineConfig } from '@src/context/Metrics/metricsSlice';
import { addNotification } from '@src/context/notification/NotificationSlice';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { PipelineSettingTypes } from '@test/fixtures';

const store = setupStore();
let stepFailStatus = MetricsDataFailStatus.NotFailed;

jest.mock('@src/context/notification/NotificationSlice', () => ({
  ...jest.requireActual('@src/context/notification/NotificationSlice'),
  addNotification: jest.fn().mockReturnValue({ type: 'ADD_NEW_NOTIFICATION' }),
}));

jest.mock('@src/hooks/useGetMetricsStepsEffect', () => ({
  ...jest.requireActual('@src/hooks/useGetMetricsStepsEffect'),

  useGetMetricsStepsEffect: jest.fn().mockImplementation(() => {
    return {
      stepFailedStatus: stepFailStatus,
    };
  }),
}));

describe('PipelineMetricSelection', () => {
  const deploymentFrequencySetting = {
    id: 0,
    organization: '',
    pipelineName: '',
    step: '',
    repoName: '',
    branches: [],
  };
  const mockHandleClickRemoveButton = jest.fn();
  const mockUpdatePipeline = jest.fn();
  const mockSetLoadingCompletedNumber = jest.fn();

  const setup = async (
    deploymentFrequencySetting: IPipelineConfig,
    isShowRemoveButton: boolean,
    isDuplicated: boolean,
  ) => {
    store.dispatch(updateShouldGetPipelineConfig(true));
    return render(
      <Provider store={store}>
        <PipelineMetricSelection
          type={PipelineSettingTypes.DeploymentFrequencySettingsType}
          pipelineSetting={deploymentFrequencySetting}
          isShowRemoveButton={isShowRemoveButton}
          onRemovePipeline={mockHandleClickRemoveButton}
          onUpdatePipeline={mockUpdatePipeline}
          isDuplicated={isDuplicated}
          isInfoLoading={false}
          totalPipelineNumber={2}
          setLoadingCompletedNumber={mockSetLoadingCompletedNumber}
        />
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show 4xx popup when call pipeline step to get partial 4xx error', async () => {
    stepFailStatus = MetricsDataFailStatus.PartialFailed4xx;
    await setup(deploymentFrequencySetting, true, false);

    await waitFor(() => {
      expect(addNotification).toHaveBeenCalled();
    });
  });

  it('should show timeout popup when call pipeline step to get partial timeout error', async () => {
    stepFailStatus = MetricsDataFailStatus.PartialFailedTimeout;
    await setup(deploymentFrequencySetting, true, false);

    await waitFor(() => {
      expect(addNotification).toHaveBeenCalled();
    });
  });
});
