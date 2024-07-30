import {
  DefinitionTitle,
  StyledDialogMain,
} from '@src/components/Common/ReportGrid/ReportCard/DoraMetricsDialog/style';
import {
  StyledDialogContainer,
  StyledDialogTitle,
} from '@src/containers/MetricsStep/ReworkSettings/ReworkDialog/style';
import { DORA_METRICS_EXPLAINATION, RequiredData } from '@src/constants/resources';
import { Dialog, DialogContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

const TITLE_FORMULA_MAPPING = {
  [RequiredData.LeadTimeForChanges.toLowerCase()]: '346-lead-time-for-changes-data',
  [RequiredData.DeploymentFrequency.toLowerCase()]: '345-deployment-frequency',
  [RequiredData.PipelineChangeFailureRate.toLowerCase()]: '347-pipeline-change-failure-rate',
  [RequiredData.PipelineMeanTimeToRecovery.toLowerCase()]: '348-pipeline-mean-time-to-recovery',
};

export const DoraMetricsDialog = (props: { isShowDialog: boolean; hiddenDialog: () => void; title: string }) => {
  const { isShowDialog, hiddenDialog, title } = props;

  return (
    <Dialog open={isShowDialog} maxWidth={'md'} onClose={hiddenDialog} aria-label={'dora metrics dialog'}>
      <StyledDialogContainer aria-label={'dora metrics dialog container'}>
        <StyledDialogTitle>
          <p>Dora metrics</p>
          <CloseIcon
            onClick={hiddenDialog}
            aria-label='close'
            sx={{
              '&:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </StyledDialogTitle>
        <DialogContent
          dividers
          sx={{
            padding: '1rem 0',
          }}
        >
          <DefinitionTitle>{title}</DefinitionTitle>
          <div>insight: {DORA_METRICS_EXPLAINATION[title.toLowerCase()].insight}</div>
          <StyledDialogMain aria-label={'definition'}>
            <span>1. Definitions: </span> {DORA_METRICS_EXPLAINATION[title.toLowerCase()].definitions.definition}
            {DORA_METRICS_EXPLAINATION[title.toLowerCase()].definitions.details.map((it, index) => (
              <div key={`definitions-${index}`}>
                1.{index + 1} {it}
              </div>
            ))}
          </StyledDialogMain>

          <StyledDialogMain aria-label={'influenced factors'}>
            <span>2. Influenced factors: </span>
            {DORA_METRICS_EXPLAINATION[title.toLowerCase()]['influenced factors'].details.map((it, index) => (
              <div key={`influenced factors-${index}`}>
                2.{index + 1} {it}
              </div>
            ))}
          </StyledDialogMain>
          <StyledDialogMain aria-label={'formula'}>
            <a
              href={
                'https://github.com/au-heartbeat/Heartbeat?tab=readme-ov-file#' +
                TITLE_FORMULA_MAPPING[title.toLowerCase()]
              }
              target={'_blank'}
              rel='noreferrer'
            >
              3. Formula
            </a>
          </StyledDialogMain>
        </DialogContent>
      </StyledDialogContainer>
    </Dialog>
  );
};
