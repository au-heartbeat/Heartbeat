import {
  addADeploymentFrequencySetting,
  deleteADeploymentFrequencySetting,
  IPipelineConfig,
  selectDeploymentFrequencySettings,
  selectShouldGetPipelineConfig,
  updateDeploymentFrequencySettings,
  updatePipelineStep,
  updateShouldGetPipelineConfig,
} from '@src/context/Metrics/metricsSlice';
import {
  selectPipelineCrews,
  selectStepsParams,
  updatePipelineToolVerifyResponseSteps,
} from '@src/context/config/configSlice';
import PresentationForErrorCases from '@src/components/Metrics/MetricsStep/DeploymentFrequencySettings/PresentationForErrorCases';
import { useMetricsStepValidationCheckContext } from '@src/hooks/useMetricsStepValidationCheckContext';
import { deleteMetricsPipelineFormMeta, getErrorDetail } from '@src/context/meta/metaSlice';
import { useGetPipelineToolInfoEffect } from '@src/hooks/useGetPipelineToolInfoEffect';
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import { TokenAccessAlert } from '@src/containers/MetricsStep/TokenAccessAlert';
import { useGetMetricsStepsEffect } from '@src/hooks/useGetMetricsStepsEffect';
import { StyledAlertWrapper } from '@src/containers/MetricsStep/style';
import { AddButton } from '@src/components/Common/AddButtonOneLine';
import { PipelineMetricSelection } from './PipelineMetricSelection';
import { PIPELINE_SETTING_TYPES } from '@src/constants/resources';
import { useAppDispatch, useAppSelector } from '@src/hooks';
import { Crews } from '@src/containers/MetricsStep/Crews';
import { IStepsRes } from '@src/clients/MetricsClient';
import { useEffect, useMemo, useState } from 'react';
import { Loading } from '@src/components/Loading';
import { HttpStatusCode } from 'axios';
import { store } from '@src/store';

export type MyPromiseSettledResult<T> = PromiseSettledResult<T> & {
  organization: string;
  pipelineName: string;
  id: number;
};

export const DeploymentFrequencySettings = () => {
  const dispatch = useAppDispatch();
  const { isLoading, result: pipelineInfoResult, apiCallFunc, isFirstFetch } = useGetPipelineToolInfoEffect();
  const deploymentFrequencySettings = useAppSelector(selectDeploymentFrequencySettings);
  const [loadingCompletedNumber, setLoadingCompletedNumber] = useState(0);
  const { getDuplicatedPipeLineIds } = useMetricsStepValidationCheckContext();
  const pipelineCrews = useAppSelector(selectPipelineCrews);
  const shouldGetPipelineConfig = useAppSelector(selectShouldGetPipelineConfig);
  const errorDetail = useAppSelector(getErrorDetail) as number;
  const [stepsInfo, setStepsInfo] = useState<MyPromiseSettledResult<IStepsRes | undefined>[]>([]);
  const [preDeploySetting, setPreDeploySetting] = useState<IPipelineConfig[]>(
    shouldGetPipelineConfig ? deploymentFrequencySettings : [],
  );

  const handleAddPipeline = () => {
    dispatch(addADeploymentFrequencySetting());
    setLoadingCompletedNumber((value) => value + 1);
  };
  const realDeploymentFrequencySettings = useMemo(
    () => (isFirstFetch ? [] : deploymentFrequencySettings),
    [deploymentFrequencySettings, isFirstFetch],
  );
  const handleRemovePipeline = (id: number) => {
    dispatch(deleteADeploymentFrequencySetting(id));
    dispatch(deleteMetricsPipelineFormMeta(id));
  };

  const handleUpdatePipeline = (id: number, label: string, value: string | StringConstructor[] | unknown) => {
    dispatch(updateDeploymentFrequencySettings({ updateId: id, label, value }));
  };

  const totalPipelineNumber = realDeploymentFrequencySettings.length;
  const shouldShowCrews =
    loadingCompletedNumber !== 0 && totalPipelineNumber !== 0 && loadingCompletedNumber === totalPipelineNumber;
  const { isStepLoading, errorMessage, getSteps } = useGetMetricsStepsEffect();

  useEffect(() => {
    if (isFirstFetch) return;
    const stepsParams = realDeploymentFrequencySettings.map((deploymentFrequencySetting) => {
      const { pipelineName, organization, id } = deploymentFrequencySetting;
      const { params, buildId, organizationId, pipelineType, token } = selectStepsParams(
        store.getState(),
        organization,
        pipelineName,
      );
      return { params, buildId, organizationId, pipelineType, token, id };
    });

    const promiseArray = stepsParams.map((paramsObj) => {
      const id = paramsObj.id;
      const curDeploySetting = realDeploymentFrequencySettings.find((item) => item.id === id);
      if (isNeedFetchStep(preDeploySetting[paramsObj.id], curDeploySetting)) {
        return getSteps(
          paramsObj.params,
          paramsObj.organizationId,
          paramsObj.buildId,
          paramsObj.pipelineType,
          paramsObj.token,
        );
      } else {
        const stepInfo = stepsInfo.find((item) => item.id === id);
        if (stepInfo?.status === 'rejected') {
          return Promise.reject(stepInfo?.reason);
        } else {
          return Promise.resolve(stepInfo?.value);
        }
      }
    });
    Promise.allSettled(promiseArray).then((res) => {
      setPreDeploySetting(realDeploymentFrequencySettings);
      const getOnfulfilled = (res: IStepsRes | undefined, organization: string, pipelineName: string) => {
        // if (res && !res.haveStep) {
        //   isShowRemoveButton && handleRemoveClick();
        // } else {

        const steps = res?.response ?? [];
        const branches = res?.branches ?? [];
        const pipelineCrews = res?.pipelineCrews ?? [];
        dispatch(
          updatePipelineToolVerifyResponseSteps({
            organization,
            pipelineName,
            steps,
            branches,
            pipelineCrews,
          }),
        );
        const id = realDeploymentFrequencySettings.find(
          (item) => item.organization === organization && item.pipelineName === pipelineName,
        )?.id;

        res?.haveStep && dispatch(updatePipelineStep({ steps, id, branches, pipelineCrews }));
        dispatch(updateShouldGetPipelineConfig(false));
        // }
        // res && setIsShowNoStepWarning(!res.haveStep);
      };

      const formatStepsRes = res.map((item, index) => ({
        ...item,
        organization: realDeploymentFrequencySettings[index].organization,
        pipelineName: realDeploymentFrequencySettings[index].pipelineName,
        id: realDeploymentFrequencySettings[index].id,
      }));
      formatStepsRes.forEach((formatStepRes) => {
        if (formatStepRes.status === 'fulfilled') {
          getOnfulfilled(formatStepRes.value, formatStepRes.organization, formatStepRes.pipelineName);
        }
      });
      setStepsInfo(formatStepsRes);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, getSteps, realDeploymentFrequencySettings, isFirstFetch, preDeploySetting]);
  const isNeedFetchStep = (pre: IPipelineConfig | undefined, cur: IPipelineConfig | undefined) => {
    console.log('pre', pre);
    if (pre === undefined && cur?.organization && cur.pipelineName) {
      return true;
    }
    return (
      cur !== undefined &&
      pre !== undefined &&
      cur.organization &&
      cur.pipelineName &&
      (pre.organization !== cur.organization || pre.pipelineName !== cur.pipelineName)
    );
  };

  const mtchPipeline = (
    deploymentFrequencySetting: IPipelineConfig,
    stepsInfo: MyPromiseSettledResult<IStepsRes | undefined>[],
  ) => {
    const { pipelineName, organization } = deploymentFrequencySetting;
    const matchedStepRes = stepsInfo.find((item) => {
      return item.pipelineName === pipelineName && item.organization === organization;
    });
    return matchedStepRes;
  };
  return (
    <>
      {isLoading && <Loading />}
      {pipelineInfoResult?.code !== HttpStatusCode.Ok ? (
        <PresentationForErrorCases {...pipelineInfoResult} isLoading={isLoading} retry={apiCallFunc} />
      ) : (
        <>
          <MetricsSettingTitle title={'Pipeline settings'} />
          <StyledAlertWrapper>
            <TokenAccessAlert errorDetail={errorDetail} />
          </StyledAlertWrapper>
          {realDeploymentFrequencySettings.map((deploymentFrequencySetting) => (
            <PipelineMetricSelection
              isInfoLoading={isLoading}
              key={deploymentFrequencySetting.id}
              type={PIPELINE_SETTING_TYPES.DEPLOYMENT_FREQUENCY_SETTINGS_TYPE}
              pipelineSetting={deploymentFrequencySetting}
              isShowRemoveButton={totalPipelineNumber > 1}
              onRemovePipeline={(id) => handleRemovePipeline(id)}
              onUpdatePipeline={(id, label, value) => handleUpdatePipeline(id, label, value)}
              isDuplicated={getDuplicatedPipeLineIds(realDeploymentFrequencySettings).includes(
                deploymentFrequencySetting.id,
              )}
              stepRes={mtchPipeline(deploymentFrequencySetting, stepsInfo)}
              totalPipelineNumber={totalPipelineNumber}
              setLoadingCompletedNumber={setLoadingCompletedNumber}
            />
          ))}
          <AddButton onClick={handleAddPipeline} text={'New Pipeline'} />
          {shouldShowCrews && (
            <Crews
              options={pipelineCrews}
              title={'Crew setting (optional)'}
              label={'Included Crews'}
              type={'pipeline'}
            />
          )}
        </>
      )}
    </>
  );
};
