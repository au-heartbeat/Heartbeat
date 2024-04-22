import {
  selectOrganizationWarningMessage,
  selectPipelineNameWarningMessage,
  selectStepWarningMessage,
} from '@src/context/Metrics/metricsSlice';
import { selectPipelineNames, selectPipelineOrganizations, selectSteps } from '@src/context/config/configSlice';

import { SingleSelection } from '@src/containers/MetricsStep/DeploymentFrequencySettings/SingleSelection';
import { BranchSelection } from '@src/containers/MetricsStep/DeploymentFrequencySettings/BranchSelection';
import { ButtonWrapper, PipelineMetricSelectionWrapper, RemoveButton, WarningMessage } from './style';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import { abc } from '@src/containers/MetricsStep/DeploymentFrequencySettings';
import { MESSAGE, NO_PIPELINE_STEP_ERROR } from '@src/constants/resources';
import { Loading } from '@src/components/Loading';
import { store } from '@src/store';
import { useState } from 'react';

interface pipelineMetricSelectionProps {
  type: string;
  pipelineSetting: {
    id: number;
    organization: string;
    pipelineName: string;
    step: string;
    branches: string[];
  };
  isInfoLoading: boolean;
  isShowRemoveButton: boolean;
  onRemovePipeline: (id: number) => void;
  onUpdatePipeline: (id: number, label: string, value: string | StringConstructor[] | unknown) => void;
  isDuplicated: boolean;
  setLoadingCompletedNumber: React.Dispatch<React.SetStateAction<number>>;
  totalPipelineNumber: number;
  stepRes?: abc;
}

export const PipelineMetricSelection = ({
  type,
  pipelineSetting,
  isShowRemoveButton,
  onRemovePipeline,
  onUpdatePipeline,
  isDuplicated,
  stepRes,
}: pipelineMetricSelectionProps) => {
  const { id, organization, pipelineName, step } = pipelineSetting;
  const storeContext = store.getState();
  const organizationNameOptions = selectPipelineOrganizations(storeContext);
  const pipelineNameOptions = selectPipelineNames(storeContext, organization);
  const stepsOptions = selectSteps(storeContext, organization, pipelineName);
  const organizationWarningMessage = selectOrganizationWarningMessage(storeContext, id);
  const pipelineNameWarningMessage = selectPipelineNameWarningMessage(storeContext, id);
  const stepWarningMessage = selectStepWarningMessage(storeContext, id);
  const [isShowNoStepWarning, setIsShowNoStepWarning] = useState(false);

  const validStepValue = stepsOptions.includes(step) ? step : '';
  const handleRemoveClick = () => {
    onRemovePipeline(id);
  };
  const handleGetPipelineData = (_pipelineName: string) => {
    console.log('update deploysetting');
  };

  return (
    <PipelineMetricSelectionWrapper>
      {organizationWarningMessage && <WarningNotification message={organizationWarningMessage} />}
      {pipelineNameWarningMessage && <WarningNotification message={pipelineNameWarningMessage} />}
      {stepWarningMessage && <WarningNotification message={stepWarningMessage} />}
      {isShowNoStepWarning && <WarningNotification message={MESSAGE.NO_STEP_WARNING} />}
      {(stepRes?.isLoading || stepRes?.isLoading === undefined) && <Loading />}
      {isDuplicated && <WarningMessage>This pipeline is the same as another one!</WarningMessage>}
      {/*{errorMessage && <ErrorNotification message={errorMessage} />}*/}
      <SingleSelection
        id={id}
        options={organizationNameOptions}
        label={'Organization'}
        value={organization}
        onUpDatePipeline={(id, label, value) => onUpdatePipeline(id, label, value)}
      />
      {organization && (
        <SingleSelection
          id={id}
          options={pipelineNameOptions}
          label={'Pipeline Name'}
          value={pipelineName}
          onGetSteps={handleGetPipelineData}
          onUpDatePipeline={(id, label, value) => onUpdatePipeline(id, label, value)}
        />
      )}
      {organization && pipelineName && (
        <SingleSelection
          id={id}
          options={stepsOptions}
          label={'Step'}
          value={validStepValue}
          isError={isShowNoStepWarning}
          errorText={NO_PIPELINE_STEP_ERROR}
          onUpDatePipeline={(id, label, value) => onUpdatePipeline(id, label, value)}
        />
      )}
      {organization && pipelineName && (
        <BranchSelection
          {...pipelineSetting}
          onUpdatePipeline={onUpdatePipeline}
          isStepLoading={stepRes?.isLoading || stepRes?.isLoading === undefined}
        />
      )}
      <ButtonWrapper>
        {isShowRemoveButton && (
          <RemoveButton data-test-id={'remove-button'} onClick={handleRemoveClick}>
            Remove
          </RemoveButton>
        )}
      </ButtonWrapper>
    </PipelineMetricSelectionWrapper>
  );
};
