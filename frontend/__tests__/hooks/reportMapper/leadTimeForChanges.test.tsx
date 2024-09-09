import { leadTimeForChangesMapper } from '@src/hooks/reportMapper/leadTimeForChanges';
import { PIPELINE_LEAD_TIME, PR_LEAD_TIME, TOTAL_DELAY_TIME } from '../../fixtures';

describe('lead time for changes data mapper', () => {
  const mockLeadTimeForChangesRes = {
    leadTimeForChangesOfPipelines: [
      {
        name: 'Heartbeat',
        step: ':rocket: Run e2e',
        prLeadTime: 22481.55,
        pipelineLeadTime: 4167.97,
        totalDelayTime: 18313.579999999998,
      },
    ],
    leadTimeForChangesOfSourceControls: [],
    avgLeadTimeForChanges: {
      name: 'Average',
      prLeadTime: 22481.55,
      pipelineLeadTime: 4167.97,
      totalDelayTime: 18313.579999999998,
    },
  };
  it('maps response lead time for changes values to ui display value', () => {
    const expectedLeadTimeForChangesValues = [
      {
        id: 0,
        name: 'Heartbeat/:rocket: Run e2e',
        valueList: [
          {
            name: 'PR Lead Time',
            values: ['374.69'],
          },
          {
            name: 'Pipeline Lead Time',
            values: ['69.47'],
          },
          {
            name: 'Total Lead Time',
            values: ['305.23'],
          },
        ],
      },
      {
        id: 1,
        name: 'Average',
        valueList: [
          {
            name: 'PR Lead Time',
            values: ['374.69'],
          },
          {
            name: 'Pipeline Lead Time',
            values: ['69.47'],
          },
          {
            name: 'Total Lead Time',
            values: ['305.23'],
          },
        ],
      },
    ];
    const mappedLeadTimeForChanges = leadTimeForChangesMapper(mockLeadTimeForChangesRes);

    expect(mappedLeadTimeForChanges).toEqual(expectedLeadTimeForChangesValues);
  });

  it('should map time to 0 minute when it is 0', () => {
    const mockLeadTimeForChangesResMock = {
      leadTimeForChangesOfPipelines: [
        {
          name: 'fs-platform-payment-selector',
          step: 'RECORD RELEASE TO PROD',
          prLeadTime: 0,
          pipelineLeadTime: 0,
          totalDelayTime: 0,
        },
      ],
      leadTimeForChangesOfSourceControls: [],
      avgLeadTimeForChanges: {
        name: 'Average',
        prLeadTime: 0,
        pipelineLeadTime: 0,
        totalDelayTime: 0,
      },
    };

    const expectedLeadTimeForChangesValues = [
      {
        id: 0,
        name: 'fs-platform-payment-selector/RECORD RELEASE TO PROD',
        valueList: [
          { name: PR_LEAD_TIME, values: ['0.00'] },
          { name: PIPELINE_LEAD_TIME, values: ['0.00'] },
          { name: TOTAL_DELAY_TIME, values: ['0.00'] },
        ],
      },
      {
        id: 1,
        name: 'Average',
        valueList: [
          { name: PR_LEAD_TIME, values: ['0.00'] },
          { name: PIPELINE_LEAD_TIME, values: ['0.00'] },
          { name: TOTAL_DELAY_TIME, values: ['0.00'] },
        ],
      },
    ];
    const mappedLeadTimeForChanges = leadTimeForChangesMapper(mockLeadTimeForChangesResMock);

    expect(mappedLeadTimeForChanges).toEqual(expectedLeadTimeForChangesValues);
  });

  it('should maps response lead time for changes values when send source control data', () => {
    const mockLeadTimeForChanges = {
      leadTimeForChangesOfPipelines: [
        {
          name: 'Heartbeat',
          step: ':rocket: Run e2e',
          prLeadTime: 22481.55,
          pipelineLeadTime: 4167.97,
          totalDelayTime: 18313.579999999998,
        },
      ],
      leadTimeForChangesOfSourceControls: [
        {
          organization: 'au-heartbeat',
          repo: 'heartbeat',
          prLeadTime: 22481.55,
          pipelineLeadTime: 4167.97,
          totalDelayTime: 18313.579999999998,
        },
      ],
      avgLeadTimeForChanges: {
        name: 'Average',
        prLeadTime: 22481.55,
        pipelineLeadTime: 4167.97,
        totalDelayTime: 18313.579999999998,
      },
    };
    const expectedLeadTimeForChangesValues = [
      {
        id: 0,
        name: 'Heartbeat/:rocket: Run e2e',
        valueList: [
          {
            name: 'PR Lead Time',
            values: ['374.69'],
          },
          {
            name: 'Pipeline Lead Time',
            values: ['69.47'],
          },
          {
            name: 'Total Lead Time',
            values: ['305.23'],
          },
        ],
      },
      {
        id: 1,
        name: 'au-heartbeat/heartbeat',
        valueList: [
          {
            name: 'PR Lead Time',
            values: ['374.69'],
          },
          {
            name: 'Pipeline Lead Time',
            values: ['69.47'],
          },
          {
            name: 'Total Lead Time',
            values: ['305.23'],
          },
        ],
      },
      {
        id: 2,
        name: 'Average',
        valueList: [
          {
            name: 'PR Lead Time',
            values: ['374.69'],
          },
          {
            name: 'Pipeline Lead Time',
            values: ['69.47'],
          },
          {
            name: 'Total Lead Time',
            values: ['305.23'],
          },
        ],
      },
    ];
    const mappedLeadTimeForChanges = leadTimeForChangesMapper(mockLeadTimeForChanges);

    expect(mappedLeadTimeForChanges).toEqual(expectedLeadTimeForChangesValues);
  });
});
