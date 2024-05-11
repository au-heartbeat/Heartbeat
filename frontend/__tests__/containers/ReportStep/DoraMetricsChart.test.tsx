import { setupStore } from '@test/utils/setupStoreUtil';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import clearAllMocks = jest.clearAllMocks;
import { DoraMetricsChart } from '@src/containers/ReportStep/DoraMetricsChart';
import * as echarts from 'echarts';
import React from 'react';

describe('Report Card', () => {
  beforeEach(() => {
    jest.spyOn(echarts, 'init').mockImplementation(() => ({
      setOption: jest.fn(),
      resize: jest.fn(),
      dispatchAction: jest.fn(),
      dispose: jest.fn(),
    }));
  });

  afterEach(() => {
    clearAllMocks();
  });
  const mockHandleRetry = jest.fn();
  const mockHandleChangeChartFailed = jest.fn();

  const data = [
    {
      velocity: {
        velocityForSP: 16,
        velocityForCards: 9,
      },
      classificationList: [
        {
          fieldName: 'Issue Type',
          pairList: [
            {
              name: 'Spike',
              value: 0.2222222222222222,
            },
            {
              name: 'Task',
              value: 0.2222222222222222,
            },
            {
              name: 'Bug',
              value: 0.1111111111111111,
            },
            {
              name: 'Story',
              value: 0.4444444444444444,
            },
          ],
        },
        {
          fieldName: 'Parent',
          pairList: [
            {
              name: 'ADM-322',
              value: 0.4444444444444444,
            },
            {
              name: 'ADM-279',
              value: 0.2222222222222222,
            },
            {
              name: 'ADM-868',
              value: 0.3333333333333333,
            },
          ],
        },
        {
          fieldName: 'Story testing-2',
          pairList: [
            {
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Story testing-1',
          pairList: [
            {
              name: '1.0',
              value: 0.2222222222222222,
            },
            {
              name: 'None',
              value: 0.7777777777777778,
            },
          ],
        },
        {
          fieldName: 'Design',
          pairList: [
            {
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Project',
          pairList: [
            {
              name: 'Auto Dora Metrics',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Sprint',
          pairList: [
            {
              name: 'Sprint33',
              value: 0.8888888888888888,
            },
            {
              name: 'Sprint 32',
              value: 0.4444444444444444,
            },
          ],
        },
        {
          fieldName: 'Reporter',
          pairList: [
            {
              name: 'Yufan Wang',
              value: 0.8888888888888888,
            },
            {
              name: 'Yichen Wang',
              value: 0.1111111111111111,
            },
          ],
        },
        {
          fieldName: 'Flagged',
          pairList: [
            {
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Fix versions',
          pairList: [
            {
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Priority',
          pairList: [
            {
              name: 'High',
              value: 0.1111111111111111,
            },
            {
              name: 'Medium',
              value: 0.8888888888888888,
            },
          ],
        },
        {
          fieldName: 'Partner',
          pairList: [
            {
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Time tracking',
          pairList: [
            {
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Labels',
          pairList: [
            {
              name: 'Stream1',
              value: 0.5555555555555556,
            },
            {
              name: 'Stream2',
              value: 0.4444444444444444,
            },
          ],
        },
        {
          fieldName: 'Story point estimate',
          pairList: [
            {
              name: '1.0',
              value: 0.4444444444444444,
            },
            {
              name: '2.0',
              value: 0.3333333333333333,
            },
            {
              name: '3.0',
              value: 0.2222222222222222,
            },
          ],
        },
        {
          fieldName: 'QA',
          pairList: [
            {
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Feature/Operation',
          pairList: [
            {
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Assignee',
          pairList: [
            {
              name: 'heartbeat user',
              value: 0.6666666666666666,
            },
            {
              name: 'Junbo Dai',
              value: 0.2222222222222222,
            },
            {
              name: 'Weiran Sun',
              value: 0.1111111111111111,
            },
          ],
        },
      ],
      cycleTime: {
        totalTimeForCards: 46.7,
        averageCycleTimePerCard: 5.19,
        averageCycleTimePerSP: 2.92,
        swimlaneList: [
          {
            optionalItemName: 'Waiting for testing',
            averageTimeForSP: 0.37,
            averageTimeForCards: 0.65,
            totalTime: 5.85,
          },
          {
            optionalItemName: 'In Dev',
            averageTimeForSP: 2.22,
            averageTimeForCards: 3.95,
            totalTime: 35.55,
          },
          {
            optionalItemName: 'Block',
            averageTimeForSP: 0.12,
            averageTimeForCards: 0.22,
            totalTime: 1.97,
          },
          {
            optionalItemName: 'Review',
            averageTimeForSP: 0,
            averageTimeForCards: 0,
            totalTime: 0,
          },
          {
            optionalItemName: 'Testing',
            averageTimeForSP: 0.21,
            averageTimeForCards: 0.37,
            totalTime: 3.33,
          },
        ],
      },
      deploymentFrequency: {
        avgDeploymentFrequency: {
          name: 'Average',
          deploymentFrequency: 0.3,
        },
        deploymentFrequencyOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            deploymentFrequency: 0.3,
            dailyDeploymentCounts: [
              {
                date: '04/02/2024',
                count: 2,
              },
              {
                date: '04/01/2024',
                count: 1,
              },
            ],
          },
        ],
      },
      devChangeFailureRate: {
        avgDevChangeFailureRate: {
          name: 'Average',
          totalTimes: 3,
          totalFailedTimes: 0,
          failureRate: 0,
        },
        devChangeFailureRateOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            failedTimesOfPipeline: 0,
            totalTimesOfPipeline: 3,
            failureRate: 0,
          },
        ],
      },
      devMeanTimeToRecovery: {
        avgDevMeanTimeToRecovery: {
          name: 'Average',
          timeToRecovery: 0,
        },
        devMeanTimeToRecoveryOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            timeToRecovery: 0,
          },
        ],
      },
      leadTimeForChanges: {
        leadTimeForChangesOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            prLeadTime: 10.28,
            pipelineLeadTime: 19.48,
            totalDelayTime: 29.759999999999998,
          },
        ],
        avgLeadTimeForChanges: {
          name: 'Average',
          prLeadTime: 10.28,
          pipelineLeadTime: 19.48,
          totalDelayTime: 29.759999999999998,
        },
      },
      reportMetricsError: {
        boardMetricsError: null,
        pipelineMetricsError: null,
        sourceControlMetricsError: null,
      },
      rework: null,
      exportValidityTime: 30,
      boardMetricsCompleted: true,
      doraMetricsCompleted: true,
      overallMetricsCompleted: true,
      allMetricsCompleted: true,
      isSuccessfulCreateCsvFile: true,
    },
  ];

  const dataThrowException = [
    {
      rework: null,
      exportValidityTime: 30,
      boardMetricsCompleted: true,
      doraMetricsCompleted: true,
      overallMetricsCompleted: true,
      allMetricsCompleted: true,
      isSuccessfulCreateCsvFile: true,
    },
  ];

  const dataWith0Value = [
    {
      rework: null,
      exportValidityTime: 30,
      boardMetricsCompleted: true,
      doraMetricsCompleted: false,
      overallMetricsCompleted: true,
      allMetricsCompleted: true,
      isSuccessfulCreateCsvFile: true,
    },
  ];

  const dateRange = ['04/01-04/14'];

  let store = setupStore();

  const setup = (data: string) => {
    store = setupStore();
    return render(
      <Provider store={store}>
        <DoraMetricsChart
          startToRequestDoraData={mockHandleRetry}
          data={data}
          dateRanges={dateRange}
          isChartFailed={false}
          retry={false}
          setIsChartFailed={mockHandleChangeChartFailed}
        />
      </Provider>,
    );
  };

  it('should correctly render', async () => {
    setup(data);
  });

  it('should throw exception in lead time for changes data', async () => {
    setup(dataThrowException);
  });

  it('should use 0 value data when date range failed ', async () => {
    setup(dataWith0Value);
  });
});
