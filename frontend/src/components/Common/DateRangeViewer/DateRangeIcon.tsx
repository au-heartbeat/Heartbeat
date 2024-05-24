import { DateRangeFailedIconContainer, StyledCircularProgress } from './style';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckIcon from '@mui/icons-material/Check';

const DateRangeIcon = ({ isLoading, isFailed }: { isLoading: boolean; isFailed: boolean }) => {
  return (
    <DateRangeFailedIconContainer>
      {isLoading && <StyledCircularProgress aria-label={'loading icon in date'} />}
      {!isLoading && isFailed && <PriorityHighIcon color='error' />}
      {!isLoading && !isFailed && <CheckIcon color='success' />}
    </DateRangeFailedIconContainer>
  );
};

export default DateRangeIcon;
