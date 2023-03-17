import React from 'react'
import { AddButton } from './style'
import { PipelineMetricSelection } from './PipelineMetricSelection'
import { useAppDispatch, useAppSelector } from '@src/hooks'
import { v4 as uuidV4 } from 'uuid'
import MetricsSettingTitle from '@src/components/Common/MetricsSettingTitle'
import { addADeploymentFrequencySetting, selectDeploymentFrequencySettings } from '@src/context/Metrics/metricsSlice'

export const DeploymentFrequencySettings = () => {
  const dispatch = useAppDispatch()
  const deploymentFrequencySettings = useAppSelector(selectDeploymentFrequencySettings)

  const handleClick = () => {
    dispatch(addADeploymentFrequencySetting())
  }

  return (
    <>
      <MetricsSettingTitle title={'Deployment frequency settings'} />
      {deploymentFrequencySettings.map((deploymentFrequencySetting, index) => (
        <PipelineMetricSelection
          key={uuidV4()}
          deploymentFrequencySetting={deploymentFrequencySetting}
          index={index}
          isShowRemoveButton={deploymentFrequencySettings.length > 1}
        />
      ))}
      <AddButton onClick={handleClick}> Add another pipeline</AddButton>
    </>
  )
}
