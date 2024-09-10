import {
  basicInfoSchema,
  boardConfigSchema,
  pipelineToolSchema,
  sourceControlSchema,
  IBasicInfoData,
  IBoardConfigData,
  IPipelineToolData,
  ISourceControlData,
} from '@src/containers/ConfigStep/Form/schema';
import {
  selectConfig,
  selectDateRange,
  selectMetrics,
  selectPipelineList,
  selectPipelineTool,
  selectSourceControlBranches,
  selectSourceControlCrews,
} from '@src/context/config/configSlice';
import {
  ISavedMetricsSettingState,
  ISourceControlConfig,
  selectCycleTimeSettings,
  selectMetricsContent,
} from '@src/context/Metrics/metricsSlice';
import {
  CycleTimeSettingsTypes,
  DONE,
  METRICS_CONSTANTS,
  PIPELINE_TOOL_OTHER_OPTION,
  RequiredData,
  TIPS,
} from '@src/constants/resources';
import {
  BackButton,
  ButtonContainer,
  NextButton,
  SaveButton,
  StyledStep,
  StyledStepLabel,
  StyledStepper,
} from './style';
import { backStep, nextStep, selectStepNumber, updateTimeStamp } from '@src/context/stepper/StepperSlice';
import { useMetricsStepValidationCheckContext } from '@src/hooks/useMetricsStepValidationCheckContext';
import { convertCycleTimeSettings, exportToJsonFile, onlyEmptyAndDoneState } from '@src/utils/util';
import { useDefaultValues } from '@src/containers/ConfigStep/Form/useDefaultValues';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { PageContentWrapper } from '@src/components/Common/PageContentWrapper';
import { COMMON_BUTTONS, METRICS_STEPS, STEPS } from '@src/constants/commons';
import { ConfirmDialog } from '@src/containers/MetricsStepper/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import { getFormMeta } from '@src/context/meta/metaSlice';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { Route } from '@src/constants/router';
import { useForm } from 'react-hook-form';
import { Tooltip } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { store } from '@src/store';
import every from 'lodash/every';
import omit from 'lodash/omit';
import dayjs from 'dayjs';

const ConfigStep = lazy(() => import('@src/containers/ConfigStep'));
const MetricsStep = lazy(() => import('@src/containers/MetricsStep'));
const ReportStep = lazy(() => import('@src/containers/ReportStep'));

/* istanbul ignore next */
const MetricsStepper = () => {
  const storeContext = store.getState();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeStep = useAppSelector(selectStepNumber);
  const [isDialogShowing, setIsDialogShowing] = useState(false);
  const requiredData = useAppSelector(selectMetrics);
  const config = useAppSelector(selectConfig);
  const dateRanges = useAppSelector(selectDateRange);
  const metricsConfig = useAppSelector(selectMetricsContent);
  const cycleTimeSettings = useAppSelector(selectCycleTimeSettings);
  const [isDisableNextButton, setIsDisableNextButton] = useState(true);
  const { getDuplicatedPipeLineIds, getDuplicatedSourceControlIds } = useMetricsStepValidationCheckContext();
  const formMeta = useAppSelector(getFormMeta);
  const pipelineList = useAppSelector(selectPipelineList);
  const pipelineTools = useAppSelector(selectPipelineTool);
  const defaultValues = useDefaultValues();
  const { isShow: isShowBoard } = config.board;
  const { isShow: isShowPipeline } = config.pipelineTool;
  const { isShow: isShowSourceControl } = config.sourceControl;

  const basicInfoMethods = useForm<IBasicInfoData>({
    defaultValues: defaultValues.basicInfoWithImport,
    resolver: yupResolver(basicInfoSchema),
    mode: 'onChange',
  });

  const boardConfigMethods = useForm<IBoardConfigData>({
    defaultValues: defaultValues.boardConfigWithImport,
    resolver: yupResolver(boardConfigSchema),
    mode: 'onChange',
  });

  const pipelineToolMethods = useForm<IPipelineToolData>({
    defaultValues: defaultValues.pipelineToolWithImport,
    resolver: yupResolver(pipelineToolSchema),
    mode: 'onChange',
  });

  const sourceControlMethods = useForm<ISourceControlData>({
    defaultValues: defaultValues.sourceControlWithImport,
    resolver: yupResolver(sourceControlSchema),
    mode: 'onChange',
  });

  const getSourceControlCrews = useCallback(
    (sourceControlConfigurationSetting: ISourceControlConfig) => {
      return sourceControlConfigurationSetting.branches?.flatMap((branch) =>
        dateRanges.flatMap((dateRange) =>
          selectSourceControlCrews(
            storeContext,
            sourceControlConfigurationSetting.organization,
            sourceControlConfigurationSetting.repo,
            branch,
            dayjs(dateRange.startDate).startOf('date').valueOf(),
            dayjs(dateRange.endDate).startOf('date').valueOf(),
          ),
        ),
      );
    },
    [dateRanges, storeContext],
  );

  const { isValid: isBasicInfoValid } = basicInfoMethods.formState;
  const { isValid: isBoardConfigValid, isSubmitSuccessful: isBoardConfigSubmitSuccessful } =
    boardConfigMethods.formState;
  const { isValid: isPipelineToolValid, isSubmitSuccessful: isPipelineToolSubmitSuccessful } =
    pipelineToolMethods.formState;
  const { isValid: isSourceControlValid, isSubmitSuccessful: isSourceControlSubmitSuccessful } =
    sourceControlMethods.formState;

  const configPageFormMeta = useMemo(
    () => [
      { isShow: isShowBoard, isValid: isBoardConfigValid, isSubmitSuccessful: isBoardConfigSubmitSuccessful },
      {
        isShow: isShowPipeline,
        isValid: config.pipelineTool.config.type === PIPELINE_TOOL_OTHER_OPTION ? true : isPipelineToolValid,
        isSubmitSuccessful:
          config.pipelineTool.config.type === PIPELINE_TOOL_OTHER_OPTION ? true : isPipelineToolSubmitSuccessful,
      },
      {
        isShow: isShowSourceControl,
        isValid: isSourceControlValid,
        isSubmitSuccessful: isSourceControlSubmitSuccessful,
      },
    ],
    [
      isShowBoard,
      isBoardConfigValid,
      isBoardConfigSubmitSuccessful,
      isShowPipeline,
      config.pipelineTool.config.type,
      isPipelineToolValid,
      isPipelineToolSubmitSuccessful,
      isShowSourceControl,
      isSourceControlValid,
      isSourceControlSubmitSuccessful,
    ],
  );
  const activeFormMeta = useMemo(() => configPageFormMeta.filter(({ isShow }) => isShow), [configPageFormMeta]);
  const shownFormsVerified = useMemo(
    () =>
      activeFormMeta.length > 0 &&
      activeFormMeta.every(({ isValid, isSubmitSuccessful }) => isValid && isSubmitSuccessful),
    [activeFormMeta],
  );

  const isShowCycleTimeSettings =
    requiredData.includes(RequiredData.CycleTime) ||
    requiredData.includes(RequiredData.Classification) ||
    requiredData.includes(RequiredData.Velocity);
  const isCycleTimeSettingsVerified = cycleTimeSettings.some((e) => e.value === DONE);
  const boardingMappingStatus = [...new Set(cycleTimeSettings.map((item) => item.value))];
  const isOnlyEmptyAndDoneState = onlyEmptyAndDoneState(boardingMappingStatus);
  const onlyIncludeReworkMetrics = requiredData.includes(RequiredData.ReworkTimes) && requiredData.length === 1;
  const isShowClassificationSetting = requiredData.includes(RequiredData.Classification);
  const isShowReworkSettings = requiredData.includes(RequiredData.ReworkTimes);
  const isClassificationSettingVerified = metricsConfig.targetFields.some((item) => item.flag);
  const isReworkStateSelected = !!metricsConfig.importedData.reworkTimesSettings.reworkState;
  const { metrics, projectName, dateRange } = config.basic;

  const isShowRealDone =
    isShowBoard &&
    metricsConfig.cycleTimeSettingsType === CycleTimeSettingsTypes.BY_COLUMN &&
    metricsConfig.cycleTimeSettings.filter(({ value }) => value === METRICS_CONSTANTS.doneValue).length > 1;
  const isShowDeploymentFrequency =
    (requiredData.includes(RequiredData.DeploymentFrequency) ||
      requiredData.includes(RequiredData.PipelineChangeFailureRate) ||
      requiredData.includes(RequiredData.LeadTimeForChanges) ||
      requiredData.includes(RequiredData.PipelineMeanTimeToRecovery)) &&
    pipelineTools.type !== PIPELINE_TOOL_OTHER_OPTION;
  const isShowSourceControlConfiguration =
    requiredData.includes(RequiredData.LeadTimeForChanges) &&
    !requiredData.includes(RequiredData.DeploymentFrequency) &&
    !requiredData.includes(RequiredData.PipelineChangeFailureRate) &&
    !requiredData.includes(RequiredData.PipelineMeanTimeToRecovery) &&
    pipelineTools.type === PIPELINE_TOOL_OTHER_OPTION;
  const isCrewsSettingValid = metricsConfig.users.length > 0;
  const isRealDoneValid = metricsConfig.doneColumn.length > 0;

  const isDeploymentFrequencyValid = useMemo(() => {
    const pipelines = metricsConfig.deploymentFrequencySettings;
    const pipelinesFormMeta = formMeta.metrics.pipelines;
    const selectedPipelines = pipelineList.filter((pipeline) => {
      const selectedPipelineName = pipelines.map((item) => item.pipelineName);
      const selectedPipelineOrgName = pipelines.map((item) => item.organization);
      return selectedPipelineName.includes(pipeline.name) && selectedPipelineOrgName.includes(pipeline.orgName);
    });

    return (
      !isEmpty(selectedPipelines) &&
      pipelines.every(({ step }) => !isEmpty(step)) &&
      pipelines.every(({ branches }) => !isEmpty(branches)) &&
      selectedPipelines.every(({ steps }) => !isEmpty(steps)) &&
      selectedPipelines.every(({ branches }) => !isEmpty(branches)) &&
      getDuplicatedPipeLineIds(pipelines).length === 0 &&
      every(pipelinesFormMeta, (item) => every(item.branches, (branch) => !branch.error && !branch.needVerify))
    );
  }, [pipelineList, formMeta.metrics.pipelines, getDuplicatedPipeLineIds, metricsConfig.deploymentFrequencySettings]);

  const isSourceControlConfigurationValid = useMemo(() => {
    const sourceControlConfigurationSettings = metricsConfig.sourceControlConfigurationSettings;

    const selectedSourceControls = sourceControlConfigurationSettings.filter((sourceControl) => {
      const allBranches = selectSourceControlBranches(storeContext, sourceControl.organization, sourceControl.repo);
      return sourceControl.branches.every((it) => allBranches.includes(it));
    });

    const sourceControlCrews = [
      ...new Set(sourceControlConfigurationSettings.flatMap((it) => getSourceControlCrews(it))),
    ];

    return (
      !isEmpty(selectedSourceControls) &&
      !isEmpty(sourceControlCrews) &&
      sourceControlConfigurationSettings.every(({ organization }) => !isEmpty(organization)) &&
      sourceControlConfigurationSettings.every(({ repo }) => !isEmpty(repo)) &&
      sourceControlConfigurationSettings.every(({ branches }) => !isEmpty(branches)) &&
      selectedSourceControls.every(({ organization }) => !isEmpty(organization)) &&
      selectedSourceControls.every(({ repo }) => !isEmpty(repo)) &&
      selectedSourceControls.every(({ branches }) => !isEmpty(branches)) &&
      getDuplicatedSourceControlIds(sourceControlConfigurationSettings).length === 0
    );
  }, [
    metricsConfig.sourceControlConfigurationSettings,
    getSourceControlCrews,
    getDuplicatedSourceControlIds,
    storeContext,
  ]);

  useEffect(() => {
    if (activeStep === METRICS_STEPS.METRICS) {
      const nextButtonValidityOptions = [
        { isShow: isShowBoard, isValid: isCrewsSettingValid },
        { isShow: isShowRealDone, isValid: isRealDoneValid },
        { isShow: isShowDeploymentFrequency, isValid: isDeploymentFrequencyValid },
        { isShow: isShowSourceControlConfiguration, isValid: isSourceControlConfigurationValid },
        { isShow: isShowCycleTimeSettings, isValid: isCycleTimeSettingsVerified },
        { isShow: isShowClassificationSetting, isValid: isClassificationSettingVerified },
        {
          isShow: isShowReworkSettings,
          isValid: isReworkStateSelected || (isOnlyEmptyAndDoneState && !onlyIncludeReworkMetrics),
        },
      ];
      const activeNextButtonValidityOptions = nextButtonValidityOptions.filter(({ isShow }) => isShow);
      activeNextButtonValidityOptions.every(({ isValid }) => isValid)
        ? setIsDisableNextButton(false)
        : setIsDisableNextButton(true);
    }
  }, [
    activeStep,
    isShowBoard,
    isShowSourceControl,
    isShowPipeline,
    metrics,
    projectName,
    dateRange,
    metricsConfig,
    isCrewsSettingValid,
    isShowRealDone,
    isRealDoneValid,
    isShowDeploymentFrequency,
    isDeploymentFrequencyValid,
    isShowCycleTimeSettings,
    isCycleTimeSettingsVerified,
    isShowClassificationSetting,
    isClassificationSettingVerified,
    isReworkStateSelected,
    isShowReworkSettings,
    isOnlyEmptyAndDoneState,
    onlyIncludeReworkMetrics,
    isShowSourceControlConfiguration,
    isSourceControlConfigurationValid,
  ]);

  const isNextDisabledTempForFormRefactor =
    activeStep === METRICS_STEPS.CONFIG ? !(isBasicInfoValid && shownFormsVerified) : isDisableNextButton;

  const filterMetricsConfig = (metricsConfig: ISavedMetricsSettingState) => {
    return Object.fromEntries(
      Object.entries(metricsConfig).filter(([, value]) => {
        /* istanbul ignore next */
        if (Array.isArray(value)) {
          return (
            !value.every((item) => item.organization === '') &&
            !value.every((item) => item.flag === false) &&
            value.length > 0
          );
        } else {
          return true;
        }
      }),
    );
  };

  /* istanbul ignore next */
  const handleSave = () => {
    const { projectName, dateRange, calendarType, metrics, sortType } = config.basic;
    const pipelineConfig = config.pipelineTool.config;
    const savedPipelineConfig = { ...pipelineConfig };
    if (savedPipelineConfig.type === PIPELINE_TOOL_OTHER_OPTION) {
      savedPipelineConfig.token = '';
    }
    const configData = {
      projectName,
      dateRange,
      calendarType,
      metrics,
      sortType,

      board: isShowBoard ? omit(config.board.config, ['projectKey']) : undefined,
      /* istanbul ignore next */
      pipelineTool: isShowPipeline ? savedPipelineConfig : undefined,
      /* istanbul ignore next */
      sourceControl: isShowSourceControl ? config.sourceControl.config : undefined,
    };

    const {
      leadTimeForChanges,
      deploymentFrequencySettings,
      users,
      pipelineCrews,
      doneColumn,
      targetFields,
      classificationCharts,
      cycleTimeSettings,
      cycleTimeSettingsType,
      treatFlagCardAsBlock,
      assigneeFilter,
      importedData,
      sourceControlConfigurationSettings,
      sourceControlCrews,
    } = filterMetricsConfig(metricsConfig);

    const metricsData = {
      crews: users,
      assigneeFilter: assigneeFilter,
      pipelineCrews,
      sourceControlCrews,
      cycleTime: cycleTimeSettings
        ? {
            type: cycleTimeSettingsType,
            jiraColumns: convertCycleTimeSettings(cycleTimeSettingsType, cycleTimeSettings),
            treatFlagCardAsBlock,
          }
        : undefined,
      doneStatus: doneColumn,
      classification: targetFields
        ?.filter((item: { name: string; key: string; flag: boolean }) => item.flag)
        ?.map((item: { name: string; key: string; flag: boolean }) => item.key),
      classificationCharts: classificationCharts?.map(({ key }: { key: string }) => key),
      advancedSettings: importedData.importedAdvancedSettings,
      deployment: deploymentFrequencySettings,
      sourceControlConfigurationSettings,
      leadTime: leadTimeForChanges,
      reworkTimesSettings: importedData.reworkTimesSettings,
    };
    const jsonData = activeStep === METRICS_STEPS.CONFIG ? configData : { ...configData, ...metricsData };
    exportToJsonFile('config', jsonData);
  };

  const handleNext = () => {
    if (activeStep === METRICS_STEPS.METRICS) {
      dispatch(updateTimeStamp(new Date().getTime()));
    }
    dispatch(nextStep());
  };

  const handleBack = () => {
    setIsDialogShowing(!activeStep);
    dispatch(backStep());
  };

  const backToHomePage = () => {
    navigate(Route.BasePage);
    setIsDialogShowing(false);
    window.location.reload();
  };

  const CancelDialog = () => {
    setIsDialogShowing(false);
  };

  return (
    <>
      <StyledStepper activeStep={activeStep}>
        {STEPS.map((label: string) => (
          <StyledStep key={label}>
            <StyledStepLabel>{label}</StyledStepLabel>
          </StyledStep>
        ))}
      </StyledStepper>
      <PageContentWrapper>
        <Suspense>
          {activeStep === METRICS_STEPS.CONFIG && (
            <ConfigStep
              basicInfoMethods={basicInfoMethods}
              boardConfigMethods={boardConfigMethods}
              pipelineToolMethods={pipelineToolMethods}
              sourceControlMethods={sourceControlMethods}
            />
          )}
          {activeStep === METRICS_STEPS.METRICS && <MetricsStep />}
          {activeStep === METRICS_STEPS.REPORT && <ReportStep handleSave={handleSave} />}
        </Suspense>
      </PageContentWrapper>
      <ButtonContainer>
        {activeStep !== METRICS_STEPS.REPORT && (
          <>
            <Tooltip title={TIPS.SAVE_CONFIG} placement={'right'}>
              <SaveButton variant='text' onClick={handleSave} startIcon={<SaveAltIcon />}>
                {COMMON_BUTTONS.SAVE}
              </SaveButton>
            </Tooltip>
            <div>
              <BackButton variant='outlined' onClick={handleBack}>
                {COMMON_BUTTONS.BACK}
              </BackButton>
              <NextButton onClick={handleNext} disabled={isNextDisabledTempForFormRefactor}>
                {COMMON_BUTTONS.NEXT}
              </NextButton>
            </div>
          </>
        )}
      </ButtonContainer>
      {isDialogShowing && (
        <ConfirmDialog isDialogShowing={isDialogShowing} onConfirm={backToHomePage} onClose={CancelDialog} />
      )}
    </>
  );
};

export default MetricsStepper;
