import {
  DialogContainer,
  StyledCalendarToday,
  StyledDialogContent,
  StyledDialogTitle,
  TimePeriodSelectionMessage,
} from '@src/containers/ReportStep/DownloadDialog/style';
import { Checkbox, Dialog, FormControlLabel, FormGroup } from '@mui/material';
import { DateRangeRequestResult } from '@src/containers/ReportStep';
import CloseIcon from '@mui/icons-material/Close';
import { formatDate } from '@src/utils/util';
import React, { useState } from 'react';

interface DownloadDialogProps {
  isShowDialog: boolean;
  handleClose: () => void;
  dateRangeRequestResults: DateRangeRequestResult[];
}

interface DateRangeRequestCheckItem extends DateRangeRequestResult {
  checked: boolean;
}

export const DownloadDialog = ({ isShowDialog, handleClose, dateRangeRequestResults }: DownloadDialogProps) => {
  const initDateRangeCheckList = dateRangeRequestResults.map((item) => ({ ...item, checked: false }));
  const [dateRangeCheckList, setDateRangeCheckList] = useState<DateRangeRequestCheckItem[]>(initDateRangeCheckList);

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
            {dateRangeCheckList.map(({ startDate, endDate, checked }, index) => (
              <FormControlLabel
                control={<Checkbox checked={checked} onChange={handleChange} name='gilad' key={index} />}
                label={`${formatDate(startDate)} - ${formatDate(endDate)}`}
              />
            ))}
          </FormGroup>
        </StyledDialogContent>
      </DialogContainer>
    </Dialog>
  );
};
