import { DateValidationError } from '@mui/x-date-pickers';

export interface IRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  index: number;
  key?: string | number;
  onEndDateError?: (error: DateValidationError, index: number) => void;
  onStartDateError?: (error: DateValidationError, index: number) => void;
  onChange?: (data: { startDate: string | null; endDate: string | null }[], index: number) => void;
}
