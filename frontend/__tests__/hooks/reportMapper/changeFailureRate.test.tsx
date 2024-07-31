import { pipelineChangeFailureRateMapper } from '@src/hooks/reportMapper/devChangeFailureRate';

describe('dev change failure rate data mapper', () => {
  const mockPipelineChangeFailureRateRes = {
    avgPipelineChangeFailureRate: {
      name: 'Average',
      totalTimes: 12,
      totalFailedTimes: 0,
      failureRate: 0.0,
    },
    pipelineChangeFailureRateOfPipelines: [
      {
        name: 'fs-platform-onboarding',
        step: ' :shipit: deploy to PROD',
        failedTimesOfPipeline: 0,
        totalTimesOfPipeline: 3,
        failureRate: 0.0,
      },
    ],
  };
  it('maps response dev change failure rate values to ui display value', () => {
    const expectedPipelineChangeFailureRateValues = [
      {
        id: 0,
        name: 'fs-platform-onboarding/ :shipit: deploy to PROD',
        valueList: [
          {
            value: '0.00%(0/3)',
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
    const mappedPipelineChangeFailureRate = pipelineChangeFailureRateMapper(mockPipelineChangeFailureRateRes);

    expect(mappedPipelineChangeFailureRate).toEqual(expectedPipelineChangeFailureRateValues);
  });
});
