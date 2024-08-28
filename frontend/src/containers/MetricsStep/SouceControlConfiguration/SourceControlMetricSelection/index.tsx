import {
  selectOrganizationWarningMessage,
  selectPipelineNameWarningMessage,
  selectStepWarningMessage,
  selectSourceControlConfigurationSettings,
} from '@src/context/Metrics/metricsSlice';
import {
  ButtonWrapper,
  PipelineMetricSelectionWrapper,
  RemoveButton,
  WarningMessage,
} from '@src/containers/MetricsStep/DeploymentFrequencySettings/PipelineMetricSelection/style';
import {
  selectSourceControlOrganizations,
  selectSourceControlRepos,
  selectSourceControlBranches,
  selectDateRange,
} from '@src/context/config/configSlice';
import { useGetSourceControlConfigurationBranchEffect } from '@src/hooks/useGetSourceControlConfigurationBranchEffect';
import { useGetSourceControlConfigurationRepoEffect } from '@src/hooks/useGetSourceControlConfigurationRepoEffect';
import { useGetSourceControlConfigurationCrewEffect } from '@src/hooks/useGetSourceControlConfigurationCrewEffect';
import { SourceControlBranch } from '@src/containers/MetricsStep/SouceControlConfiguration/SourceControlBranch';
import { SingleSelection } from '@src/containers/MetricsStep/DeploymentFrequencySettings/SingleSelection';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import { Loading } from '@src/components/Loading';
import { useAppSelector } from '@src/hooks';
import { useEffect, useRef } from 'react';
import { store } from '@src/store';
import dayjs from 'dayjs';

interface SourceControlMetricSelectionProps {
  sourceControlSetting: {
    id: number;
    organization: string;
    repo: string;
    branches: string[];
  };
  isShowRemoveButton: boolean;
  onRemoveSourceControl: (id: number) => void;
  onUpdateSourceControl: (id: number, label: string, value: string | StringConstructor[] | unknown) => void;
  isDuplicated: boolean;
  setLoadingCompletedNumber: React.Dispatch<React.SetStateAction<number>>;
  totalSourceControlNumber: number;
}

export const SourceControlMetricSelection = ({
  sourceControlSetting,
  isShowRemoveButton,
  onRemoveSourceControl,
  onUpdateSourceControl,
  isDuplicated,
  setLoadingCompletedNumber,
  totalSourceControlNumber,
}: SourceControlMetricSelectionProps) => {
  const { id, organization, repo } = sourceControlSetting;
  const { isLoading: repoIsLoading, getSourceControlRepoInfo } = useGetSourceControlConfigurationRepoEffect();
  const { isLoading: branchIsLoading, getSourceControlBranchInfo } = useGetSourceControlConfigurationBranchEffect();
  const { isLoading: crewIsLoading, getSourceControlCrewInfo } = useGetSourceControlConfigurationCrewEffect();
  const storeContext = store.getState();
  const organizationNameOptions = selectSourceControlOrganizations(storeContext);
  const repoNameOptions = selectSourceControlRepos(storeContext, organization);
  const branchNameOptions = selectSourceControlBranches(storeContext, organization, repo);
  const organizationWarningMessage = selectOrganizationWarningMessage(storeContext, id);
  const pipelineNameWarningMessage = selectPipelineNameWarningMessage(storeContext, id);
  const stepWarningMessage = selectStepWarningMessage(storeContext, id);
  const dateRanges = useAppSelector(selectDateRange);
  const sourceControlList = useAppSelector(selectSourceControlConfigurationSettings);
  const isLoadingRef = useRef(false);

  const selectedBranches = sourceControlList.find((it) => it.id === id)?.branches;
  const isLoading = repoIsLoading || branchIsLoading || crewIsLoading;

  const handleRemoveClick = () => {
    onRemoveSourceControl(id);
    setLoadingCompletedNumber((value) => Math.max(value - 1, 0));
  };

  const handleOnUpdateOrganization = (id: number, label: string, value: string | []): void => {
    onUpdateSourceControl(id, label, value);
    getSourceControlRepoInfo(value.toString());
  };

  const handleOnUpdateRepo = (id: number, label: string, value: string | []): void => {
    onUpdateSourceControl(id, label, value);
    getSourceControlBranchInfo(organization, value.toString());
  };

  const handleOnUpdateBranches = (id: number, label: string, value: string[]): void => {
    const branchNeedGetCrews = value.filter((it) => selectedBranches?.every((branch) => branch !== it));
    onUpdateSourceControl(id, label, value);

    dateRanges.forEach((dateRange) => {
      branchNeedGetCrews.forEach((branch) =>
        getSourceControlCrewInfo(
          organization,
          repo,
          branch,
          dayjs(dateRange.startDate).startOf('date').valueOf(),
          dayjs(dateRange.endDate).startOf('date').valueOf(),
        ),
      );
    });
  };

  useEffect(() => {
    if (!isLoading) {
      setLoadingCompletedNumber(totalSourceControlNumber);
      if (isLoadingRef.current) {
        setLoadingCompletedNumber((value) => Math.min(totalSourceControlNumber, value + 1));
      }
    }
    isLoadingRef.current = isLoading;
  }, [isLoading, setLoadingCompletedNumber, totalSourceControlNumber]);

  return (
    <PipelineMetricSelectionWrapper>
      {organizationWarningMessage && <WarningNotification message={organizationWarningMessage} />}
      {pipelineNameWarningMessage && <WarningNotification message={pipelineNameWarningMessage} />}
      {stepWarningMessage && <WarningNotification message={stepWarningMessage} />}
      {isLoading && <Loading />}
      {isDuplicated && <WarningMessage>This source control is the same as another one!</WarningMessage>}
      <SingleSelection
        id={id}
        options={organizationNameOptions}
        label={'Organization'}
        value={organization}
        onUpdate={handleOnUpdateOrganization}
      />
      {organization && (
        <SingleSelection id={id} options={repoNameOptions} label={'Repo'} value={repo} onUpdate={handleOnUpdateRepo} />
      )}
      {organization && repo && (
        <SourceControlBranch {...sourceControlSetting} branches={branchNameOptions} onUpdate={handleOnUpdateBranches} />
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
