import {
  selectConfig,
  updateBoard,
  updateBoardVerifyState,
  updatePipelineTool,
  updatePipelineToolVerifyState,
  updateSourceControl,
  updateSourceControlVerifyState,
} from '@src/context/config/configSlice';
import {
  BOARD_TYPES,
  CYCLE_TIME_SETTINGS_TYPES,
  METRICS_CONSTANTS,
  PIPELINE_TOOL_TYPES,
  SOURCE_CONTROL_TYPES,
  TIPS,
} from '@src/constants/resources';
import {
  BackButton,
  ButtonContainer,
  MetricsStepperContent,
  NextButton,
  SaveButton,
  StyledStep,
  StyledStepLabel,
  StyledStepper,
} from './style';
import { ICycleTimeSetting, savedMetricsSettingState, selectMetricsContent } from '@src/context/Metrics/metricsSlice';
import { backStep, nextStep, selectStepNumber, updateTimeStamp } from '@src/context/stepper/StepperSlice';
import { COMMON_BUTTONS, METRICS_STEPS, STEPS } from '@src/constants/commons';
import { ConfirmDialog } from '@src/containers/MetricsStepper/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '@src/hooks/useAppDispatch';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { exportToJsonFile } from '@src/utils/util';
import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE } from '@src/constants/router';
import { Tooltip } from '@mui/material';
import omit from 'lodash/omit';

const ConfigStep = lazy(() => import('@src/containers/ConfigStep'));
const MetricsStep = lazy(() => import('@src/containers/MetricsStep'));
const ReportStep = lazy(() => import('@src/containers/ReportStep'));

/* istanbul ignore next */
const MetricsStepper = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeStep = useAppSelector(selectStepNumber);
  const [isDialogShowing, setIsDialogShowing] = useState(false);
  const config = useAppSelector(selectConfig);
  const metricsConfig = useAppSelector(selectMetricsContent);

  const { isShow: isShowBoard, isVerified: isBoardVerified } = config.board;
  const { isShow: isShowPipeline, isVerified: isPipelineToolVerified } = config.pipelineTool;
  const { isShow: isShowSourceControl, isVerified: isSourceControlVerified } = config.sourceControl;

  const filterMetricsConfig = (metricsConfig: savedMetricsSettingState) => {
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
    const { projectName, dateRange, calendarType, metrics } = config.basic;
    const configData = {
      projectName,
      dateRange,
      calendarType,
      metrics,

      board: isShowBoard ? omit(config.board.config, ['projectKey']) : undefined,
      /* istanbul ignore next */
      pipelineTool: isShowPipeline ? config.pipelineTool.config : undefined,
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
      cycleTimeSettings,
      cycleTimeSettingsType,
      treatFlagCardAsBlock,
      assigneeFilter,
      importedData,
    } = filterMetricsConfig(metricsConfig);

    const metricsData = {
      crews: users,
      assigneeFilter: assigneeFilter,
      pipelineCrews,
      cycleTime: cycleTimeSettings
        ? {
            type: cycleTimeSettingsType,
            jiraColumns:
              cycleTimeSettingsType === CYCLE_TIME_SETTINGS_TYPES.BY_COLUMN
                ? ([...new Set(cycleTimeSettings.map(({ column }: ICycleTimeSetting) => column))] as string[]).map(
                    (uniqueColumn) => ({
                      [uniqueColumn]:
                        cycleTimeSettings.find(({ column }: ICycleTimeSetting) => column === uniqueColumn)?.value ||
                        METRICS_CONSTANTS.cycleTimeEmptyStr,
                    }),
                  )
                : cycleTimeSettings?.map(({ status, value }: ICycleTimeSetting) => ({ [status]: value })),
            treatFlagCardAsBlock,
          }
        : undefined,
      doneStatus: doneColumn,
      classification: targetFields
        ?.filter((item: { name: string; key: string; flag: boolean }) => item.flag)
        ?.map((item: { name: string; key: string; flag: boolean }) => item.key),
      advancedSettings: importedData.importedAdvancedSettings,
      deployment: deploymentFrequencySettings,
      leadTime: leadTimeForChanges,
    };
    const jsonData = activeStep === METRICS_STEPS.CONFIG ? configData : { ...configData, ...metricsData };
    exportToJsonFile('config', jsonData);
  };

  const handleNext = () => {
    if (activeStep === METRICS_STEPS.METRICS) {
      dispatch(updateTimeStamp(new Date().getTime()));
    }
    if (activeStep === METRICS_STEPS.CONFIG) {
      cleanBoardState();
      cleanPipelineToolConfiguration();
      cleanSourceControlState();
    }
    dispatch(nextStep());
  };

  const handleBack = () => {
    setIsDialogShowing(!activeStep);
    dispatch(backStep());
  };

  const backToHomePage = () => {
    navigate(ROUTE.BASE_PAGE);
    setIsDialogShowing(false);
    window.location.reload();
  };

  const CancelDialog = () => {
    setIsDialogShowing(false);
  };

  const cleanPipelineToolConfiguration = () => {
    !isShowPipeline && dispatch(updatePipelineTool({ type: PIPELINE_TOOL_TYPES.BUILD_KITE, token: '' }));
    isShowPipeline
      ? dispatch(updatePipelineToolVerifyState(isPipelineToolVerified))
      : dispatch(updatePipelineToolVerifyState(false));
  };

  const cleanSourceControlState = () => {
    !isShowSourceControl && dispatch(updateSourceControl({ type: SOURCE_CONTROL_TYPES.GITHUB, token: '' }));
    isShowSourceControl
      ? dispatch(updateSourceControlVerifyState(isSourceControlVerified))
      : dispatch(updateSourceControlVerifyState(false));
  };

  const cleanBoardState = () => {
    !isShowBoard &&
      dispatch(
        updateBoard({
          type: BOARD_TYPES.JIRA,
          boardId: '',
          email: '',
          projectKey: '',
          site: '',
          token: '',
        }),
      );
    isShowBoard ? dispatch(updateBoardVerifyState(isBoardVerified)) : dispatch(updateBoardVerifyState(false));
  };

  const [nextDisabled, setNextDisabled] = useState(false);

  return (
    <>
      <StyledStepper activeStep={activeStep}>
        {STEPS.map((label) => (
          <StyledStep key={label}>
            <StyledStepLabel>{label}</StyledStepLabel>
          </StyledStep>
        ))}
      </StyledStepper>
      <MetricsStepperContent>
        <Suspense>
          {activeStep === METRICS_STEPS.CONFIG && <ConfigStep />}
          {activeStep === METRICS_STEPS.METRICS && <MetricsStep setNextDisabled={setNextDisabled} />}
          {activeStep === METRICS_STEPS.REPORT && <ReportStep handleSave={handleSave} />}
        </Suspense>
      </MetricsStepperContent>
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
              <NextButton onClick={handleNext} disabled={nextDisabled}>
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
