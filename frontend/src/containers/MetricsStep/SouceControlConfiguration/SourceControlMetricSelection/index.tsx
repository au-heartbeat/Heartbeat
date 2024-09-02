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
import { selectSourceControlConfigurationSettings } from '@src/context/Metrics/metricsSlice';
import { Loading } from '@src/components/Loading';
import { useAppSelector } from '@src/hooks';
import { store } from '@src/store';
import { useEffect } from 'react';

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
  const {
    isLoading: repoIsLoading,
    getSourceControlRepoInfo,
    isGetRepo,
  } = useGetSourceControlConfigurationRepoEffect();
  const {
    isLoading: branchIsLoading,
    getSourceControlBranchInfo,
    isGetBranch,
  } = useGetSourceControlConfigurationBranchEffect();
  const {
    isLoading: crewIsLoading,
    getSourceControlCrewInfo,
    isGetAllCrews,
  } = useGetSourceControlConfigurationCrewEffect();
  const storeContext = store.getState();
  const organizationNameOptions = selectSourceControlOrganizations(storeContext);
  const repoNameOptions = selectSourceControlRepos(storeContext, organization);
  const branchNameOptions = selectSourceControlBranches(storeContext, organization, repo);
  const dateRanges = useAppSelector(selectDateRange);
  const sourceControlList = useAppSelector(selectSourceControlConfigurationSettings);

  const selectedBranches = sourceControlList.find((it) => it.id === id)?.branches;
  const isLoading = repoIsLoading || branchIsLoading || crewIsLoading;

  const handleRemoveClick = () => {
    onRemoveSourceControl(id);
    setLoadingCompletedNumber((value) => Math.max(value - 1, 0));
  };

  useEffect(() => {
    if (!isGetRepo && organization) {
      getSourceControlRepoInfo(organization);
    }
  }, [getSourceControlRepoInfo, isGetRepo, organization]);

  useEffect(() => {
    if (!isGetBranch && organization && repo) {
      getSourceControlBranchInfo(organization, repo);
    }
  }, [getSourceControlBranchInfo, getSourceControlRepoInfo, isGetBranch, organization, repo]);

  useEffect(() => {
    if (!isGetAllCrews && organization && repo && selectedBranches) {
      selectedBranches.forEach((it) => getSourceControlCrewInfo(organization, repo, it, dateRanges));
    }
  }, [
    dateRanges,
    getSourceControlBranchInfo,
    getSourceControlCrewInfo,
    getSourceControlRepoInfo,
    isGetAllCrews,
    organization,
    repo,
    selectedBranches,
  ]);

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
    branchNeedGetCrews.forEach((branch) => getSourceControlCrewInfo(organization, repo, branch, dateRanges));
  };
  useEffect(() => {
    if (isGetAllCrews) {
      setLoadingCompletedNumber((value) => Math.min(totalSourceControlNumber, value + 1));
    }
  }, [isGetAllCrews, setLoadingCompletedNumber, totalSourceControlNumber]);

  return (
    <PipelineMetricSelectionWrapper>
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
