import {
  DialogContainer,
  StyledDialogContent,
  StyledDialogTitle,
} from '@src/containers/ReportStep/DownloadDialog/style';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog } from '@mui/material';
import React from 'react';

interface DownloadDialogProps {
  isShowDialog: boolean;
  handleClose: () => void;
}

export const DownloadDialog = ({ isShowDialog, handleClose }: DownloadDialogProps) => {
  return (
    <Dialog open={isShowDialog} maxWidth='md'>
      <DialogContainer>
        <StyledDialogTitle>
          <p>
            <strong>Export Board Data</strong>
          </p>
          <CloseIcon onClick={handleClose} />
        </StyledDialogTitle>
        <StyledDialogContent dividers>hhh</StyledDialogContent>
      </DialogContainer>
    </Dialog>
  );
};
