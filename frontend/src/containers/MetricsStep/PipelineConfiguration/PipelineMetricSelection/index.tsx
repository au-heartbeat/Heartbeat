import {
  selectOrganizationWarningMessage,
  selectPipelineNameWarningMessage,
  selectStepWarningMessage,
  updatePipelineStep,
  updateShouldGetPipelineConfig,
  selectShouldGetPipelineConfig,
  updatePipelineCrews,
} from '@src/context/Metrics/metricsSlice';
import {
  updatePipelineToolVerifyResponseCrews,
  selectPipelineNames,
  selectPipelineOrganizations,
  selectSteps,
  selectStepsParams,
  updatePipelineToolVerifyResponseSteps,
  selectPipelineList,
} from '@src/context/config/configSlice';

import { FormControlWrapper } from '@src/containers/MetricsStep/PipelineConfiguration/SingleSelection/style';
import { ButtonWrapper, PipelineMetricSelectionWrapper, RemoveButton, WarningMessage } from './style';
import { SingleSelection } from '@src/containers/MetricsStep/PipelineConfiguration/SingleSelection';
import { BranchSelection } from '@src/containers/MetricsStep/PipelineConfiguration/BranchSelection';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import { useGetMetricsStepsEffect } from '@src/hooks/useGetMetricsStepsEffect';
import { addNotification } from '@src/context/notification/NotificationSlice';
import { uniqPipelineListCrews, updateResponseCrews } from '@src/utils/util';
import { MESSAGE, NO_PIPELINE_STEP_ERROR } from '@src/constants/resources';
import { shouldMetricsLoaded } from '@src/context/stepper/StepperSlice';
import { ErrorNotification } from '@src/components/ErrorNotification';
import { MetricsDataFailStatus } from '@src/constants/commons';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { useEffect, useRef, useState } from 'react';
import { Loading } from '@src/components/Loading';
import { TextField } from '@mui/material';
import { store } from '@src/store';

interface PipelineMetricSelectionProps {
  type: string;
  pipelineSetting: {
    id: number;
    organization: string;
    pipelineName: string;
    step: string;
    repoName: string;
    branches: string[];
  };
  isInfoLoading: boolean;
  isShowRemoveButton: boolean;
  onRemovePipeline: (id: number) => void;
  onUpdatePipeline: (id: number, label: string, value: string | string[]) => void;
  isDuplicated: boolean;
  setLoadingCompletedNumber: React.Dispatch<React.SetStateAction<number>>;
  totalPipelineNumber: number;
}

export const PipelineMetricSelection = ({
  type,
  pipelineSetting,
  isShowRemoveButton,
  onRemovePipeline,
  onUpdatePipeline,
  isDuplicated,
  isInfoLoading,
  setLoadingCompletedNumber,
  totalPipelineNumber,
}: PipelineMetricSelectionProps) => {
  const { id, organization, pipelineName, step, repoName } = pipelineSetting;
  const dispatch = useAppDispatch();
  const { isLoading, errorMessage, getSteps, stepFailedStatus } = useGetMetricsStepsEffect();
  const storeContext = store.getState();
  const organizationNameOptions = selectPipelineOrganizations(storeContext);
  const pipelineNameOptions = selectPipelineNames(storeContext, organization);
  const stepsOptions = selectSteps(storeContext, organization, pipelineName);
  const organizationWarningMessage = selectOrganizationWarningMessage(storeContext, id);
  const pipelineNameWarningMessage = selectPipelineNameWarningMessage(storeContext, id);
  const stepWarningMessage = selectStepWarningMessage(storeContext, id);
  const [isShowNoStepWarning, setIsShowNoStepWarning] = useState(false);
  const shouldLoad = useAppSelector(shouldMetricsLoaded);
  const pipelineList = useAppSelector(selectPipelineList);
  const shouldGetPipelineConfig = useAppSelector(selectShouldGetPipelineConfig);
  const isLoadingRef = useRef(false);

  const validStepValue = stepsOptions.includes(step) ? step : '';

  const handleRemoveClick = () => {
    const newCrews = uniqPipelineListCrews(updateResponseCrews(organization, pipelineName, pipelineList));
    dispatch(updatePipelineToolVerifyResponseCrews({ organization, pipelineName }));
    dispatch(updatePipelineCrews(newCrews));
    onRemovePipeline(id);
    setLoadingCompletedNumber((value) => Math.max(value - 1, 0));
  };

  useEffect(() => {
    !isInfoLoading && shouldLoad && shouldGetPipelineConfig && pipelineName && handleGetPipelineData(pipelineName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoad, pipelineName, isInfoLoading, shouldGetPipelineConfig]);

  useEffect(() => {
    if (isLoadingRef.current && !isLoading) {
      setLoadingCompletedNumber((value) => Math.min(totalPipelineNumber, value + 1));
    } else if (!shouldGetPipelineConfig && !isLoading) {
      setLoadingCompletedNumber(totalPipelineNumber);
    }
    isLoadingRef.current = isLoading;
  }, [isLoading, setLoadingCompletedNumber, totalPipelineNumber, shouldGetPipelineConfig]);

  const handleGetPipelineData = (_pipelineName: string) => {
    const { params, buildId, organizationId, pipelineType, token } = selectStepsParams(
      store.getState(),
      organization,
      _pipelineName,
    );
    setLoadingCompletedNumber((value) => Math.max(value - 1, 0));
    getSteps(params, organizationId, buildId, pipelineType, token).then((res) => {
      const steps = res?.response ?? [];
      const branches = res?.branches ?? [];
      const pipelineCrews = res?.pipelineCrews ?? [];
      dispatch(
        updatePipelineToolVerifyResponseSteps({
          organization,
          pipelineName: _pipelineName,
          steps,
          branches,
          pipelineCrews,
        }),
      );
      res?.haveStep && dispatch(updatePipelineStep({ steps, id, type, branches, pipelineCrews }));
      dispatch(updateShouldGetPipelineConfig(false));
      res && setIsShowNoStepWarning(!res.haveStep);
    });
  };

  useEffect(() => {
    const popup = () => {
      if (stepFailedStatus === MetricsDataFailStatus.PartialFailed4xx) {
        dispatch(
          addNotification({
            type: 'warning',
            message: MESSAGE.PIPELINE_STEP_REQUEST_PARTIAL_FAILED_4XX,
          }),
        );
      } else if (
        stepFailedStatus === MetricsDataFailStatus.PartialFailedNoCards ||
        stepFailedStatus === MetricsDataFailStatus.PartialFailedTimeout
      ) {
        dispatch(
          addNotification({
            type: 'warning',
            message: MESSAGE.PIPELINE_STEP_REQUEST_PARTIAL_FAILED_OTHERS,
          }),
        );
      }
    };
    if (!isLoading) {
      popup();
    }
  }, [stepFailedStatus, dispatch, isLoading]);

  return (
    <PipelineMetricSelectionWrapper>
      {organizationWarningMessage && <WarningNotification message={organizationWarningMessage} />}
      {pipelineNameWarningMessage && <WarningNotification message={pipelineNameWarningMessage} />}
      {stepWarningMessage && <WarningNotification message={stepWarningMessage} />}
      {isShowNoStepWarning && <WarningNotification message={MESSAGE.NO_STEP_WARNING} />}
      {isLoading && <Loading />}
      {isDuplicated && <WarningMessage>This pipeline is the same as another one!</WarningMessage>}
      {errorMessage && <ErrorNotification message={errorMessage} />}
      <SingleSelection
        id={id}
        options={organizationNameOptions}
        label={'Organization'}
        value={organization}
        onUpdate={(id, label, value) => onUpdatePipeline(id, label, value)}
      />
      {organization && (
        <SingleSelection
          id={id}
          options={pipelineNameOptions}
          label={'Pipeline Name'}
          value={pipelineName}
          onGetSteps={handleGetPipelineData}
          onUpdate={(id, label, value) => onUpdatePipeline(id, label, value)}
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
          onUpdate={(id, label, value) => onUpdatePipeline(id, label, value)}
        />
      )}
      {organization && (
        <FormControlWrapper variant='standard'>
          <TextField disabled id='filled-disabled' label='Repo Name' defaultValue={repoName} variant='standard' />
        </FormControlWrapper>
      )}
      {organization && pipelineName && (
        <BranchSelection {...pipelineSetting} onUpdate={onUpdatePipeline} isStepLoading={isLoading} />
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
