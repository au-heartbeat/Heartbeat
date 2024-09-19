import {
  addOneSourceControlSetting,
  deleteSourceControlConfigurationSettings,
  selectSourceControlConfigurationSettings,
  updateSourceControlConfigurationSettings,
} from '@src/context/Metrics/metricsSlice';
import {
  ISourceControlGetBranchResponseDTO,
  ISourceControlGetCrewResponseDTO,
  ISourceControlGetOrganizationResponseDTO,
  ISourceControlGetRepoResponseDTO,
} from '@src/clients/sourceControl/dto/response';
import { useGetSourceControlConfigurationOrganizationEffect } from '@src/hooks/useGetSourceControlConfigurationOrganizationEffect';
import PresentationForErrorCases from '@src/components/Metrics/MetricsStep/DeploymentFrequencySettings/PresentationForErrorCases';
import { SourceControlMetricSelection } from '@src/containers/MetricsStep/SouceControlConfiguration/SourceControlMetricSelection';
import { selectDateRange, selectPipelineTool, selectSourceControlCrews } from '@src/context/config/configSlice';
import { useMetricsStepValidationCheckContext } from '@src/hooks/useMetricsStepValidationCheckContext';
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import { TokenAccessAlert } from '@src/containers/MetricsStep/TokenAccessAlert';
import { StyledAlertWrapper } from '@src/containers/MetricsStep/style';
import { PIPELINE_TOOL_OTHER_OPTION } from '@src/constants/resources';
import { AddButton } from '@src/components/Common/AddButtonOneLine';
import { getErrorDetail } from '@src/context/meta/metaSlice';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { Crews } from '@src/containers/MetricsStep/Crews';
import { Loading } from '@src/components/Loading';
import { useEffect, useState } from 'react';
import { HttpStatusCode } from 'axios';
import { store } from '@src/store';
import dayjs from 'dayjs';

export type ErrorInfoType =
  | ISourceControlGetOrganizationResponseDTO
  | ISourceControlGetRepoResponseDTO
  | ISourceControlGetBranchResponseDTO
  | ISourceControlGetCrewResponseDTO;

export const SourceControlConfiguration = () => {
  const dispatch = useAppDispatch();
  const storeContext = store.getState();
  const { isLoading, getSourceControlInfo, info, isFirstFetch } = useGetSourceControlConfigurationOrganizationEffect();
  const errorDetail = useAppSelector(getErrorDetail) as number;
  const sourceControlConfigurationSettings = useAppSelector(selectSourceControlConfigurationSettings);
  const { getDuplicatedSourceControlIds } = useMetricsStepValidationCheckContext();
  const [loadingCompletedNumber, setLoadingCompletedNumber] = useState(0);
  const [errorInfo, setErrorInfo] = useState<ErrorInfoType>(info);
  const dateRanges = useAppSelector(selectDateRange);
  const realSourceControlConfigurationSettings = isFirstFetch ? [] : sourceControlConfigurationSettings;
  const totalSourceControlNumber = realSourceControlConfigurationSettings.length;
  const pipelineTools = useAppSelector(selectPipelineTool);

  const sourceControlCrews = [
    ...new Set(
      realSourceControlConfigurationSettings.flatMap((it) =>
        it.branches?.flatMap((branch) =>
          dateRanges.flatMap((dateRange) =>
            selectSourceControlCrews(
              storeContext,
              it.organization,
              it.repo,
              branch,
              dayjs(dateRange.startDate).startOf('date').valueOf(),
              dayjs(dateRange.endDate).startOf('date').valueOf(),
            ),
          ),
        ),
      ),
    ),
  ];

  const handleRemoveSourceControl = (id: number) => {
    dispatch(deleteSourceControlConfigurationSettings(id));
  };
  const handleAddSourceControl = () => {
    dispatch(addOneSourceControlSetting());
  };

  const handleUpdateSourceControl = (id: number, label: string, value: string | StringConstructor[] | string[]) => {
    dispatch(updateSourceControlConfigurationSettings({ updateId: id, label: label.toLowerCase(), value }));
  };
  const handleUpdateErrorInfo = (newErrorInfo: ErrorInfoType) => {
    const errorInfoList: ErrorInfoType[] = [newErrorInfo, info].filter((it) => it.code !== HttpStatusCode.Ok);
    const errorInfo = errorInfoList.length === 0 ? info : errorInfoList[0];
    setErrorInfo(errorInfo);
  };

  useEffect(() => {
    handleUpdateErrorInfo(errorInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info]);

  const shouldShowCrews =
    loadingCompletedNumber !== 0 &&
    totalSourceControlNumber !== 0 &&
    loadingCompletedNumber === totalSourceControlNumber;

  const isShowRemoveButton = pipelineTools.type === PIPELINE_TOOL_OTHER_OPTION ? totalSourceControlNumber > 1 : true;

  return (
    <>
      {isLoading && <Loading />}
      {errorInfo?.code !== HttpStatusCode.Ok ? (
        <PresentationForErrorCases {...errorInfo} isLoading={isLoading} retry={getSourceControlInfo} />
      ) : (
        <>
          <MetricsSettingTitle title={'Source control settings'} />
          <StyledAlertWrapper>
            <TokenAccessAlert errorDetail={errorDetail} />
          </StyledAlertWrapper>
          {realSourceControlConfigurationSettings.map((sourceControlConfigurationSetting) => (
            <SourceControlMetricSelection
              key={sourceControlConfigurationSetting.id}
              sourceControlSetting={sourceControlConfigurationSetting}
              isShowRemoveButton={isShowRemoveButton}
              onRemoveSourceControl={(id) => handleRemoveSourceControl(id)}
              onUpdateSourceControl={(id, label, value) => handleUpdateSourceControl(id, label, value)}
              isDuplicated={getDuplicatedSourceControlIds(realSourceControlConfigurationSettings).includes(
                sourceControlConfigurationSetting.id,
              )}
              handleUpdateErrorInfo={handleUpdateErrorInfo}
              totalSourceControlNumber={totalSourceControlNumber}
              setLoadingCompletedNumber={setLoadingCompletedNumber}
            />
          ))}
          <AddButton onClick={handleAddSourceControl} text={'New Repo'} />
          {shouldShowCrews && (
            <Crews
              options={sourceControlCrews}
              title={'Crew setting (optional)'}
              label={'Included Crews'}
              type={'source-control'}
            />
          )}
        </>
      )}
    </>
  );
};
