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
import {
  selectSourceControlConfigurationSettings,
  updateShouldGetSourceControlConfig,
} from '@src/context/Metrics/metricsSlice';
import { useGetSourceControlConfigurationBranchEffect } from '@src/hooks/useGetSourceControlConfigurationBranchEffect';
import { useGetSourceControlConfigurationRepoEffect } from '@src/hooks/useGetSourceControlConfigurationRepoEffect';
import { useGetSourceControlConfigurationCrewEffect } from '@src/hooks/useGetSourceControlConfigurationCrewEffect';
import { SourceControlBranch } from '@src/containers/MetricsStep/SouceControlConfiguration/SourceControlBranch';
import { SingleSelection } from '@src/containers/MetricsStep/DeploymentFrequencySettings/SingleSelection';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { Loading } from '@src/components/Loading';
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
  onUpdateSourceControl: (id: number, label: string, value: string | StringConstructor[] | string[]) => void;
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
  const dispatch = useAppDispatch();
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
    if (!isGetRepo && organization && repoNameOptions.length === 0) {
      getSourceControlRepoInfo(organization, dateRanges, id);
    }
  }, [dateRanges, getSourceControlRepoInfo, id, isGetRepo, organization, repoNameOptions.length]);

  useEffect(() => {
    if (!isGetBranch && organization && repo && branchNameOptions.length === 0) {
      getSourceControlBranchInfo(organization, repo, id);
    }
  }, [
    branchNameOptions.length,
    getSourceControlBranchInfo,
    getSourceControlRepoInfo,
    id,
    isGetBranch,
    organization,
    repo,
  ]);

  useEffect(() => {
    if (!isGetAllCrews && organization && repo && selectedBranches) {
      Promise.all(selectedBranches.map((it) => getSourceControlCrewInfo(organization, repo, it, dateRanges))).then(
        () => {
          dispatch(updateShouldGetSourceControlConfig(false));
        },
      );
    }
  }, [
    dateRanges,
    dispatch,
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
    getSourceControlRepoInfo(value.toString(), dateRanges, id);
  };

  const handleOnUpdateRepo = (id: number, label: string, value: string | []): void => {
    onUpdateSourceControl(id, label, value);
    getSourceControlBranchInfo(organization, value.toString(), id);
  };

  const handleOnUpdateBranches = (id: number, label: string, value: string[]): void => {
    const branchNeedGetCrews = value.filter((it) => selectedBranches?.every((branch) => branch !== it));
    onUpdateSourceControl(id, label, value);
    Promise.all(
      branchNeedGetCrews.map((branch) => getSourceControlCrewInfo(organization, repo, branch, dateRanges)),
    ).then(() => {
      dispatch(updateShouldGetSourceControlConfig(false));
    });
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
