import { createSlice } from '@reduxjs/toolkit'
import camelCase from 'lodash.camelcase'
import { RootState } from '@src/store'

export interface savedMetricsSettingState {
  jiraColumns: { key: string; value: { name: string; statuses: string[] } }[]
  targetFields: { name: string; key: string; flag: boolean }[]
  users: string[]
  doneColumn: string[]
  boardColumns: { name: string; value: string }[]
  deploymentFrequencySettings: { organization: string; pipelineName: string; steps: string }[]
}

const initialState: savedMetricsSettingState = {
  jiraColumns: [],
  targetFields: [],
  users: [],
  doneColumn: [],
  boardColumns: [],
  deploymentFrequencySettings: [{ organization: '', pipelineName: '', steps: '' }],
}

export const metricsSlice = createSlice({
  name: 'saveMetricsSetting',
  initialState: {
    ...initialState,
  },
  reducers: {
    saveTargetFields: (state, action) => {
      state.targetFields = action.payload
    },
    saveDoneColumn: (state, action) => {
      state.doneColumn = action.payload
    },
    saveUsers: (state, action) => {
      state.users = action.payload
    },
    saveBoardColumns: (state, action) => {
      state.boardColumns = action.payload
    },

    addADeploymentFrequencySetting: (state) => {
      state.deploymentFrequencySettings = [
        ...state.deploymentFrequencySettings,
        { organization: '', pipelineName: '', steps: '' },
      ]
    },

    updateDeploymentFrequencySettings: (state, action) => {
      const { updateIndex, label, value } = action.payload

      state.deploymentFrequencySettings = state.deploymentFrequencySettings.map((deploymentFrequencySetting, index) => {
        return index === updateIndex
          ? {
              ...deploymentFrequencySetting,
              [camelCase(label)]: value,
            }
          : deploymentFrequencySetting
      })
    },

    deleteADeploymentFrequencySetting: (state, action) => {
      const deleteIndex = action.payload
      state.deploymentFrequencySettings = [
        ...state.deploymentFrequencySettings.filter((deploymentFrequencySetting, index) => index !== deleteIndex),
      ]
    },
  },
})

export const {
  saveTargetFields,
  saveDoneColumn,
  saveUsers,
  saveBoardColumns,
  addADeploymentFrequencySetting,
  updateDeploymentFrequencySettings,
  deleteADeploymentFrequencySetting,
} = metricsSlice.actions

export const selectDeploymentFrequencySettings = (state: RootState) =>
  state.saveMetricsSetting.deploymentFrequencySettings

export default metricsSlice.reducer
