import {
  ASSIGNEE_FILTER_TYPES,
  CYCLE_TIME_LIST,
  CycleTimeSettingsTypes,
  MESSAGE,
  METRICS_CONSTANTS,
} from '@src/constants/resources';
import { convertCycleTimeSettings, getSortedAndDeduplicationBoardingMapping } from '@src/utils/util';
import { ITargetFieldType } from '@src/components/Common/MultiAutoComplete/styles';
import { IPipeline } from '@src/context/config/pipelineTool/verifyResponseSlice';
import _, { concat, intersection, isEqual, omit, uniqWith } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import camelCase from 'lodash.camelcase';
import { RootState } from '@src/store';

export interface IPipelineConfig {
  id: number;
  organization: string;
  pipelineName: string;
  step: string;
  branches: string[];
  isStepEmptyString?: boolean;
}

export interface ISourceControlConfig {
  id: number;
  organization: string;
  repo: string;
  branches: string[];
}

export interface IReworkConfig {
  reworkState: string | null;
  excludeStates: string[];
}

export interface IPipelineWarningMessageConfig {
  id: number | null;
  organization: string | null;
  pipelineName: string | null;
  step: string | null;
}

export interface ICycleTimeSetting {
  column: string;
  status: string;
  value: string;
}

export interface ISavedMetricsSettingState {
  shouldGetBoardConfig: boolean;
  shouldGetPipeLineConfig: boolean;
  shouldGetSourceControlConfig: boolean;
  shouldRetryPipelineConfig: boolean;
  jiraColumns: { key: string; value: { name: string; statuses: string[] } }[];
  targetFields: { name: string; key: string; flag: boolean }[];
  classificationCharts: { name: string; key: string; flag: boolean }[];
  users: string[];
  pipelineCrews: string[];
  sourceControlCrews: string[];
  doneColumn: string[];
  cycleTimeSettingsType: CycleTimeSettingsTypes;
  cycleTimeSettings: ICycleTimeSetting[];
  deploymentFrequencySettings: IPipelineConfig[];
  sourceControlConfigurationSettings: ISourceControlConfig[];
  leadTimeForChanges: IPipelineConfig[];
  treatFlagCardAsBlock: boolean;
  displayFlagCardDropWarning: boolean;
  assigneeFilter: string;
  firstTimeRoadMetricData: boolean;
  importedData: {
    importedCrews: string[];
    importedAssigneeFilter: string;
    importedPipelineCrews: string[];
    importedSourceControlCrews: string[];
    importedCycleTime: {
      importedCycleTimeSettings: { [key: string]: string }[];
      importedTreatFlagCardAsBlock: boolean;
    };
    importedDoneStatus: string[];
    importedClassification: string[];
    importedClassificationCharts: string[];
    importedDeployment: IPipelineConfig[];
    importedSourceControlSettings: ISourceControlConfig[];
    importedAdvancedSettings: { storyPoint: string; flag: string } | null;
    reworkTimesSettings: IReworkConfig;
  };
  cycleTimeWarningMessage: string | null;
  classificationWarningMessage: string | null;
  realDoneWarningMessage: string | null;
  deploymentWarningMessage: IPipelineWarningMessageConfig[];
}

const initialState: ISavedMetricsSettingState = {
  shouldGetBoardConfig: false,
  shouldGetPipeLineConfig: false,
  shouldGetSourceControlConfig: false,
  shouldRetryPipelineConfig: false,
  jiraColumns: [],
  targetFields: [],
  classificationCharts: [],
  users: [],
  pipelineCrews: [],
  sourceControlCrews: [],
  doneColumn: [],
  cycleTimeSettingsType: CycleTimeSettingsTypes.BY_COLUMN,
  cycleTimeSettings: [],
  deploymentFrequencySettings: [],
  sourceControlConfigurationSettings: [],
  leadTimeForChanges: [{ id: 0, organization: '', pipelineName: '', step: '', branches: [] }],
  treatFlagCardAsBlock: true,
  displayFlagCardDropWarning: true,
  assigneeFilter: ASSIGNEE_FILTER_TYPES.LAST_ASSIGNEE,
  firstTimeRoadMetricData: true,
  importedData: {
    importedCrews: [],
    importedAssigneeFilter: ASSIGNEE_FILTER_TYPES.LAST_ASSIGNEE,
    importedPipelineCrews: [],
    importedSourceControlCrews: [],
    importedCycleTime: {
      importedCycleTimeSettings: [],
      importedTreatFlagCardAsBlock: true,
    },
    importedDoneStatus: [],
    importedClassification: [],
    importedClassificationCharts: [],
    importedDeployment: [],
    importedSourceControlSettings: [],
    importedAdvancedSettings: null,
    reworkTimesSettings: {
      reworkState: null,
      excludeStates: [],
    },
  },
  cycleTimeWarningMessage: null,
  classificationWarningMessage: null,
  realDoneWarningMessage: null,
  deploymentWarningMessage: [],
};

const compareArrays = (arrayA: string[], arrayB: string[], key: string): string | null => {
  if (arrayA?.length > arrayB?.length) {
    const differentValues = arrayA?.filter((value) => !arrayB.includes(value));
    return `The ${key} of ${differentValues} is a deleted ${key}, which means this ${key} existed the time you saved config, but was deleted. Please confirm!`;
  } else {
    const differentValues = arrayB?.filter((value) => !arrayA.includes(value));
    return differentValues?.length > 0
      ? `The ${key} of ${differentValues} is a new ${key}. Please select a value for it!`
      : null;
  }
};
const findDifferentValues = (arrayA: string[], arrayB: string[]): string[] | null => {
  const diffInArrayA = arrayA?.filter((value) => !arrayB.includes(value));
  if (diffInArrayA?.length === 0) {
    return null;
  } else {
    return diffInArrayA;
  }
};
const findKeyByValues = (arrayA: { [key: string]: string }[], arrayB: string[]): string | null => {
  const matchingKeys: string[] = [];

  for (const setting of arrayA) {
    const key = Object.keys(setting)[0];
    const value = setting[key];
    if (arrayB.includes(value)) {
      matchingKeys.push(key);
    }
  }
  return `The value of ${matchingKeys} in imported json is not in dropdown list now. Please select a value for it!`;
};

const setImportSelectUsers = (metricsState: ISavedMetricsSettingState, users: string[], importedCrews: string[]) => {
  if (metricsState.firstTimeRoadMetricData) {
    return users.filter((item: string) => importedCrews?.includes(item));
  } else {
    return users.filter((item: string) => metricsState.users?.includes(item));
  }
};

const setCreateSelectUsers = (metricsState: ISavedMetricsSettingState, users: string[]) => {
  if (metricsState.firstTimeRoadMetricData) {
    return users;
  } else {
    return users.filter((item: string) => metricsState.users?.includes(item));
  }
};

const setPipelineCrews = (isProjectCreated: boolean, pipelineCrews: string[], currentCrews: string[]) => {
  if (_.isEmpty(pipelineCrews)) {
    return [];
  }
  if (isProjectCreated) {
    return pipelineCrews;
  }
  return intersection(pipelineCrews, currentCrews);
};

const getClassifications = (
  state: ISavedMetricsSettingState,
  targetFields: { name: string; key: string; flag: boolean }[],
  isProjectCreated: boolean,
) => {
  if (isProjectCreated) {
    return getCreateSelectClassifications(state, targetFields);
  } else {
    return getImportSelectClassifications(state, targetFields);
  }
};

const getImportSelectClassifications = (
  state: ISavedMetricsSettingState,
  targetFields: { name: string; key: string; flag: boolean }[],
) => {
  if (state.firstTimeRoadMetricData) {
    const newTargetFields = targetFields.map((item: { name: string; key: string; flag: boolean }) => ({
      ...item,
      flag: state.importedData.importedClassification.includes(item.key),
    }));
    const newClassificationCharts = state.importedData.importedClassificationCharts
      .map((key) => newTargetFields.find(({ key: targetKey, flag }) => key === targetKey && flag))
      .filter((item) => !!item) as ITargetFieldType[];
    return {
      targetFields: newTargetFields,
      classificationCharts: newClassificationCharts,
    };
  } else {
    return getTargetFieldsIntersection(state, targetFields);
  }
};

const getCreateSelectClassifications = (
  state: ISavedMetricsSettingState,
  targetFields: {
    name: string;
    key: string;
    flag: boolean;
  }[],
) => {
  if (state.firstTimeRoadMetricData) {
    return {
      targetFields,
      classificationCharts: [],
    };
  } else {
    return getTargetFieldsIntersection(state, targetFields);
  }
};

const getTargetFieldsIntersection = (
  state: ISavedMetricsSettingState,
  targetFields: {
    name: string;
    key: string;
    flag: boolean;
  }[],
) => {
  const selectedFields = state.targetFields.filter((value) => value.flag).map((value) => value.key);
  const newTargetFields = targetFields.map((item: { name: string; key: string; flag: boolean }) => ({
    ...item,
    flag: selectedFields.includes(item.key),
  }));
  const newClassificationCharts = state.classificationCharts.filter(({ key }) =>
    newTargetFields.find(({ key: targetKey, flag }) => key === targetKey && flag),
  );
  return {
    targetFields: newTargetFields,
    classificationCharts: newClassificationCharts,
  };
};

const getCycleTimeSettingsByColumn = (
  state: ISavedMetricsSettingState,
  jiraColumns: { key: string; value: { name: string; statuses: string[] } }[],
) => {
  const preCycleTimeSettings = state.firstTimeRoadMetricData
    ? state.importedData.importedCycleTime.importedCycleTimeSettings
    : convertCycleTimeSettings(state.cycleTimeSettingsType, state.cycleTimeSettings);
  return jiraColumns.flatMap(({ value: { name, statuses } }) => {
    const importItem = preCycleTimeSettings.find((i) => Object.keys(i).includes(name));
    const isValidValue = importItem && CYCLE_TIME_LIST.includes(Object.values(importItem)[0]);
    return statuses.map((status) => ({
      column: name,
      status,
      value: isValidValue ? (Object.values(importItem)[0] as string) : METRICS_CONSTANTS.cycleTimeEmptyStr,
    }));
  });
};

const getCycleTimeSettingsByStatus = (
  state: ISavedMetricsSettingState,
  jiraColumns: { key: string; value: { name: string; statuses: string[] } }[],
) => {
  const preCycleTimeSettings = state.firstTimeRoadMetricData
    ? state.importedData.importedCycleTime.importedCycleTimeSettings
    : convertCycleTimeSettings(state.cycleTimeSettingsType, state.cycleTimeSettings);
  return jiraColumns.flatMap(({ value: { name, statuses } }) =>
    statuses.map((status) => {
      const importItem = preCycleTimeSettings.find((i) => Object.keys(i).includes(status));
      const isValidValue = importItem && CYCLE_TIME_LIST.includes(Object.values(importItem)[0]);
      return {
        column: name,
        status,
        value: isValidValue ? (Object.values(importItem)[0] as string) : METRICS_CONSTANTS.cycleTimeEmptyStr,
      };
    }),
  );
};

const getSelectedDoneStatus = (
  jiraColumns: { key: string; value: { name: string; statuses: string[] } }[],
  cycleTimeSettings: ICycleTimeSetting[],
  importedDoneStatus: string[],
) => {
  const doneStatus =
    jiraColumns?.find((item) => item.key === METRICS_CONSTANTS.doneKeyFromBackend)?.value.statuses ?? [];
  const selectedDoneStatus = cycleTimeSettings
    ?.filter(({ value }) => value === METRICS_CONSTANTS.doneValue)
    .map(({ status }) => status);
  const status = selectedDoneStatus?.length < 1 ? doneStatus : selectedDoneStatus;
  return status.filter((item: string) => importedDoneStatus.includes(item));
};

function resetReworkTimeSettingWhenMappingModified(preJiraColumnsValue: string[], state: ISavedMetricsSettingState) {
  const boardingMapping = getSortedAndDeduplicationBoardingMapping(state.cycleTimeSettings).filter(
    (item) => item !== METRICS_CONSTANTS.cycleTimeEmptyStr,
  );
  if (state.firstTimeRoadMetricData || _.isEqual(preJiraColumnsValue, boardingMapping)) {
    return;
  }
  state.importedData.reworkTimesSettings = {
    reworkState: null,
    excludeStates: [],
  };
}

export const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    saveTargetFields: (state, action) => {
      state.targetFields = action.payload;
    },
    saveClassificationCharts: (state, action) => {
      state.classificationCharts = action.payload;
    },
    saveDoneColumn: (state, action) => {
      state.doneColumn = action.payload;
    },
    saveUsers: (state, action) => {
      state.users = action.payload;
    },
    savePipelineCrews: (state, action) => {
      state.pipelineCrews = action.payload || [];
    },
    saveSourceControlCrews: (state, action) => {
      state.sourceControlCrews = action.payload || [];
    },
    updateCycleTimeSettings: (state, action) => {
      state.cycleTimeSettings = action.payload;
    },
    setCycleTimeSettingsType: (state, action) => {
      state.cycleTimeSettingsType = action.payload;
    },
    addADeploymentFrequencySetting: (state) => {
      const { deploymentFrequencySettings, importedData } = state;
      const maxId = Math.max(
        deploymentFrequencySettings[deploymentFrequencySettings.length - 1]?.id ?? 0,
        importedData.importedDeployment[importedData.importedDeployment.length - 1]?.id ?? 0,
      );
      const newId = maxId + 1;
      state.deploymentFrequencySettings = [
        ...deploymentFrequencySettings,
        { id: newId, organization: '', pipelineName: '', step: '', branches: [] },
      ];
    },
    addOneSourceControlSetting: (state) => {
      const { sourceControlConfigurationSettings } = state;
      const maxId = sourceControlConfigurationSettings[sourceControlConfigurationSettings.length - 1]?.id ?? 0;
      const newId = maxId + 1;
      state.sourceControlConfigurationSettings = [
        ...sourceControlConfigurationSettings,
        { id: newId, organization: '', repo: '', branches: [] },
      ];
    },

    updateDeploymentFrequencySettings: (state, action) => {
      const { updateId, label, value } = action.payload;

      state.deploymentFrequencySettings = state.deploymentFrequencySettings.map((deploymentFrequencySetting) => {
        return deploymentFrequencySetting.id === updateId
          ? {
              ...deploymentFrequencySetting,
              [label === 'Step' ? 'step' : camelCase(label)]: value,
            }
          : deploymentFrequencySetting;
      });
    },

    updateSourceControlConfigurationSettings: (state, action) => {
      const { updateId, label, value } = action.payload;
      const sourceControlConfigurationSettings = state.sourceControlConfigurationSettings;
      state.sourceControlConfigurationSettings = sourceControlConfigurationSettings.map((it) => {
        return it.id !== updateId
          ? it
          : {
              ...it,
              [label]: value,
            };
      });
    },

    updateSourceControlConfigurationSettingsFirstInto: (state, action) => {
      const { name, isProjectCreated, type } = action.payload;

      const sourceControlConfigurationSettings = state.sourceControlConfigurationSettings;
      if (isProjectCreated) {
        state.sourceControlConfigurationSettings =
          sourceControlConfigurationSettings.length > 0
            ? sourceControlConfigurationSettings
            : name.map((it: string, index: number) => ({
                id: index,
                organization: '',
                repo: '',
                branches: [],
              }));
      } else {
        let validSourceControlConfigurationSettings =
          sourceControlConfigurationSettings.length > 0
            ? sourceControlConfigurationSettings
            : state.importedData.importedSourceControlSettings
                .filter((it) => it.id !== undefined)
                .map((it) => ({
                  id: it.id,
                  organization: it.organization,
                  repo: it.repo,
                  branches: it.branches,
                }));

        if (type === 'organization') {
          validSourceControlConfigurationSettings = validSourceControlConfigurationSettings.filter(
            (it) => it['organization'] === '' || name.includes(it['organization']),
          );
        } else if (type === 'repo') {
          validSourceControlConfigurationSettings = validSourceControlConfigurationSettings.filter(
            (it) => it['repo'] === '' || name.includes(it['repo']),
          );
        } else {
          validSourceControlConfigurationSettings = validSourceControlConfigurationSettings.filter(
            (it) => it['branches'].length === 0 || it['branches'].filter((branch) => name.includes(branch)),
          );
        }

        state.sourceControlConfigurationSettings = validSourceControlConfigurationSettings;
      }
    },

    updateShouldGetBoardConfig: (state, action) => {
      state.shouldGetBoardConfig = action.payload;
    },

    updateShouldGetPipelineConfig: (state, action) => {
      state.shouldGetPipeLineConfig = action.payload;
    },

    updateMetricsImportedData: (state, action) => {
      const {
        crews,
        cycleTime,
        doneStatus,
        classification,
        classificationCharts,
        deployment,
        advancedSettings,
        leadTime,
        assigneeFilter,
        pipelineCrews,
        reworkTimesSettings,
        sourceControlConfigurationSettings,
        sourceControlCrews,
      } = action.payload;
      state.importedData.importedCrews = crews || state.importedData.importedCrews;
      state.importedData.importedPipelineCrews = pipelineCrews || state.importedData.importedPipelineCrews;
      state.importedData.importedSourceControlCrews =
        sourceControlCrews || state.importedData.importedSourceControlCrews;
      state.importedData.importedCycleTime.importedCycleTimeSettings =
        cycleTime?.jiraColumns || state.importedData.importedCycleTime.importedCycleTimeSettings;
      state.importedData.importedCycleTime.importedTreatFlagCardAsBlock =
        cycleTime?.treatFlagCardAsBlock && state.importedData.importedCycleTime.importedTreatFlagCardAsBlock;
      state.importedData.importedAssigneeFilter = assigneeFilter || state.importedData.importedAssigneeFilter;
      state.importedData.importedDoneStatus = doneStatus || state.importedData.importedDoneStatus;
      state.importedData.importedClassification = classification || state.importedData.importedClassification;
      state.importedData.importedClassificationCharts =
        classificationCharts || state.importedData.importedClassificationCharts;
      state.importedData.importedDeployment = deployment || leadTime || state.importedData.importedDeployment;
      state.importedData.importedSourceControlSettings =
        sourceControlConfigurationSettings || state.importedData.importedSourceControlSettings;
      state.importedData.importedAdvancedSettings = advancedSettings || state.importedData.importedAdvancedSettings;
      state.importedData.reworkTimesSettings = reworkTimesSettings || state.importedData.reworkTimesSettings;
    },

    updateMetricsState: (state, action) => {
      const { targetFields, users, jiraColumns, isProjectCreated, ignoredTargetFields } = action.payload;
      const { importedCrews, importedClassification, importedCycleTime, importedDoneStatus, importedAssigneeFilter } =
        state.importedData;
      const preJiraColumnsValue = getSortedAndDeduplicationBoardingMapping(state.cycleTimeSettings).filter(
        (item) => item !== METRICS_CONSTANTS.cycleTimeEmptyStr,
      );

      state.displayFlagCardDropWarning =
        state.displayFlagCardDropWarning && !isProjectCreated && importedCycleTime.importedTreatFlagCardAsBlock;
      state.users = isProjectCreated
        ? setCreateSelectUsers(state, users)
        : setImportSelectUsers(state, users, importedCrews);
      const classification = getClassifications(state, targetFields, isProjectCreated);
      state.targetFields = classification.targetFields;
      state.classificationCharts = classification.classificationCharts;

      if (!isProjectCreated && importedCycleTime?.importedCycleTimeSettings?.length > 0) {
        const importedCycleTimeSettingsKeys = importedCycleTime.importedCycleTimeSettings.flatMap((obj) =>
          Object.keys(obj),
        );
        const importedCycleTimeSettingsValues = importedCycleTime.importedCycleTimeSettings.flatMap((obj) =>
          Object.values(obj),
        );
        const jiraColumnsNames = jiraColumns?.map(
          (obj: { key: string; value: { name: string; statuses: string[] } }) => obj.value.name,
        );
        const jiraStatuses = jiraColumns?.flatMap(
          (obj: { key: string; value: { name: string; statuses: string[] } }) => obj.value.statuses,
        );
        const metricsContainsValues = Object.values(METRICS_CONSTANTS);
        const importedKeyMismatchWarning =
          state.cycleTimeSettingsType === CycleTimeSettingsTypes.BY_COLUMN
            ? compareArrays(importedCycleTimeSettingsKeys, jiraColumnsNames, 'column')
            : compareArrays(importedCycleTimeSettingsKeys, jiraStatuses, 'status');
        const importedValueMismatchWarning = findDifferentValues(
          importedCycleTimeSettingsValues,
          metricsContainsValues,
        );

        const getWarningMessage = (): string | null => {
          if (importedKeyMismatchWarning?.length) {
            return importedKeyMismatchWarning;
          }
          if (importedValueMismatchWarning?.length) {
            return findKeyByValues(importedCycleTime.importedCycleTimeSettings, importedValueMismatchWarning);
          }
          return null;
        };
        state.cycleTimeWarningMessage = getWarningMessage();
      } else {
        state.cycleTimeWarningMessage = null;
      }

      if (!isProjectCreated && importedClassification?.length > 0) {
        const keyArray = targetFields?.map((field: { key: string; name: string; flag: boolean }) => field.key);
        const ignoredKeyArray = ignoredTargetFields?.map(
          (field: { key: string; name: string; flag: boolean }) => field.key,
        );
        const filteredImportedClassification = importedClassification.filter((item) => !ignoredKeyArray.includes(item));
        if (filteredImportedClassification.every((item) => keyArray.includes(item))) {
          state.classificationWarningMessage = null;
        } else {
          state.classificationWarningMessage = MESSAGE.CLASSIFICATION_WARNING;
        }
      } else {
        state.classificationWarningMessage = null;
      }
      if (jiraColumns) {
        state.cycleTimeSettings =
          state.cycleTimeSettingsType === CycleTimeSettingsTypes.BY_COLUMN
            ? getCycleTimeSettingsByColumn(state, jiraColumns)
            : getCycleTimeSettingsByStatus(state, jiraColumns);
      }
      resetReworkTimeSettingWhenMappingModified(preJiraColumnsValue, state);

      if (!isProjectCreated && importedDoneStatus.length > 0) {
        const selectedDoneStatus = getSelectedDoneStatus(jiraColumns, state.cycleTimeSettings, importedDoneStatus);
        selectedDoneStatus.length < importedDoneStatus.length
          ? (state.realDoneWarningMessage = MESSAGE.REAL_DONE_WARNING)
          : (state.realDoneWarningMessage = null);
        state.doneColumn = selectedDoneStatus;
      }

      state.assigneeFilter =
        importedAssigneeFilter === ASSIGNEE_FILTER_TYPES.LAST_ASSIGNEE ||
        importedAssigneeFilter === ASSIGNEE_FILTER_TYPES.HISTORICAL_ASSIGNEE
          ? importedAssigneeFilter
          : ASSIGNEE_FILTER_TYPES.LAST_ASSIGNEE;
    },

    updatePiplineCrews: (state, action) => {
      state.pipelineCrews = intersection(state.pipelineCrews, action.payload);
    },

    updatePipelineSettings: (state, action) => {
      const { pipelineList, isProjectCreated, pipelineCrews } = action.payload;
      const { importedDeployment } = state.importedData;
      if (pipelineCrews) {
        state.pipelineCrews = setPipelineCrews(isProjectCreated, pipelineCrews, state.pipelineCrews);
      }
      const orgNames: Array<string> = _.uniq(pipelineList.map((item: IPipeline) => item.orgName));
      const filteredPipelineNames = (organization: string) =>
        pipelineList
          .filter((pipeline: IPipeline) => pipeline.orgName.toLowerCase() === organization.toLowerCase())
          .map((item: IPipeline) => item.name);

      const uniqueResponse = (res: IPipelineConfig[]) => {
        let itemsOmitId = uniqWith(
          res.map((value) => omit(value, ['id', 'isStepEmptyString'])),
          isEqual,
        );
        if (itemsOmitId.length > 1) {
          itemsOmitId = itemsOmitId.filter(
            (item) => !Object.values(item).every((value) => value === '' || !value?.length),
          );
        }
        return itemsOmitId.length < res.length
          ? itemsOmitId.map((item, index) => {
              return {
                id: index,
                ...item,
              };
            })
          : res;
      };

      const getValidPipelines = (pipelines: IPipelineConfig[]) => {
        const hasPipeline = pipelines.filter(({ id }) => id !== undefined).length;
        const res =
          pipelines.length && hasPipeline
            ? pipelines.map(({ id, organization, pipelineName, step, branches, isStepEmptyString }) => {
                const matchedOrganization =
                  orgNames.find((i) => (i as string).toLowerCase() === organization.toLowerCase()) || '';
                const matchedPipelineName = filteredPipelineNames(organization).includes(pipelineName)
                  ? pipelineName
                  : '';
                return {
                  id,
                  isStepEmptyString: isStepEmptyString || false,
                  organization: matchedOrganization,
                  pipelineName: matchedPipelineName,
                  step: matchedPipelineName ? step : '',
                  branches: matchedPipelineName ? branches : [],
                };
              })
            : [{ id: 0, organization: '', pipelineName: '', step: '', branches: [], isStepEmptyString: false }];
        return uniqueResponse(res);
      };
      const createPipelineWarning = ({ id, organization, pipelineName }: IPipelineConfig) => {
        const orgWarning = orgNames.some((i) => (i as string).toLowerCase() === organization.toLowerCase())
          ? null
          : MESSAGE.ORGANIZATION_WARNING;
        const pipelineNameWarning =
          orgWarning || filteredPipelineNames(organization).includes(pipelineName)
            ? null
            : MESSAGE.PIPELINE_NAME_WARNING;

        return {
          id,
          organization: orgWarning,
          pipelineName: pipelineNameWarning,
          step: null,
        };
      };

      const getPipelinesWarningMessage = (pipelines: IPipelineConfig[]) => {
        const hasPipeline = pipelines.filter(({ id }) => id !== undefined).length;
        if (!pipelines.length || isProjectCreated || !hasPipeline) {
          return [];
        }
        return pipelines.map((pipeline) => createPipelineWarning(pipeline));
      };

      const deploymentSettings =
        state.deploymentFrequencySettings.length > 0 ? state.deploymentFrequencySettings : importedDeployment;

      state.deploymentFrequencySettings = getValidPipelines(deploymentSettings);
      state.deploymentWarningMessage = getPipelinesWarningMessage(deploymentSettings);
    },
    updatePipelineStep: (state, action) => {
      const { steps, id, branches, pipelineCrews } = action.payload;
      const selectedPipelineStep = state.deploymentFrequencySettings.find((pipeline) => pipeline.id === id)?.step ?? '';
      const currentCrews = concat(pipelineCrews, state.pipelineCrews);

      state.pipelineCrews = intersection(currentCrews, state.pipelineCrews);
      const stepWarningMessage = (selectedStep: string, isStepEmptyString: boolean) =>
        steps.includes(selectedStep) || isStepEmptyString ? null : MESSAGE.STEP_WARNING;

      const validStep = (pipeline: IPipelineConfig): string => {
        const selectedStep = pipeline.step;
        if (!selectedStep) {
          pipeline.isStepEmptyString = true;
        }
        return steps.includes(selectedStep) ? selectedStep : '';
      };

      const validBranches = (selectedBranches: string[]): string[] =>
        _.filter(branches, (branch) => selectedBranches.includes(branch));

      const getPipelineSettings = (pipelines: IPipelineConfig[]) => {
        return pipelines.map((pipeline) => {
          const filterValidStep = validStep(pipeline);
          return pipeline.id === id
            ? {
                ...pipeline,
                step: filterValidStep,
                branches: validBranches(pipeline.branches.length > 0 ? pipeline.branches : []),
              }
            : pipeline;
        });
      };

      const getStepWarningMessage = (
        pipelinesWarning: IPipelineWarningMessageConfig[],
        pipelinesValue: IPipelineConfig[],
      ) => {
        return pipelinesWarning.map((pipeline) => {
          const matchedPipeline = pipelinesValue.find((pipeline) => pipeline.id === id);
          return pipeline?.id === id
            ? {
                ...pipeline,
                step: stepWarningMessage(selectedPipelineStep, matchedPipeline?.isStepEmptyString || false),
              }
            : pipeline;
        });
      };

      state.deploymentWarningMessage = getStepWarningMessage(
        state.deploymentWarningMessage,
        state.deploymentFrequencySettings,
      );
      state.deploymentFrequencySettings = getPipelineSettings(state.deploymentFrequencySettings);
    },

    deleteADeploymentFrequencySetting: (state, action) => {
      const deleteId = action.payload;
      state.deploymentFrequencySettings = [...state.deploymentFrequencySettings.filter(({ id }) => id !== deleteId)];
    },

    deleteSourceControlConfigurationSettings: (state, action) => {
      const deleteId = action.payload;
      state.sourceControlConfigurationSettings = [
        ...state.sourceControlConfigurationSettings.filter(({ id }) => id !== deleteId),
      ];
    },

    initDeploymentFrequencySettings: (state) => {
      state.deploymentFrequencySettings = initialState.deploymentFrequencySettings;
    },

    updateTreatFlagCardAsBlock: (state, action) => {
      state.treatFlagCardAsBlock = action.payload;
    },

    updateDisplayFlagCardDropWarning: (state, action) => {
      state.displayFlagCardDropWarning = action.payload;
    },

    updateAssigneeFilter: (state, action) => {
      state.assigneeFilter = action.payload;
    },

    resetMetricData: () => initialState,

    updateAdvancedSettings: (state, action) => {
      state.importedData.importedAdvancedSettings = action.payload;
    },

    updateReworkTimesSettings: (state, action) => {
      state.importedData.reworkTimesSettings = action.payload;
    },

    updateFirstTimeRoadMetricsBoardData: (state, action) => {
      state.firstTimeRoadMetricData = action.payload;
    },

    updateShouldRetryPipelineConfig: (state, action) => {
      state.shouldRetryPipelineConfig = action.payload;
    },
  },
});

export const {
  saveTargetFields,
  saveClassificationCharts,
  saveDoneColumn,
  saveUsers,
  savePipelineCrews,
  saveSourceControlCrews,
  updateCycleTimeSettings,
  addADeploymentFrequencySetting,
  updateDeploymentFrequencySettings,
  deleteADeploymentFrequencySetting,
  updateMetricsImportedData,
  initDeploymentFrequencySettings,
  updateTreatFlagCardAsBlock,
  updateDisplayFlagCardDropWarning,
  updateAssigneeFilter,
  updateMetricsState,
  updatePipelineSettings,
  updatePiplineCrews,
  updatePipelineStep,
  setCycleTimeSettingsType,
  resetMetricData,
  updateAdvancedSettings,
  updateShouldGetBoardConfig,
  updateShouldGetPipelineConfig,
  updateReworkTimesSettings,
  updateFirstTimeRoadMetricsBoardData,
  updateShouldRetryPipelineConfig,
  updateSourceControlConfigurationSettings,
  deleteSourceControlConfigurationSettings,
  updateSourceControlConfigurationSettingsFirstInto,
  addOneSourceControlSetting,
} = metricsSlice.actions;

export const selectShouldGetBoardConfig = (state: RootState) => state.metrics.shouldGetBoardConfig;
export const selectShouldGetPipelineConfig = (state: RootState) => state.metrics.shouldGetPipeLineConfig;
export const selectShouldGetSourceControlConfig = (state: RootState) => state.metrics.shouldGetSourceControlConfig;

export const selectDeploymentFrequencySettings = (state: RootState) => state.metrics.deploymentFrequencySettings;
export const selectSourceControlConfigurationSettings = (state: RootState) =>
  state.metrics.sourceControlConfigurationSettings;
export const selectReworkTimesSettings = (state: RootState) => state.metrics.importedData.reworkTimesSettings;

export const selectClassificationCharts = (state: RootState) => state.metrics.classificationCharts;
export const selectCycleTimeSettings = (state: RootState) => state.metrics.cycleTimeSettings;
export const selectMetricsContent = (state: RootState) => state.metrics;
export const selectAdvancedSettings = (state: RootState) => state.metrics.importedData.importedAdvancedSettings;
export const selectTreatFlagCardAsBlock = (state: RootState) => state.metrics.treatFlagCardAsBlock;
export const selectDisplayFlagCardDropWarning = (state: RootState) => state.metrics.displayFlagCardDropWarning;
export const selectAssigneeFilter = (state: RootState) => state.metrics.assigneeFilter;
export const selectCycleTimeWarningMessage = (state: RootState) => state.metrics.cycleTimeWarningMessage;
export const selectClassificationWarningMessage = (state: RootState) => state.metrics.classificationWarningMessage;
export const selectRealDoneWarningMessage = (state: RootState) => state.metrics.realDoneWarningMessage;
export const selectShouldRetryPipelineConfig = (state: RootState) => state.metrics.shouldRetryPipelineConfig;

export const selectOrganizationWarningMessage = (state: RootState, id: number) => {
  const { deploymentWarningMessage } = state.metrics;
  return deploymentWarningMessage.find((item) => item.id === id)?.organization;
};

export const selectPipelineNameWarningMessage = (state: RootState, id: number) => {
  const { deploymentWarningMessage } = state.metrics;
  return deploymentWarningMessage.find((item) => item.id === id)?.pipelineName;
};

export const selectStepWarningMessage = (state: RootState, id: number) => {
  const { deploymentWarningMessage } = state.metrics;
  return deploymentWarningMessage.find((item) => item.id === id)?.step;
};

export default metricsSlice.reducer;
