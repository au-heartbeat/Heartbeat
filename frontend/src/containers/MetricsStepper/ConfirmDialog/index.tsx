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

export const ConfirmDialog = (props: { onConfirm: () => void; onClose: () => void; isDialogShowing: boolean }) => {
  const { onConfirm, onClose, isDialogShowing } = props;
  return (
    <Dialog open={isDialogShowing} maxWidth={'md'} onClose={onClose} aria-label={'return to home page confirm dialog'}>
      <StyledDialogContainer>
        <ResetConfirmDialogTitle aria-label={'return to home page confirm dialog title'}>
          <CloseIcon
            onClick={onClose}
            aria-label='return to home page close'
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
        <ResetConfirmDialogContent aria-label={'return to home page confirm dialog content'}>
          All the filled data will be cleared. Continue to Home page?
        </ResetConfirmDialogContent>
        <ResetConfirmDialogButtonGroup>
          <YesButton onClick={onConfirm} aria-label={'return to home page confirm dialog confirm button'}>
            Yes
          </YesButton>
          <CancelButton
            variant='outlined'
            onClick={onClose}
            aria-label={'return to home page confirm dialog cancel button'}
          >
            Cancel
          </CancelButton>
        </ResetConfirmDialogButtonGroup>
      </StyledDialogContainer>
    </Dialog>
  );
};
