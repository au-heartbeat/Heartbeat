import {
  DORA_METRICS_MAPPING,
  MetricsSubtitle,
  MetricsTitle,
  PIPELINE_METRICS,
  REPORT_PAGE,
  RequiredData,
  RETRY,
  SHOW_MORE,
  SOURCE_CONTROL_METRICS,
} from '@src/constants/resources';
import { StyledMetricsSection, StyledShowMore, StyledTitleWrapper } from '@src/containers/ReportStep/DoraMetrics/style';
import { formatMillisecondsToHours, formatMinToHours } from '@src/utils/util';
import { ReportTitle } from '@src/components/Common/ReportGrid/ReportTitle';
import { StyledRetry } from '@src/containers/ReportStep/BoardMetrics/style';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { StyledSpacing } from '@src/containers/ReportStep/style';
import { ReportGrid } from '@src/components/Common/ReportGrid';
import { selectConfig } from '@src/context/config/configSlice';
import { useAppSelector } from '@src/hooks';
import React from 'react';
import _ from 'lodash';

interface DoraMetricsProps {
  startToRequestDoraData: () => void;
  onShowDetail: () => void;
  doraReport: ReportResponseDTO | undefined;
  errorMessage: string;
}

const DoraMetrics = ({ startToRequestDoraData, onShowDetail, doraReport, errorMessage }: DoraMetricsProps) => {
  const configData = useAppSelector(selectConfig);
  const { metrics } = configData.basic;
  const shouldShowSourceControl = metrics.includes(RequiredData.LeadTimeForChanges);
  const sourceControlMetricsCompleted = metrics
    .filter((metric) => SOURCE_CONTROL_METRICS.includes(metric))
    .map((metric) => DORA_METRICS_MAPPING[metric])
    .every((metric) => doraReport?.[metric] ?? false);
  const pipelineMetricsCompleted = metrics
    .filter((metric) => PIPELINE_METRICS.includes(metric))
    .map((metric) => DORA_METRICS_MAPPING[metric])
    .every((metric) => doraReport?.[metric] ?? false);

  const getSourceControlItems = () => {
    const leadTimeForChanges = doraReport?.leadTimeForChanges;
    return [
      {
        title: MetricsTitle.LeadTimeForChanges,
        items: leadTimeForChanges && [
          {
            value: formatMinToHours(leadTimeForChanges.avgLeadTimeForChanges.prLeadTime),
            subtitle: MetricsSubtitle.PRLeadTime,
          },
          {
            value: formatMinToHours(leadTimeForChanges.avgLeadTimeForChanges.pipelineLeadTime),
            subtitle: MetricsSubtitle.PipelineLeadTime,
          },
          {
            value: formatMinToHours(leadTimeForChanges.avgLeadTimeForChanges.totalDelayTime),
            subtitle: MetricsSubtitle.TotalDelayTime,
          },
        ],
      },
    ];
  };

  const getDeploymentFrequencyItems = () => {
    const deploymentFrequency = doraReport?.deploymentFrequency;
    return metrics.includes(RequiredData.DeploymentFrequency)
      ? [
          {
            title: MetricsTitle.DeploymentFrequency,
            items: deploymentFrequency && [
              {
                value: deploymentFrequency?.avgDeploymentFrequency.deploymentFrequency,
                subtitle: MetricsSubtitle.DeploymentFrequency,
              },
              {
                value: deploymentFrequency?.totalDeployTimes,
                subtitle: MetricsSubtitle.DeploymentTimes,
                isToFixed: false,
              },
            ],
          },
        ]
      : [];
  };

  const getPipelineItems = () => {
    const devMeanTimeToRecovery = doraReport?.devMeanTimeToRecovery;
    const devChangeFailureRate = doraReport?.devChangeFailureRate;

    const devMeanTimeToRecoveryList = metrics.includes(RequiredData.DevMeanTimeToRecovery)
      ? [
          {
            title: MetricsTitle.DevMeanTimeToRecovery,
            items: devMeanTimeToRecovery && [
              {
                value: formatMillisecondsToHours(devMeanTimeToRecovery.avgDevMeanTimeToRecovery.timeToRecovery),
                subtitle: MetricsSubtitle.DevMeanTimeToRecoveryHours,
              },
            ],
          },
        ]
      : [];

    const devChangeFailureRateList = metrics.includes(RequiredData.DevChangeFailureRate)
      ? [
          {
            title: MetricsTitle.DevChangeFailureRate,
            items: devChangeFailureRate && [
              {
                value: devChangeFailureRate.avgDevChangeFailureRate.failureRate * 100,
                extraValue: `% (${devChangeFailureRate.avgDevChangeFailureRate.totalFailedTimes}/${devChangeFailureRate.avgDevChangeFailureRate.totalTimes})`,
                subtitle: MetricsSubtitle.FailureRate,
              },
            ],
          },
        ]
      : [];

    return [...devChangeFailureRateList, ...devMeanTimeToRecoveryList];
  };

  const getErrorMessage4BuildKite = () =>
    _.get(doraReport, ['reportMetricsError', 'pipelineMetricsError'])
      ? `Failed to get BuildKite info, status: ${_.get(doraReport, [
          'reportMetricsError',
          'pipelineMetricsError',
          'status',
        ])}`
      : '';

  const getErrorMessage4Github = () =>
    _.get(doraReport, ['reportMetricsError', 'sourceControlMetricsError'])
      ? `Failed to get GitHub info, status: ${_.get(doraReport, [
          'reportMetricsError',
          'sourceControlMetricsError',
          'status',
        ])}`
      : '';

  const hasDoraError = !!(getErrorMessage4BuildKite() || getErrorMessage4Github());

  const shouldShowRetry = () => {
    return hasDoraError || errorMessage;
  };

  const handleRetry = () => {
    startToRequestDoraData();
  };

  return (
    <>
      <StyledMetricsSection>
        <StyledTitleWrapper>
          <ReportTitle title={REPORT_PAGE.DORA.TITLE} />
          {!hasDoraError && !errorMessage && (sourceControlMetricsCompleted || pipelineMetricsCompleted) && (
            <StyledShowMore onClick={onShowDetail}>{SHOW_MORE}</StyledShowMore>
          )}
          {shouldShowRetry() && <StyledRetry onClick={handleRetry}>{RETRY}</StyledRetry>}
        </StyledTitleWrapper>
        {shouldShowSourceControl && (
          <ReportGrid reportDetails={getSourceControlItems()} errorMessage={errorMessage || getErrorMessage4Github()} />
        )}
        <StyledSpacing />
        <ReportGrid
          reportDetails={getDeploymentFrequencyItems()}
          errorMessage={errorMessage || getErrorMessage4BuildKite()}
        />
        <StyledSpacing />
        <ReportGrid
          reportDetails={getPipelineItems()}
          lastGrid={true}
          errorMessage={errorMessage || getErrorMessage4BuildKite()}
        />
      </StyledMetricsSection>
    </>
  );
};

export default DoraMetrics;
