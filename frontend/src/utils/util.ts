import { CleanedBuildKiteEmoji, OriginBuildKiteEmoji } from '@src/emojis/emoji'
import { ICycleTimeSetting, IJiraColumnsWithValue } from '@src/context/Metrics/metricsSlice'
import { CYCLE_TIME_SETTINGS_TYPES, METRICS_CONSTANTS } from '@src/constants/resources'

export const exportToJsonFile = (filename: string, json: object) => {
  const dataStr = JSON.stringify(json, null, 4)
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
  const exportFileDefaultName = `${filename}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

export const downloadCSV = (filename: string, data: string) => {
  const blob = new Blob([data], { type: 'application/octet-stream' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const transformToCleanedBuildKiteEmoji = (input: OriginBuildKiteEmoji[]): CleanedBuildKiteEmoji[] =>
  input.map(({ name, image, aliases }) => ({
    image,
    aliases: [...new Set([...aliases, name])],
  }))

export const getJiraBoardToken = (token: string, email: string) => {
  if (token) {
    const encodedMsg = btoa(`${email}:${token}`)
    return `Basic ${encodedMsg}`
  } else {
    return ''
  }
}

export const filterAndMapCycleTimeSettings = (cycleTimeSettings: ICycleTimeSetting[]) =>
  cycleTimeSettings
    .filter((item) => item.value !== METRICS_CONSTANTS.cycleTimeEmptyStr)
    .map(({ status, value }) => ({
      name: status,
      value,
    }))

export const getRealDoneStatus = (
  cycleTimeSettings: ICycleTimeSetting[],
  cycleTimeSettingsType: CYCLE_TIME_SETTINGS_TYPES,
  realDoneStatus: string[]
) => {
  const selectedDoneStatus = cycleTimeSettings
    .filter(({ value }) => value === METRICS_CONSTANTS.doneValue)
    .map(({ status }) => status)
  if (selectedDoneStatus.length <= 1) {
    return selectedDoneStatus
  }
  return cycleTimeSettingsType === CYCLE_TIME_SETTINGS_TYPES.BY_COLUMN
    ? realDoneStatus
    : cycleTimeSettings.filter(({ value }) => value === METRICS_CONSTANTS.doneValue).map(({ status }) => status)
}

export const findCaseInsensitiveType = (option: string[], value: string): string => {
  const newValue = option.find((item) => value.toLowerCase() === item.toLowerCase())
  return newValue ? newValue : value
}
