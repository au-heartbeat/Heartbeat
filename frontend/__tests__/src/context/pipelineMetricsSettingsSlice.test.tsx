import pipelineMetricsSettingsReducer, {
  updateDeploymentFrequencySettings,
  addADeploymentFrequencySetting,
  deleteADeploymentFrequencySetting,
  selectDeploymentFrequencySettings,
} from '@src/context/pipelineMetricsSettings/pipelineMetricsSettingsSlice'
import { store } from '@src/store'

describe('pipelineMetricsSettings reducer', () => {
  const mockDeploymentFrequencySettings = {
    deploymentFrequencySettings: [
      { organization: 'mock organization 1', pipelineName: 'mock pipeline name 1', steps: 'step 1' },
      { organization: 'mock organization 2', pipelineName: 'mock pipeline name 2', steps: 'step 2' },
    ],
  }

  const initPipelineMetricsSettings = {
    deploymentFrequencySettings: [{ organization: '', pipelineName: '', steps: '' }],
  }

  it('should return init DeploymentFrequencySettings when handle initial state', () => {
    const pipelineMetricsSettings = pipelineMetricsSettingsReducer(undefined, { type: 'unknown' })

    expect(pipelineMetricsSettings.deploymentFrequencySettings).toEqual(
      initPipelineMetricsSettings.deploymentFrequencySettings
    )
  })

  it('should update deploymentFrequencySettings when handle updateDeploymentFrequencySettings given initial state', () => {
    const pipelineMetricsSettings = pipelineMetricsSettingsReducer(
      mockDeploymentFrequencySettings,
      updateDeploymentFrequencySettings({ updateIndex: 0, label: 'organization', value: 'mock new organization' })
    )

    expect(pipelineMetricsSettings.deploymentFrequencySettings).toEqual([
      { organization: 'mock new organization', pipelineName: 'mock pipeline name 1', steps: 'step 1' },
      { organization: 'mock organization 2', pipelineName: 'mock pipeline name 2', steps: 'step 2' },
    ])
  })

  it('should add a deploymentFrequencySetting when handle addADeploymentFrequencySettings given initial state', () => {
    const addedDeploymentFrequencySettings = [
      ...mockDeploymentFrequencySettings.deploymentFrequencySettings,
      { organization: '', pipelineName: '', steps: '' },
    ]

    const pipelineMetricsSettings = pipelineMetricsSettingsReducer(
      mockDeploymentFrequencySettings,
      addADeploymentFrequencySetting()
    )

    expect(pipelineMetricsSettings.deploymentFrequencySettings).toEqual(addedDeploymentFrequencySettings)
  })

  it('should delete a deploymentFrequencySetting when handle deleteADeploymentFrequencySettings given some state value', () => {
    const pipelineMetricsSettings = pipelineMetricsSettingsReducer(
      mockDeploymentFrequencySettings,
      deleteADeploymentFrequencySetting(0)
    )

    expect(pipelineMetricsSettings.deploymentFrequencySettings).toEqual([
      mockDeploymentFrequencySettings.deploymentFrequencySettings[1],
    ])
  })

  it('should return deploymentFrequencySettings when call selectDeploymentFrequencySettings functions', () => {
    expect(selectDeploymentFrequencySettings(store.getState())).toEqual(
      initPipelineMetricsSettings.deploymentFrequencySettings
    )
  })
})
