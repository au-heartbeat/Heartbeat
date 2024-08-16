import {
  ResetConfirmDialogButtonGroup,
  ResetConfirmDialogContent,
  ResetConfirmDialogTitle,
} from '@src/containers/ConfigStep/ResetConfirmDialog/style';
import { StyledDialogContainer } from '@src/containers/MetricsStep/ReworkSettings/ReworkDialog/style';
import { CancelButton, YesButton } from '@src/containers/MetricsStepper/ConfirmDialog/style';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog } from '@mui/material';
import React from 'react';

export const ResetConfirmDialog = (props: { onConfirm: () => void; onClose: () => void; isShowDialog: boolean }) => {
  const { onConfirm, onClose, isShowDialog } = props;
  return (
    <Dialog open={isShowDialog} maxWidth={'md'} onClose={onClose} aria-label={'reset confirm dialog'}>
      <StyledDialogContainer>
        <ResetConfirmDialogTitle aria-label={'reset confirm dialog title'}>
          <CloseIcon
            onClick={onClose}
            aria-label='reset confirm dialog close'
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              '&:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </ResetConfirmDialogTitle>
        <ResetConfirmDialogContent aria-label={'reset confirm dialog content'}>
          Are you sure you want to reset the configurations?
        </ResetConfirmDialogContent>
        <ResetConfirmDialogButtonGroup>
          <CancelButton variant='outlined' onClick={onClose} aria-label={'reset confirm dialog cancel button'}>
            Cancel
          </CancelButton>
          <YesButton onClick={onConfirm} aria-label={'reset confirm dialog confirm button'}>
            Confirm
          </YesButton>
        </ResetConfirmDialogButtonGroup>
      </StyledDialogContainer>
    </Dialog>
  );
};
