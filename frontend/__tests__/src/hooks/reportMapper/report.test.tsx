import { reportMapper } from '@src/hooks/reportMapper/report'

describe('report response data mapper', () => {
  it('maps response velocity values to ui display value', () => {
    const mockReportResponse = {
      velocity: {
        velocityForSP: '20',
        velocityForCards: '14',
      },
      cycleTime: {
        averageCircleTimePerCard: '30.26',
        averageCycleTimePerSP: '21.18',
        totalTimeForCards: 423.59,
        swimlaneList: [
          {
            optionalItemName: 'Analysis',
            averageTimeForSP: '8.36',
            averageTimeForCards: '11.95',
            totalTime: '167.27',
          },
        ],
      },
      deploymentFrequency: {
        avgDeploymentFrequency: {
          name: 'Average',
          deploymentFrequency: '0.40',
        },
        deploymentFrequencyOfPipelines: [
          {
            name: 'fs-platform-onboarding',
            step: ' :shipit: deploy to PROD',
            deploymentFrequency: '0.30',
            items: [
              {
                date: '9/9/2022',
                count: 1,
              },
            ],
          },
        ],
      },
      leadTimeForChanges: {
        leadTimeForChangesOfPipelines: [
          {
            name: 'fs-platform-payment-selector',
            step: 'RECORD RELEASE TO PROD',
            mergeDelayTime: 2702.53,
            pipelineDelayTime: 2587.42,
            totalDelayTime: 5289.95,
          },
        ],
        avgLeadTimeForChanges: {
          name: 'Average',
          mergeDelayTime: 3647.51,
          pipelineDelayTime: 2341.72,
          totalDelayTime: 5989.22,
        },
      },
      changeFailureRate: {
        avgChangeFailureRate: {
          name: 'Average',
          failureRate: '0.00% (0/12)',
        },
        changeFailureRateOfPipelines: [
          {
            name: 'fs-platform-onboarding',
            step: ' :shipit: deploy to PROD',
            failureRate: '0.00% (0/3)',
          },
        ],
      },
      classification: [
        {
          fieldName: 'FS Work Type',
          pairs: [
            {
              name: 'Feature Work - Planned',
              value: '57.14%',
            },
          ],
        },
      ],
    }
    const expectedVelocityValues = {
      velocityValues: [
        { id: 0, name: 'Velocity(Story Point)', value: ['20'] },
        { id: 1, name: 'ThroughPut(Cards Count)', value: ['14'] },
      ],
      cycleValues: [
        { id: 0, name: 'Average cycle time', value: ['21.18(days/SP)', '30.26(days/card)'] },
        { id: 1, name: 'Total development time / Total cycle time', value: [] },
        { id: 2, name: 'Total waiting time / Total cycle time', value: [] },
        { id: 3, name: 'Total block time / Total cycle time', value: [] },
        { id: 4, name: 'Total review time / Total cycle time', value: [] },
        { id: 5, name: 'Total testing time / Total cycle time', value: [] },
        { id: 6, name: 'Average development time', value: [] },
        { id: 7, name: 'Average waiting time', value: [] },
        { id: 8, name: 'Average block time', value: [] },
        { id: 9, name: 'Average review time', value: [] },
        { id: 10, name: 'Average testing time', value: [] },
      ],
      classificationValues: [
        {
          id: 0,
          name: 'FS Work Type',
          values: [{ name: 'Feature Work - Planned', value: '57.14%' }],
        },
      ],
      deploymentFrequencyValues: [
        {
          id: 0,
          name: 'fs-platform-onboarding/ :shipit: deploy to PROD',
          values: [
            {
              name: 'Deployment Frequency(deployments/day)',
              value: '0.30',
            },
          ],
        },
        {
          id: 1,
          name: 'Average/',
          values: [
            {
              name: 'Deployment Frequency(deployments/day)',
              value: '0.40',
            },
          ],
        },
      ],
      leadTimeForChangesValues: [
        {
          id: 0,
          name: 'fs-platform-payment-selector/RECORD RELEASE TO PROD',
          values: [
            { name: 'mergeDelayTime', value: '2702.53' },
            { name: 'pipelineDelayTime', value: '2587.42' },
            { name: 'totalDelayTime', value: '5289.95' },
          ],
        },
        {
          id: 1,
          name: 'Average/',
          values: [
            { name: 'mergeDelayTime', value: '3647.51' },
            { name: 'pipelineDelayTime', value: '2341.72' },
            { name: 'totalDelayTime', value: '5989.22' },
          ],
        },
      ],
      changeFailureRateValues: [
        {
          id: 0,
          name: 'fs-platform-onboarding/ :shipit: deploy to PROD',
          values: [
            {
              name: 'Failure Rate',
              value: '0.00% (0/3)',
            },
          ],
        },
        {
          id: 1,
          name: 'Average/',
          values: [
            {
              name: 'Failure Rate',
              value: '0.00% (0/12)',
            },
          ],
        },
      ],
    }

    const mappedReportResponseValues = reportMapper(mockReportResponse)

    expect(mappedReportResponseValues).toEqual(expectedVelocityValues)
  })
})
