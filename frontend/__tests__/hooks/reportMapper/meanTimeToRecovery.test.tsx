import { pipelineMeanTimeToRecoveryMapper } from '@src/hooks/reportMapper/devMeanTimeToRecovery';

describe('dev mean time to recovery data mapper', () => {
  const mockPipelineMeanTimeToRecovery = {
    avgPipelineMeanTimeToRecovery: {
      name: 'Average',
      timeToRecovery: 162120031.8,
    },
    pipelineMeanTimeToRecoveryOfPipelines: [
      {
        name: 'fs-platform-onboarding',
        step: ' :shipit: deploy to PROD',
        timeToRecovery: 162120031.8,
      },
    ],
  };
  it('maps response dev change failure rate values to ui display value', () => {
    const expectedPipelineMeanTimeToRecovery = [
      {
        id: 0,
        name: 'fs-platform-onboarding/ :shipit: deploy to PROD',
        valueList: [
          {
            value: '45.03',
          },
        ],
      },
      {
        id: 1,
        name: 'Average',
        valueList: [
          {
            value: '45.03',
          },
        ],
      },
    ];
    const mappedPipelineMeanTimeToRecovery = pipelineMeanTimeToRecoveryMapper(mockPipelineMeanTimeToRecovery);

    expect(mappedPipelineMeanTimeToRecovery).toEqual(expectedPipelineMeanTimeToRecovery);
  });

  it('should format time when timeToRecovery is greater than 0 but less than 1', () => {
    const mockPipelineMeanTimeToRecovery = {
      avgPipelineMeanTimeToRecovery: {
        name: 'Average',
        timeToRecovery: 0.32,
      },
      pipelineMeanTimeToRecoveryOfPipelines: [
        {
          name: 'fs-platform-onboarding',
          step: ' :shipit: deploy to PROD',
          timeToRecovery: 0.32,
        },
      ],
    };
    const expectedPipelineMeanTimeToRecovery = [
      {
        id: 0,
        name: 'fs-platform-onboarding/ :shipit: deploy to PROD',
        valueList: [
          {
            value: '0.00',
          },
        ],
      },
      {
        id: 1,
        name: 'Average',
        valueList: [
          {
            value: '0.00',
          },
        ],
      },
    ];
    const mappedPipelineMeanTimeToRecovery = pipelineMeanTimeToRecoveryMapper(mockPipelineMeanTimeToRecovery);

    expect(mappedPipelineMeanTimeToRecovery).toEqual(expectedPipelineMeanTimeToRecovery);
  });

  it('should map time to 0 minute when it is 0', () => {
    const mockPipelineMeanTimeToRecovery = {
      avgPipelineMeanTimeToRecovery: {
        name: 'Average',
        timeToRecovery: 0,
      },
      pipelineMeanTimeToRecoveryOfPipelines: [
        {
          name: 'fs-platform-onboarding',
          step: ' :shipit: deploy to PROD',
          timeToRecovery: 0,
        },
      ],
    };
    const expectedPipelineMeanTimeToRecovery = [
      {
        id: 0,
        name: 'fs-platform-onboarding/ :shipit: deploy to PROD',
        valueList: [
          {
            value: '0.00',
          },
        ],
      },
      {
        id: 1,
        name: 'Average',
        valueList: [
          {
            value: '0.00',
          },
        ],
      },
    ];
    const mappedPipelineMeanTimeToRecovery = pipelineMeanTimeToRecoveryMapper(mockPipelineMeanTimeToRecovery);

    expect(mappedPipelineMeanTimeToRecovery).toEqual(expectedPipelineMeanTimeToRecovery);
  });
});
