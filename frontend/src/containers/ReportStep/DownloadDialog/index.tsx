import {
  DialogContainer,
  StyledCalendarToday,
  StyledDialogContent,
  StyledDialogTitle,
  TimePeriodSelectionMessage,
} from '@src/containers/ReportStep/DownloadDialog/style';
import { Checkbox, Dialog, FormControlLabel, FormGroup } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatDate } from '@src/utils/util';
import React, { useState } from 'react';

interface DownloadDialogProps {
  isShowDialog: boolean;
  handleClose: () => void;
  downloadList: DateRangeItem[];
}

export interface DateRangeItem {
  startDate: string;
  endDate: string;
  disabled: boolean;
}

export const DownloadDialog = ({ isShowDialog, handleClose, downloadList }: DownloadDialogProps) => {
  const [dateRangeCheckList, setDateRangeCheckList] = useState<DateRangeItem[]>([]);

  const handleChange = () => {
    return 0;
  };
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
          <FormGroup>
            {downloadList.map((item, index) => (
              <FormControlLabel
                control={<Checkbox checked={dateRangeCheckList.includes(item)} onChange={handleChange} key={index} />}
                label={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`}
              />
            ))}
          </FormGroup>
        </StyledDialogContent>
      </DialogContainer>
    </Dialog>
  );
};
