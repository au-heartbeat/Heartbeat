import {
  ReportDataForMultipleValueColumns,
  ReportDataWithTwoColumns,
} from '@src/hooks/reportMapper/reportUIDataStructure';
import { MetricsTitle, PIPELINE_STEP, REPO_NAME, ReportSuffixUnits, SUBTITLE } from '@src/constants/resources';
import ReportDetailTableContainsSubtitle from '@src/components/Common/ReportDetailTableContainsSubtitle';
import ReportForDeploymentFrequency from '@src/components/Common/ReportForDeploymentFrequency';
import { DetailContainer } from '@src/containers/ReportStep/ReportDetail/style';
import ReportForTwoColumns from '@src/components/Common/ReportForTwoColumns';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { reportMapper } from '@src/hooks/reportMapper/report';
import { Optional } from '@src/utils/types';
import { withGoBack } from './withBack';
import React from 'react';

interface Property {
  data: ReportResponseDTO;
  isExistSourceControl: boolean;
  onBack: () => void;
  isShowBack: boolean;
}

const showTwoColumnSection = (title: string, value: Optional<ReportDataWithTwoColumns[]>) =>
  value && <ReportForTwoColumns title={title} data={value} />;

const showDeploymentSection = (title: string, tableTitles: string[], value: Optional<ReportDataWithTwoColumns[]>) =>
  value && <ReportForDeploymentFrequency title={title} tableTitles={tableTitles} data={value} />;

const showThreeColumnSection = (
  title: string,
  isExistSourceControl: boolean,
  value: Optional<ReportDataForMultipleValueColumns[]>,
) =>
  value && (
    <ReportDetailTableContainsSubtitle
      title={title}
      units={[ReportSuffixUnits.Hours]}
      isGray={isExistSourceControl}
      fieldName={isExistSourceControl ? REPO_NAME : PIPELINE_STEP}
      listName={SUBTITLE}
      data={value}
    />
  );

export const DoraDetail = withGoBack(({ data, isExistSourceControl }: Property) => {
  const mappedData = reportMapper(data);

  return (
    <DetailContainer>
      {showDeploymentSection(
        MetricsTitle.DeploymentFrequency,
        [ReportSuffixUnits.DeploymentsPerDay, ReportSuffixUnits.DeploymentsTimes],
        mappedData.deploymentFrequencyList,
      )}
      {showThreeColumnSection(MetricsTitle.LeadTimeForChanges, isExistSourceControl, mappedData.leadTimeForChangesList)}
      {showTwoColumnSection(MetricsTitle.PipelineChangeFailureRate, mappedData.pipelineChangeFailureRateList)}
      {showTwoColumnSection(MetricsTitle.PipelineMeanTimeToRecovery, mappedData.pipelineMeanTimeToRecoveryList)}
    </DetailContainer>
  );
});
