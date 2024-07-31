import { pipelineMeanTimeToRecoveryMapper } from '@src/hooks/reportMapper/devMeanTimeToRecovery';
import { classificationCardCountMapper } from '@src/hooks/reportMapper/classificationCardCount';
import { pipelineChangeFailureRateMapper } from '@src/hooks/reportMapper/devChangeFailureRate';
import { deploymentFrequencyMapper } from '@src/hooks/reportMapper/deploymentFrequency';
import { leadTimeForChangesMapper } from '@src/hooks/reportMapper/leadTimeForChanges';
import { exportValidityTimeMapper } from '@src/hooks/reportMapper/exportValidityTime';
import { ReportResponse, ReportResponseDTO } from '@src/clients/report/dto/response';
import { classificationMapper } from '@src/hooks/reportMapper/classification';
import { cycleTimeMapper } from '@src/hooks/reportMapper/cycleTime';
import { velocityMapper } from '@src/hooks/reportMapper/velocity';
import reworkMapper from '@src/hooks/reportMapper/reworkMapper';

export const reportMapper = ({
  velocity,
  cycleTime,
  classificationList,
  deploymentFrequency,
  pipelineMeanTimeToRecovery,
  leadTimeForChanges,
  pipelineChangeFailureRate,
  exportValidityTime,
  rework,
}: ReportResponseDTO): ReportResponse => {
  const velocityList = velocity && velocityMapper(velocity);

  const cycleTimeList = cycleTime && cycleTimeMapper(cycleTime);

  const reworkList = rework && reworkMapper(rework);

  const classification = classificationList && classificationMapper(classificationList);

  const deploymentFrequencyList = deploymentFrequency && deploymentFrequencyMapper(deploymentFrequency);

  const pipelineMeanTimeToRecoveryList =
    pipelineMeanTimeToRecovery && pipelineMeanTimeToRecoveryMapper(pipelineMeanTimeToRecovery);

  const leadTimeForChangesList = leadTimeForChanges && leadTimeForChangesMapper(leadTimeForChanges);

  const pipelineChangeFailureRateList =
    pipelineChangeFailureRate && pipelineChangeFailureRateMapper(pipelineChangeFailureRate);

  const exportValidityTimeMin = exportValidityTimeMapper(exportValidityTime);

  const classificationCardCount = classificationList && classificationCardCountMapper(classificationList);

  return {
    velocityList,
    cycleTimeList,
    cycleTime,
    rework,
    reworkList,
    classification,
    deploymentFrequencyList,
    pipelineMeanTimeToRecoveryList,
    leadTimeForChangesList,
    pipelineChangeFailureRateList,
    exportValidityTimeMin,
    classificationCardCount,
  };
};
