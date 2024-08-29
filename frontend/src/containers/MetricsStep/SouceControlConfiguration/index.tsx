import {
  addOneSourceControlSetting,
  deleteSourceControlConfigurationSettings,
  selectSourceControlConfigurationSettings,
  updateSourceControlConfigurationSettings,
} from '@src/context/Metrics/metricsSlice';
import { useGetSourceControlConfigurationOrganizationEffect } from '@src/hooks/useGetSourceControlConfigurationOrganizationEffect';
import PresentationForErrorCases from '@src/components/Metrics/MetricsStep/DeploymentFrequencySettings/PresentationForErrorCases';
import { SourceControlMetricSelection } from '@src/containers/MetricsStep/SouceControlConfiguration/SourceControlMetricSelection';
import { useMetricsStepValidationCheckContext } from '@src/hooks/useMetricsStepValidationCheckContext';
import { selectDateRange, selectSourceControlCrews } from '@src/context/config/configSlice';
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import { TokenAccessAlert } from '@src/containers/MetricsStep/TokenAccessAlert';
import { StyledAlertWrapper } from '@src/containers/MetricsStep/style';
import { AddButton } from '@src/components/Common/AddButtonOneLine';
import { getErrorDetail } from '@src/context/meta/metaSlice';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { Crews } from '@src/containers/MetricsStep/Crews';
import { Loading } from '@src/components/Loading';
import { HttpStatusCode } from 'axios';
import { store } from '@src/store';
import { useState } from 'react';
import dayjs from 'dayjs';

export const SourceControlConfiguration = () => {
  const dispatch = useAppDispatch();
  const storeContext = store.getState();
  const { isLoading, getSourceControlInfo, info, isFirstFetch } = useGetSourceControlConfigurationOrganizationEffect();
  const errorDetail = useAppSelector(getErrorDetail) as number;
  const sourceControlConfigurationSettings = useAppSelector(selectSourceControlConfigurationSettings);
  const { getDuplicatedSourceControlIds } = useMetricsStepValidationCheckContext();
  const [loadingCompletedNumber, setLoadingCompletedNumber] = useState(0);
  const dateRanges = useAppSelector(selectDateRange);
  const realSourceControlConfigurationSettings = isFirstFetch ? [] : sourceControlConfigurationSettings;
  const totalSourceControlNumber = realSourceControlConfigurationSettings.length;

  const sourceControlCrews = realSourceControlConfigurationSettings.flatMap((it) =>
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
  );

  const handleRemoveSourceControl = (id: number) => {
    dispatch(deleteSourceControlConfigurationSettings(id));
  };
  const handleAddSourceControl = () => {
    dispatch(addOneSourceControlSetting());
    setLoadingCompletedNumber((value) => value + 1);
  };

  const handleUpdateSourceControl = (id: number, label: string, value: string | StringConstructor[] | unknown) => {
    dispatch(updateSourceControlConfigurationSettings({ updateId: id, label: label.toLowerCase(), value }));
  };

  const shouldShowCrews =
    loadingCompletedNumber !== 0 &&
    totalSourceControlNumber !== 0 &&
    loadingCompletedNumber === totalSourceControlNumber;

  return (
    <>
      {isLoading && <Loading />}
      {info?.code !== HttpStatusCode.Ok ? (
        <PresentationForErrorCases {...info} isLoading={isLoading} retry={getSourceControlInfo} />
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
              isShowRemoveButton={totalSourceControlNumber > 1}
              onRemoveSourceControl={(id) => handleRemoveSourceControl(id)}
              onUpdateSourceControl={(id, label, value) => handleUpdateSourceControl(id, label, value)}
              isDuplicated={getDuplicatedSourceControlIds(realSourceControlConfigurationSettings).includes(
                sourceControlConfigurationSetting.id,
              )}
              totalSourceControlNumber={totalSourceControlNumber}
              setLoadingCompletedNumber={setLoadingCompletedNumber}
            />
          ))}
          <AddButton onClick={handleAddSourceControl} text={'New Pipeline'} />
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
