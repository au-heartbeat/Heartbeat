export const withPipelineAndSourceControlConfigurationConfig = {
  projectName: 'with pipeline and source control configuration',
  deployment: [
    {
      id: 0,
      isStepEmptyString: false,
      organization: 'Heartbeat-backup',
      pipelineName: 'Heartbeat',
      repoName: 'au-heartbeat/Heartbeat',
      step: ':rocket: Deploy prod',
      branches: ['main'],
    },
  ],
  pipelineCrews: [],
  sourceControlCrews: [],
  sourceControlConfigurationSettings: [
    {
      id: 1,
      organization: 'MYOB-Technology',
      repo: 'AD-Framework',
      branches: ['master'],
    },
  ],
};
