import { HomeGuide } from '@src/components/HomeGuide'
import { fireEvent, render, renderHook, waitFor } from '@testing-library/react'
import { setupStore } from '../../utils/setupStoreUtil'
import { Provider } from 'react-redux'
import {
  CREATE_NEW_PROJECT,
  HOME_VERIFY_IMPORT_WARNING_MESSAGE,
  IMPORT_PROJECT_FROM_FILE,
  IMPORTED_NEW_CONFIG_FIXTURE,
  METRICS_PAGE_ROUTE,
  MOCK_DECRYPTED_DATA,
  PASSWORD_DIALOG,
} from '../../fixtures'
import userEvent from '@testing-library/user-event'
import { navigateMock } from '../../../setupTests'
import { act } from 'react-dom/test-utils'
import { useDecryptedEffect } from '@src/hooks/useDecryptedEffect'

const mockedUseAppDispatch = jest.fn()

jest.mock('@src/hooks/useAppDispatch', () => ({
  ...jest.requireActual('react-router-dom'),
  useAppDispatch: () => mockedUseAppDispatch,
}))

jest.mock('@src/hooks/useDecryptedEffect', () => ({
  useDecryptedEffect: jest.fn().mockReturnValue({
    decrypted: jest.fn().mockImplementation(async () => MOCK_DECRYPTED_DATA),
  }),
}))

let store = setupStore()

const setup = () => {
  store = setupStore()
  return render(
    <Provider store={store}>
      <HomeGuide />
    </Provider>
  )
}

const setupInputJsonFile = (configJson: object) => {
  const { queryByText, getByTestId } = setup()
  const file = new File([`${JSON.stringify(configJson)}`], 'test.json', {
    type: 'file',
  })

  const input = getByTestId('testInput')

  Object.defineProperty(input, 'files', {
    value: [file],
  })

  fireEvent.change(input)
  return queryByText
}

const setupEncryptedInputFile = async (content: string) => {
  const { queryByText, getByTestId, getByText } = setup()
  const file = new File([`${content}`], 'test.hb', {
    type: 'file',
  })

  const input = getByTestId('testInput')

  await userEvent.upload(input, file)

  return { queryByText, getByTestId, getByText }
}

describe('HomeGuide', () => {
  const request = { encryptedData: '5fff61e21d8a0987b0255058pv8YNHkVApLI99InkLqoZX', password: '123abc' }
  beforeEach(() => {
    store = setupStore()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show 2 buttons', () => {
    const { getByText } = setup()

    expect(getByText(IMPORT_PROJECT_FROM_FILE)).toBeInTheDocument()
    expect(getByText(CREATE_NEW_PROJECT)).toBeInTheDocument()
  })

  it('should render input when click guide button', async () => {
    const { getByText, getByTestId } = setup()
    const fileInput = getByTestId('testInput')

    const clickSpy = jest.spyOn(fileInput, 'click')
    await userEvent.click(getByText(IMPORT_PROJECT_FROM_FILE))

    expect(clickSpy).toHaveBeenCalled()
  })

  it('should go to Metrics page and read file when click import file button', async () => {
    const { getByTestId } = setup()

    const file = new File([`${JSON.stringify(IMPORTED_NEW_CONFIG_FIXTURE)}`], 'test.json', {
      type: 'file',
    })

    const input = getByTestId('testInput')

    Object.defineProperty(input, 'files', {
      value: [file],
    })

    fireEvent.change(input)

    await waitFor(() => {
      expect(mockedUseAppDispatch).toHaveBeenCalledTimes(3)
      expect(navigateMock).toHaveBeenCalledWith(METRICS_PAGE_ROUTE)
    })
  })

  it('should go to Metrics page when click create a new project button', async () => {
    const { getByText } = setup()

    await userEvent.click(getByText(CREATE_NEW_PROJECT))

    expect(navigateMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith(METRICS_PAGE_ROUTE)
  })

  describe('isValidImportedConfig', () => {
    it('should show warning message when no projectName dateRange metrics all exist', async () => {
      const emptyConfig = {}
      const queryByText = setupInputJsonFile(emptyConfig)

      await waitFor(() => {
        expect(mockedUseAppDispatch).toHaveBeenCalledTimes(0)
        expect(queryByText(HOME_VERIFY_IMPORT_WARNING_MESSAGE)).toBeInTheDocument()
      })
    })

    it('should no display warning message when  projectName dateRange metrics all exist', async () => {
      const queryByText = setupInputJsonFile(IMPORTED_NEW_CONFIG_FIXTURE)

      await waitFor(() => {
        expect(mockedUseAppDispatch).toHaveBeenCalledTimes(0)
        expect(queryByText(HOME_VERIFY_IMPORT_WARNING_MESSAGE)).not.toBeInTheDocument()
      })
    })

    it.each([
      ['projectName', { projectName: '', metrics: [], dateRange: {} }],
      ['startDate', { projectName: 'Test Project', metrics: [], dateRange: { startDate: '2023-01-01', endDate: '' } }],
      ['endDate', { projectName: '', metrics: [], dateRange: { startDate: '', endDate: '2023-02-01' } }],
      ['metrics', { projectName: '', metrics: ['Metric 1', 'Metric 2'], dateRange: {} }],
    ])('should not display warning message when only %s exists', async (_, validConfig) => {
      const queryByText = setupInputJsonFile(validConfig)

      await waitFor(() => {
        expect(mockedUseAppDispatch).toHaveBeenCalledTimes(0)
        expect(queryByText(HOME_VERIFY_IMPORT_WARNING_MESSAGE)).not.toBeInTheDocument()
      })
    })
  })

  it('should open password dialog when using encrypted file', async () => {
    const { getByText } = await setupEncryptedInputFile(request.encryptedData)
    const passwordDialog = await waitFor(() => getByText(PASSWORD_DIALOG.TITLE))
    expect(passwordDialog).toBeInTheDocument()
  })

  it('should hide the password dialog when clicking confirmation button', async () => {
    const { getByText } = await setupEncryptedInputFile(request.encryptedData)
    const passwordConfirmButton = await waitFor(() => getByText(PASSWORD_DIALOG.CONFIRM_BUTTON))
    const passwordInputBox = await waitFor(() => getByText(PASSWORD_DIALOG.INPUT_BOX))
    const passwordDialog = await waitFor(() => getByText(PASSWORD_DIALOG.TITLE))

    expect(passwordDialog).toBeVisible()

    await act(async () => {
      await userEvent.type(passwordInputBox, request.password)
      await userEvent.click(passwordConfirmButton)
    })

    expect(passwordDialog).not.toBeVisible()
  })

  it('should call decrypted one time when clicking confirmation button', async () => {
    const { result } = renderHook(() => useDecryptedEffect())
    const { getByText } = await setupEncryptedInputFile(request.encryptedData)
    const passwordConfirmButton = await waitFor(() => getByText(PASSWORD_DIALOG.CONFIRM_BUTTON))
    const passwordInputBox = await waitFor(() => getByText(PASSWORD_DIALOG.INPUT_BOX))

    await act(async () => {
      await userEvent.type(passwordInputBox, request.password)
      await userEvent.click(passwordConfirmButton)
    })
    expect(result.current.decrypted).toBeCalledTimes(1)
  })

  it('should navigate to metrics page when decrypted function return valid json', async () => {
    const { getByText } = await setupEncryptedInputFile(request.encryptedData)
    const { result } = renderHook(() => useDecryptedEffect())
    const passwordConfirmButton = await waitFor(() => getByText(PASSWORD_DIALOG.CONFIRM_BUTTON))
    const passwordInputBox = await waitFor(() => getByText(PASSWORD_DIALOG.INPUT_BOX))

    await act(async () => {
      await userEvent.type(passwordInputBox, request.password)
      await userEvent.click(passwordConfirmButton)
    })
    expect(navigateMock).toHaveBeenCalledWith(METRICS_PAGE_ROUTE)
    expect(result.current.decrypted).toBeCalledTimes(1)
  })

  it('should show progress bar when clicking confirmation button', async () => {
    const { getByTestId } = await setupEncryptedInputFile(request.encryptedData)
    const { result } = renderHook(() => useDecryptedEffect())

    await act(async () => {
      result.current.isLoading = true
    })

    const progressBar = await waitFor(() => getByTestId('loading-page'))
    expect(progressBar).toBeVisible()
  })

  it('should hide the password dialog when clicking cancel button', async () => {
    const { getByText } = await setupEncryptedInputFile(request.encryptedData)
    const passwordCancelButton = await waitFor(() => getByText(PASSWORD_DIALOG.CANCEL_BUTTON))
    const passwordDialog = await waitFor(() => getByText(PASSWORD_DIALOG.TITLE))

    expect(passwordDialog).toBeVisible()

    await act(async () => {
      await userEvent.click(passwordCancelButton)
    })

    expect(passwordDialog).not.toBeVisible()
  })

  it('should show error message when clicking decrypted function failed', async () => {
    const { result } = renderHook(() => useDecryptedEffect())
    const { getByText } = await setupEncryptedInputFile(request.encryptedData)

    const excepted = 'Get and error'

    await act(async () => {
      result.current.errorMessage = excepted
    })

    const errorMessage = await waitFor(() => getByText(excepted))

    expect(errorMessage).toBeInTheDocument()
  })
})
