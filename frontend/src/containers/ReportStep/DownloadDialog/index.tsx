import {
  DialogContainer,
  StyledCalendarToday,
  StyledDialogContent,
  StyledDialogTitle,
  TimePeriodSelectionMessage,
} from '@src/containers/ReportStep/DownloadDialog/style';
import { Checkbox, Dialog, FormControlLabel, FormGroup } from '@mui/material';
import { selectDateRange } from '@src/context/config/configSlice';
import { DEFAULT_MESSAGE } from '@src/constants/resources';
import CloseIcon from '@mui/icons-material/Close';
import { sortDateRanges } from '@src/utils/util';
import { useAppSelector } from '@src/hooks';
import React, { useState } from 'react';

interface DownloadDialogProps {
  isShowDialog: boolean;
  handleClose: () => void;
}

export const DownloadDialog = ({ isShowDialog, handleClose }: DownloadDialogProps) => {
  const [timePeriod, setTimePeriod] = useState([{}]);

  return (
    <Dialog open={isShowDialog} maxWidth='md'>
      <DialogContainer>
        <StyledDialogTitle>
          <strong>Export Board Data</strong>
          <CloseIcon onClick={handleClose} />
        </StyledDialogTitle>
        <StyledDialogContent dividers>
          <TimePeriodSelectionMessage>
            <StyledCalendarToday />
            <strong>Select the time period for the exporting data</strong>
          </TimePeriodSelectionMessage>
          {/*<FormGroup>*/}
          {/*  <FormControlLabel*/}
          {/*    control={*/}
          {/*    <Checkbox checked={gilad} onChange={handleChange} name="gilad" />*/}
          {/*  }*/}
          {/*                                label="Gilad Gray"/>*/}
          {/*</FormGroup>*/}
        </StyledDialogContent>
      </DialogContainer>
    </Dialog>
  );
};
