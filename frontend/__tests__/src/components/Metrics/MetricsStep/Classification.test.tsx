import { render, within } from '@testing-library/react'
import { Classification } from '@src/components/Metrics/MetricsStep/Classification'
import userEvent from '@testing-library/user-event'
import { setupStore } from '../../../utils/setupStoreUtil'
import { Provider } from 'react-redux'

const mockTitle = 'Classification Setting'
const mockLabel = 'Distinguished by'
const mockTargetFields = [
  { flag: false, key: 'issue', name: 'Issue' },
  { flag: false, key: 'type', name: 'Type' },
]
jest.mock('@src/hooks', () => ({
  useAppSelector: jest.fn().mockReturnValue({
    classification: ['Issue', 'Parent'],
    isProjectCreated: false,
  }),
}))

let store = setupStore()
const setup = () => {
  return render(
    <Provider store={store}>
      <Classification title={mockTitle} label={mockLabel} targetFields={mockTargetFields} />
    </Provider>
  )
}

describe('Classification', () => {
  beforeEach(() => {
    store = setupStore()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show Classification when render Classification component', () => {
    const { getByText } = setup()

    expect(getByText(mockTitle)).toBeInTheDocument()
    expect(getByText(mockLabel)).toBeInTheDocument()
  })

  it('should show default options when initialization', () => {
    const { queryByText, getByText } = setup()

    expect(getByText('Issue')).toBeInTheDocument()
    expect(queryByText('Type')).not.toBeInTheDocument()
  })

  it('should show all options when click selectBox', async () => {
    const { getByRole, getByText } = setup()
    await userEvent.click(getByRole('button', { name: mockLabel }))

    expect(getByText('Type')).toBeInTheDocument()
  })

  it('should show all targetField when click All and show nothing when cancel click', async () => {
    const { getByText, getByRole } = setup()
    await userEvent.click(getByRole('button', { name: mockLabel }))
    await userEvent.click(getByText('All'))
    const listBox = within(getByRole('listbox'))
    const names = mockTargetFields.map((item) => item.name)

    expect(listBox.getByRole('option', { name: names[0] })).toHaveProperty('selected', true)
    expect(listBox.getByRole('option', { name: names[1] })).toHaveProperty('selected', true)

    await userEvent.click(getByText('All'))

    expect(listBox.getByRole('option', { name: names[0] })).toHaveProperty('selected', false)
    expect(listBox.getByRole('option', { name: names[1] })).toHaveProperty('selected', false)
  })

  it('should show selected targetField when click selected field', async () => {
    const { getByRole, getByText } = setup()
    const names = mockTargetFields.map((item) => item.name)

    await userEvent.click(getByRole('button', { name: mockLabel }))
    await userEvent.click(getByText('All'))
    await userEvent.click(getByText('All'))

    const listBox = within(getByRole('listbox'))

    await userEvent.click(listBox.getByRole('option', { name: names[0] }))

    expect(listBox.getByRole('option', { name: names[0] })).toHaveProperty('selected', true)
    expect(listBox.getByRole('option', { name: names[1] })).toHaveProperty('selected', false)
  })
})
