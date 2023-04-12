import { render } from '@testing-library/react'
import { Classification } from '@src/components/Metrics/ReportStep/Classification'
import { ClassificationMetricName } from '../../../fixtures'

describe('Classification component', () => {
  const mockTitle = 'Test Classification'

  const mockClassificationData = [
    {
      id: 1,
      name: 'FS Work Type',
      values: [
        { name: 'Feature Work - Planned', value: '57.14%' },
        { name: 'Operational Work - Planned', value: '35.71%' },
        { name: 'Feature Work - Unplanned', value: '7.14%' },
      ],
    },
  ]

  const setup = () => render(<Classification title={mockTitle} classificationData={mockClassificationData} />)

  test('renders the component with the correct title and data', () => {
    const { getByText } = setup()

    expect(getByText(mockTitle)).toBeInTheDocument()
    expect(getByText(ClassificationMetricName.FS_WORK_TYPE)).toBeInTheDocument()
  })
})
