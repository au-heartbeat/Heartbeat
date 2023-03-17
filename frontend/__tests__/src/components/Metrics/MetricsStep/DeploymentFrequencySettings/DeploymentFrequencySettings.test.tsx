import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@src/store'
import userEvent from '@testing-library/user-event'
import { DeploymentFrequencySettings } from '@src/components/Metrics/MetricsStep/DeploymentFrequencySettings'
import { addADeploymentFrequencySetting } from '@src/context/Metrics/metricsSlice'

const ADD_BUTTON = 'Add another pipeline'
const MOCK_COMPONENT = 'mock PipelineMetricSelection'

jest.mock('@src/components/Metrics/MetricsStep/DeploymentFrequencySettings/PipelineMetricSelection', () => ({
  PipelineMetricSelection: () => <div>{MOCK_COMPONENT}</div>,
}))

jest.mock('@src/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn().mockReturnValue([{ organization: '', pipelineName: '', steps: '' }]),
}))

jest.mock('@src/context/Metrics/metricsSlice', () => ({
  addADeploymentFrequencySetting: jest.fn(),
}))

const setup = () => {
  return render(
    <Provider store={store}>
      <DeploymentFrequencySettings />
    </Provider>
  )
}

describe('DeploymentFrequencySettings', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render DeploymentFrequencySettings component', () => {
    const { getByText, getByRole } = setup()

    expect(getByText('Deployment frequency settings')).toBeInTheDocument()
    expect(getByText(MOCK_COMPONENT)).toBeInTheDocument()
    expect(getByRole('button', { name: ADD_BUTTON })).toBeInTheDocument()
  })

  it('should call addADeploymentFrequencySetting function when click add another pipeline button', async () => {
    const { getByRole } = await setup()

    await userEvent.click(getByRole('button', { name: ADD_BUTTON }))

    expect(addADeploymentFrequencySetting).toHaveBeenCalledTimes(1)
  })
})
