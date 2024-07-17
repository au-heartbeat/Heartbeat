import { ReportDataWithThreeColumns, ReportDataWithTwoColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { MetricsTitle, PIPELINE_STEP, ReportSuffixUnits, SUBTITLE } from '@src/constants/resources';
import ReportForDeploymentFrequency from '@src/components/Common/ReportForDeploymentFrequency';
import ReportForThreeColumns from '@src/components/Common/ReportForThreeColumns';
import { DetailContainer } from '@src/containers/ReportStep/ReportDetail/style';
import ReportForTwoColumns from '@src/components/Common/ReportForTwoColumns';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { reportMapper } from '@src/hooks/reportMapper/report';
import { Optional } from '@src/utils/types';
import { withGoBack } from './withBack';
import React from 'react';

interface Property {
  data: ReportResponseDTO;
  onBack: () => void;
  isShowBack: boolean;
}

const showTwoColumnSection = (title: string, value: Optional<ReportDataWithTwoColumns[]>) =>
  value && <ReportForTwoColumns title={title} data={value} />;

const showDeploymentSection = (title: string, tableTitles: string[], value: Optional<ReportDataWithTwoColumns[]>) =>
  value && <ReportForDeploymentFrequency title={title} tableTitles={tableTitles} data={value} />;

const showThreeColumnSection = (title: string, value: Optional<ReportDataWithThreeColumns[]>) =>
  value && <ReportForThreeColumns title={title} fieldName={PIPELINE_STEP} listName={SUBTITLE} data={value} />;

export const DoraDetail = withGoBack(({ data }: Property) => {
  const mappedData = reportMapper(data);

  return (
    <DetailContainer>
      {showDeploymentSection(
        MetricsTitle.DeploymentFrequency,
        [ReportSuffixUnits.DeploymentsPerDay, ReportSuffixUnits.DeploymentsTimes],
        mappedData.deploymentFrequencyList,
      )}
      {showThreeColumnSection(MetricsTitle.LeadTimeForChanges, mappedData.leadTimeForChangesList)}
      {showTwoColumnSection(MetricsTitle.DevChangeFailureRate, mappedData.devChangeFailureRateList)}
      {showTwoColumnSection(MetricsTitle.DevMeanTimeToRecovery, mappedData.devMeanTimeToRecoveryList)}
    </DetailContainer>
  );
});
