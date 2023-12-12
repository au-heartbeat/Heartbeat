import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@src/hooks/useAppDispatch'
import { updateBasicConfigState, updateProjectCreatedState } from '@src/context/config/configSlice'
import React, { useCallback, useState } from 'react'
import { updateMetricsImportedData } from '@src/context/Metrics/metricsSlice'
import { resetStep } from '@src/context/stepper/StepperSlice'
import { WarningNotification } from '@src/components/Common/WarningNotification'
import { convertToNewFileConfig, NewFileConfig, OldFileConfig } from '@src/fileConfig/fileConfig'
import { GuideButton, HomeGuideContainer, StyledStack } from '@src/components/HomeGuide/style'
import { MESSAGE } from '@src/constants/resources'
import { ROUTE } from '@src/constants/router'
import PasswordDialog from '@src/components/Common/PasswordDialog'
import { useDecryptedEffect } from '@src/hooks/useDecryptedEffect'
import { Loading } from '@src/components/Loading'
import { ErrorNotification } from '@src/components/ErrorNotification'

export const HomeGuide = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [validConfig, setValidConfig] = useState(true)
  const [isShowPasswordDialog, setIsShowPasswordDialog] = useState(false)
  const [fileContent, setFileContent] = useState<string>()
  const { decrypted, isLoading, errorMessage } = useDecryptedEffect()

  const getImportFileElement = () => document.getElementById('importJson') as HTMLInputElement
  const isValidImportedConfig = (config: NewFileConfig) => {
    try {
      const {
        projectName,
        metrics,
        dateRange: { startDate, endDate },
      } = config
      return projectName || startDate || endDate || metrics.length > 0
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.files?.[0]
    input && readConfigJson(input)
  }

  const readConfigJson = (input: Blob) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        if (reader.result && typeof reader.result === 'string') {
          const result = reader.result
          setFileContent(result)
          handleImportConfigFile(result)
        }
      } catch (e) {
        tryToReadEncryptedConfig()
      }
      const fileInput = getImportFileElement()
      fileInput.value = ''
    }
    reader.readAsText(input, 'utf-8')
    reader.addEventListener('error', () => setValidConfig(false))
  }

  const handleImportConfigFile = (result: string) => {
    const importedConfig: OldFileConfig | NewFileConfig = JSON.parse(result)
    const config: NewFileConfig = convertToNewFileConfig(importedConfig)
    if (isValidImportedConfig(config)) {
      dispatch(updateProjectCreatedState(false))
      dispatch(updateBasicConfigState(config))
      dispatch(updateMetricsImportedData(config))
      navigate(ROUTE.METRICS_PAGE)
    } else {
      setValidConfig(false)
    }
  }

  const tryToReadEncryptedConfig = () => {
    setIsShowPasswordDialog(true)
  }

  const openFileImportBox = () => {
    setValidConfig(true)
    dispatch(resetStep())
    const fileInput = getImportFileElement()
    fileInput.click()
  }

  const createNewProject = () => {
    dispatch(resetStep())
    navigate(ROUTE.METRICS_PAGE)
  }

  const handlePasswordConfirm = (password: string) => {
    setIsShowPasswordDialog(false)
    if (!fileContent) return
    decrypted({ encryptedData: fileContent, password }).then((res?: string) => res && handleImportConfigFile(res))
  }

  const handleCancel = useCallback(() => {
    setIsShowPasswordDialog(false)
  }, [isShowPasswordDialog])

  return (
    <HomeGuideContainer>
      {!validConfig && <WarningNotification message={MESSAGE.HOME_VERIFY_IMPORT_WARNING} />}
      <StyledStack direction='column' justifyContent='center' alignItems='center' flex={'auto'}>
        <GuideButton onClick={openFileImportBox}>Import project from file</GuideButton>
        <input hidden type='file' data-testid='testInput' id='importJson' accept='.json,.hb' onChange={handleChange} />
        <GuideButton onClick={createNewProject}>Create a new project</GuideButton>
      </StyledStack>
      <PasswordDialog
        isShowPasswordDialog={isShowPasswordDialog}
        isShowConfirmPasswordBox={false}
        handleConfirm={handlePasswordConfirm}
        handleCancel={handleCancel}
      />
      {errorMessage && <ErrorNotification message={errorMessage} />}
      {isLoading && <Loading />}
    </HomeGuideContainer>
  )
}
