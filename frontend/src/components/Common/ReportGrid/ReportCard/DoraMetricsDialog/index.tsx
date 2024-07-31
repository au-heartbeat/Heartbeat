import {
  DefinitionTitle,
  StyledDialogLi,
  StyledDialogUl,
} from '@src/components/Common/ReportGrid/ReportCard/DoraMetricsDialog/style';
import {
  StyledDialogContainer,
  StyledDialogTitle,
} from '@src/containers/MetricsStep/ReworkSettings/ReworkDialog/style';
import { DORA_METRICS_EXPLANATION, RequiredData } from '@src/constants/resources';
import { Dialog, DialogContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { theme } from '@src/theme';
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
      <StyledDialogContainer
        sx={{
          fontFamily: theme.main.font.secondary,
        }}
        aria-label={'dora metrics dialog container'}
      >
        <StyledDialogTitle
          sx={{
            '& p': {
              fontWeight: 600,
            },
          }}
        >
          <p>DORA Metrics</p>
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
            fontWeight: 'lighter',
            borderBottom: 0,
          }}
        >
          <DefinitionTitle>{title}</DefinitionTitle>
          <div>Insight: {DORA_METRICS_EXPLANATION[title.toLowerCase()].insight}</div>
          <StyledDialogUl>
            <StyledDialogLi aria-label={'definition'}>
              <span>
                Definitions{DORA_METRICS_EXPLANATION[title.toLowerCase()].definitions.definition && ` for '${title}'`}:
              </span>
              {` ${DORA_METRICS_EXPLANATION[title.toLowerCase()].definitions.definition}`}
              <ul>
                {DORA_METRICS_EXPLANATION[title.toLowerCase()].definitions.details.map((it) => (
                  <li key={`definitions-${it}`}>{it}</li>
                ))}
              </ul>
            </StyledDialogLi>
            <StyledDialogLi aria-label={'influenced factors'}>
              <span>Influenced factors: </span>
              <ul>
                {DORA_METRICS_EXPLANATION[title.toLowerCase()]['influenced factors'].details.map((it) => (
                  <li key={`influenced factors-${it}`}>{it}</li>
                ))}
              </ul>
            </StyledDialogLi>
            <StyledDialogLi aria-label={'formula'}>
              <a
                href={
                  'https://github.com/au-heartbeat/Heartbeat?tab=readme-ov-file#' +
                  TITLE_FORMULA_MAPPING[title.toLowerCase()]
                }
                target={'_blank'}
                rel='noreferrer'
              >
                <span>Formula</span>
              </a>
            </StyledDialogLi>
          </StyledDialogUl>
        </DialogContent>
      </StyledDialogContainer>
    </Dialog>
  );
};
