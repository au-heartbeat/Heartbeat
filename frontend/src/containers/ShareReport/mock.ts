
export const metrics = [
  'Velocity',
  'Cycle time',
  'Classification',
  'Lead time for changes',
  'Deployment frequency',
  'Dev change failure rate',
  'Dev mean time to recovery',
];
export const dateRanges = [
  {
    startDate: '2024-05-13T00:00:00.000+08:00',
    endDate: '2024-05-26T23:59:59.999+08:00',
  },
  {
    startDate: '2024-05-27T00:00:00.000+08:00',
    endDate: '2024-06-09T23:59:59.999+08:00',
  },
];
export const startToRequestDoraData = () => {};
export const startToRequestBoardData = () => {};
export const handleSave = () => {};
export const reportId = 1719909118749;

export const reportInfos = [
  {
    id: '2024-05-13T00:00:00.000+08:00',
    timeout4Board: {
      message: '',
      shouldShow: true,
    },
    timeout4Dora: {
      message: '',
      shouldShow: true,
    },
    timeout4Report: {
      message: '',
      shouldShow: true,
    },
    generalError4Board: {
      message: '',
      shouldShow: true,
    },
    generalError4Dora: {
      message: '',
      shouldShow: true,
    },
    generalError4Report: {
      message: '',
      shouldShow: true,
    },
    shouldShowBoardMetricsError: true,
    shouldShowPipelineMetricsError: true,
    shouldShowSourceControlMetricsError: true,
    reportData: {
      velocity: {
        velocityForSP: 19.5,
        velocityForCards: 11,
      },
      classificationList: [
        {
          fieldName: 'Issue Type',
          pairList: [
            {
              name: 'Bug',
              value: 0.36363636363636365,
            },
            {
              name: 'Story',
              value: 0.6363636363636364,
            },
          ],
        },
        {
          fieldName: 'Parent',
          pairList: [
            {
              name: 'ADM-322',
              value: 0.18181818181818182,
            },
            {
              name: 'ADM-868',
              value: 0.6363636363636364,
            },
            {
              name: 'ADM-319',
              value: 0.09090909090909091,
            },
            {
              name: 'ADM-593',
              value: 0.09090909090909091,
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
              name: 'None',
              value: 1,
            },
          ],
        },
        {
          fieldName: 'Sprint',
          pairList: [
            {
              name: 'Sprint 35',
              value: 0.8181818181818182,
            },
            {
              name: 'Sprint 36',
              value: 1,
            },
            {
              name: 'Sprint34',
              value: 0.36363636363636365,
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
              name: 'Medium',
              value: 1,
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
          fieldName: 'Labels',
          pairList: [
            {
              name: '1.1.7',
              value: 0.8181818181818182,
            },
            {
              name: 'Stream1',
              value: 0.18181818181818182,
            },
            {
              name: 'None',
              value: 0.09090909090909091,
            },
            {
              name: 'Stream2',
              value: 0.09090909090909091,
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
          fieldName: 'Story point estimate',
          pairList: [
            {
              name: '1.0',
              value: 0.45454545454545453,
            },
            {
              name: '2.0',
              value: 0.18181818181818182,
            },
            {
              name: '3.0',
              value: 0.2727272727272727,
            },
            {
              name: '1.5',
              value: 0.09090909090909091,
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
              value: 0.7272727272727273,
            },
            {
              name: 'Weiran Sun',
              value: 0.09090909090909091,
            },
            {
              name: 'YinYuan Zhou',
              value: 0.09090909090909091,
            },
            {
              name: 'Qiuhong Lei',
              value: 0.09090909090909091,
            },
          ],
        },
      ],
      cycleTime: {
        totalTimeForCards: 116.84,
        averageCycleTimePerCard: 10.62,
        averageCycleTimePerSP: 5.99,
        swimlaneList: [
          {
            optionalItemName: 'Waiting for testing',
            averageTimeForSP: 0.53,
            averageTimeForCards: 0.95,
            totalTime: 10.4,
          },
          {
            optionalItemName: 'In Dev',
            averageTimeForSP: 3.08,
            averageTimeForCards: 5.47,
            totalTime: 60.14,
          },
          {
            optionalItemName: 'Block',
            averageTimeForSP: 0.87,
            averageTimeForCards: 1.54,
            totalTime: 16.95,
          },
          {
            optionalItemName: 'Review',
            averageTimeForSP: 0.58,
            averageTimeForCards: 1.02,
            totalTime: 11.22,
          },
          {
            optionalItemName: 'Testing',
            averageTimeForSP: 0.93,
            averageTimeForCards: 1.65,
            totalTime: 18.13,
          },
        ],
      },
      deploymentFrequency: {
        avgDeploymentFrequency: {
          name: 'Average',
          deploymentFrequency: 2,
        },
        deploymentFrequencyOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            deploymentFrequency: 2,
            dailyDeploymentCounts: [
              {
                date: '05/24/2024',
                count: 3,
              },
              {
                date: '05/22/2024',
                count: 2,
              },
              {
                date: '05/21/2024',
                count: 2,
              },
              {
                date: '05/20/2024',
                count: 2,
              },
              {
                date: '05/18/2024',
                count: 1,
              },
              {
                date: '05/17/2024',
                count: 3,
              },
              {
                date: '05/16/2024',
                count: 4,
              },
              {
                date: '05/15/2024',
                count: 3,
              },
              {
                date: '05/13/2024',
                count: 1,
              },
            ],
          },
        ],
      },
      devChangeFailureRate: {
        avgDevChangeFailureRate: {
          name: 'Average',
          totalTimes: 29,
          totalFailedTimes: 9,
          failureRate: 0.3103,
        },
        devChangeFailureRateOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            failedTimesOfPipeline: 9,
            totalTimesOfPipeline: 29,
            failureRate: 0.3103,
          },
        ],
      },
      devMeanTimeToRecovery: {
        avgDevMeanTimeToRecovery: {
          name: 'Average',
          timeToRecovery: 28759866,
        },
        devMeanTimeToRecoveryOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            timeToRecovery: 28759866,
          },
        ],
      },
      leadTimeForChanges: {
        leadTimeForChangesOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            prLeadTime: 24626.05,
            pipelineLeadTime: 21.33,
            totalDelayTime: 24647.38,
          },
        ],
        avgLeadTimeForChanges: {
          name: 'Average',
          prLeadTime: 24626.05,
          pipelineLeadTime: 21.33,
          totalDelayTime: 24647.38,
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
  },
  {
    id: '2024-05-27T00:00:00.000+08:00',
    timeout4Board: {
      message: '',
      shouldShow: true,
    },
    timeout4Dora: {
      message: '',
      shouldShow: true,
    },
    timeout4Report: {
      message: '',
      shouldShow: true,
    },
    generalError4Board: {
      message: '',
      shouldShow: true,
    },
    generalError4Dora: {
      message: '',
      shouldShow: true,
    },
    generalError4Report: {
      message: '',
      shouldShow: true,
    },
    shouldShowBoardMetricsError: true,
    shouldShowPipelineMetricsError: true,
    shouldShowSourceControlMetricsError: true,
    reportData: {
      velocity: {
        velocityForSP: 18.5,
        velocityForCards: 11,
      },
      classificationList: [
        {
          fieldName: 'Issue Type',
          pairList: [
            {
              name: 'Task',
              value: 0.2727272727272727,
            },
            {
              name: 'Bug',
              value: 0.2727272727272727,
            },
            {
              name: 'Story',
              value: 0.45454545454545453,
            },
          ],
        },
        {
          fieldName: 'Parent',
          pairList: [
            {
              name: 'ADM-868',
              value: 0.7272727272727273,
            },
            {
              name: 'ADM-319',
              value: 0.2727272727272727,
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
              value: 0.2727272727272727,
            },
            {
              name: 'None',
              value: 0.7272727272727273,
            },
          ],
        },
        {
          fieldName: 'Sprint',
          pairList: [
            {
              name: 'Sprint37',
              value: 0.6363636363636364,
            },
            {
              name: 'Sprint 35',
              value: 0.36363636363636365,
            },
            {
              name: 'Sprint 36',
              value: 0.6363636363636364,
            },
            {
              name: 'Sprint34',
              value: 0.36363636363636365,
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
              value: 0.18181818181818182,
            },
            {
              name: 'Medium',
              value: 0.7272727272727273,
            },
            {
              name: 'Highest',
              value: 0.09090909090909091,
            },
          ],
        },
        {
          fieldName: 'Partner',
          pairList: [
            {
              name: 'Weiran Sun',
              value: 0.09090909090909091,
            },
            {
              name: 'YinYuan Zhou',
              value: 0.09090909090909091,
            },
            {
              name: 'None',
              value: 0.8181818181818182,
            },
          ],
        },
        {
          fieldName: 'Labels',
          pairList: [
            {
              name: '1.1.7',
              value: 0.9090909090909091,
            },
            {
              name: 'None',
              value: 0.09090909090909091,
            },
            {
              name: 'Stream2',
              value: 0.18181818181818182,
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
          fieldName: 'Story point estimate',
          pairList: [
            {
              name: '1.0',
              value: 0.45454545454545453,
            },
            {
              name: '2.0',
              value: 0.18181818181818182,
            },
            {
              name: '3.0',
              value: 0.2727272727272727,
            },
            {
              name: '0.5',
              value: 0.09090909090909091,
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
              value: 0.09090909090909091,
            },
            {
              name: 'Chao Wang',
              value: 0.09090909090909091,
            },
            {
              name: 'Yufan Wang',
              value: 0.09090909090909091,
            },
            {
              name: 'Man Tang',
              value: 0.18181818181818182,
            },
            {
              name: 'YinYuan Zhou',
              value: 0.36363636363636365,
            },
            {
              name: 'Guangbin Ma',
              value: 0.09090909090909091,
            },
            {
              name: 'Qiuhong Lei',
              value: 0.09090909090909091,
            },
          ],
        },
      ],
      cycleTime: {
        totalTimeForCards: 112.97,
        averageCycleTimePerCard: 10.27,
        averageCycleTimePerSP: 6.11,
        swimlaneList: [
          {
            optionalItemName: 'Waiting for testing',
            averageTimeForSP: 0.2,
            averageTimeForCards: 0.34,
            totalTime: 3.7,
          },
          {
            optionalItemName: 'In Dev',
            averageTimeForSP: 3.43,
            averageTimeForCards: 5.78,
            totalTime: 63.54,
          },
          {
            optionalItemName: 'Block',
            averageTimeForSP: 1.49,
            averageTimeForCards: 2.51,
            totalTime: 27.61,
          },
          {
            optionalItemName: 'Review',
            averageTimeForSP: 0.63,
            averageTimeForCards: 1.06,
            totalTime: 11.7,
          },
          {
            optionalItemName: 'Testing',
            averageTimeForSP: 0.35,
            averageTimeForCards: 0.58,
            totalTime: 6.42,
          },
        ],
      },
      deploymentFrequency: {
        avgDeploymentFrequency: {
          name: 'Average',
          deploymentFrequency: 1.2,
        },
        deploymentFrequencyOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            deploymentFrequency: 1.2,
            dailyDeploymentCounts: [
              {
                date: '06/06/2024',
                count: 1,
              },
              {
                date: '06/05/2024',
                count: 2,
              },
              {
                date: '06/04/2024',
                count: 1,
              },
              {
                date: '06/03/2024',
                count: 2,
              },
              {
                date: '06/02/2024',
                count: 2,
              },
              {
                date: '05/31/2024',
                count: 1,
              },
              {
                date: '05/30/2024',
                count: 3,
              },
              {
                date: '05/29/2024',
                count: 1,
              },
              {
                date: '05/28/2024',
                count: 1,
              },
              {
                date: '05/27/2024',
                count: 1,
              },
            ],
          },
        ],
      },
      devChangeFailureRate: {
        avgDevChangeFailureRate: {
          name: 'Average',
          totalTimes: 12,
          totalFailedTimes: 0,
          failureRate: 0,
        },
        devChangeFailureRateOfPipelines: [
          {
            name: 'Heartbeat',
            step: ':rocket: Deploy prod',
            failedTimesOfPipeline: 0,
            totalTimesOfPipeline: 12,
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
            prLeadTime: 3099.13,
            pipelineLeadTime: 29.79,
            totalDelayTime: 3128.92,
          },
        ],
        avgLeadTimeForChanges: {
          name: 'Average',
          prLeadTime: 3099.13,
          pipelineLeadTime: 29.79,
          totalDelayTime: 3128.92,
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
  },
];
